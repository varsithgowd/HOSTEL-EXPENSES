import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { jest } from '@jest/globals';
import app from '../app.js';
import User from '../models/User.js';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import SavingsGoal from '../models/SavingsGoal.js';
import Notification from '../models/Notification.js';

let mongoServer;

jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 30000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
}, 30000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Hostel Expense Tracker API Suite', () => {
  describe('Health Check', () => {
    it('GET /api/health should return online status', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body.status).toBe('online');
    });
  });

  describe('Authentication Module', () => {
    const testUser = {
      name: 'Aman Sharma',
      email: 'aman.hostel@college.edu',
      password: 'password123',
    };

    it('should register a new student user and return a JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.email).toBe(testUser.email);
    });

    it('should reject registration with duplicate email', async () => {
      await request(app).post('/api/auth/register').send(testUser);
      const res = await request(app).post('/api/auth/register').send(testUser);

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should successfully log in an existing student', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: testUser.password });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      await request(app).post('/api/auth/register').send(testUser);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: testUser.email, password: 'wrongpassword' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid/i);
    });

    it('should reject unauthorized access without JWT token', async () => {
      const res = await request(app).get('/api/expenses');
      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Forgot & Reset Password Module', () => {
    const studentUser = {
      name: 'Rohan Gupta',
      email: 'rohan.gupta@hostel.edu',
      password: 'initialPassword123',
    };

    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(studentUser);
    });

    it('should handle forgot-password with registered email and store hashed token', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: studentUser.email });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/password reset link has been sent/i);

      // Verify token in database
      const user = await User.findOne({ email: studentUser.email }).select('+resetPasswordToken +resetPasswordExpire');
      expect(user.resetPasswordToken).toBeDefined();
      expect(user.resetPasswordExpire).toBeDefined();
      expect(user.resetPasswordExpire.getTime()).toBeGreaterThan(Date.now());
    });

    it('should handle forgot-password with unregistered email without revealing user existence', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent.student@hostel.edu' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/password reset link has been sent/i);
    });

    it('should reject reset-password with invalid token', async () => {
      const res = await request(app)
        .post('/api/auth/reset-password/invalidtoken12345')
        .send({ password: 'newPassword123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid or expired/i);
    });

    it('should reject reset-password with expired token', async () => {
      const user = await User.findOne({ email: studentUser.email });
      const rawToken = user.getResetPasswordToken();
      // Set expiry in the past
      user.resetPasswordExpire = Date.now() - 60000;
      await user.save({ validateBeforeSave: false });

      const res = await request(app)
        .post(`/api/auth/reset-password/${rawToken}`)
        .send({ password: 'newPassword123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid or expired/i);
    });

    it('should reject reset-password if password is less than 6 characters', async () => {
      const user = await User.findOne({ email: studentUser.email });
      const rawToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      const res = await request(app)
        .post(`/api/auth/reset-password/${rawToken}`)
        .send({ password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/at least 6 characters/i);
    });

    it('should successfully reset password, allow new password login, and reject old password', async () => {
      const user = await User.findOne({ email: studentUser.email });
      const rawToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });

      const newPassword = 'brandNewPassword999';

      // 1. Reset password
      const resetRes = await request(app)
        .post(`/api/auth/reset-password/${rawToken}`)
        .send({ password: newPassword });

      expect(resetRes.statusCode).toBe(200);
      expect(resetRes.body.success).toBe(true);
      expect(resetRes.body.message).toMatch(/password reset successful/i);

      // 2. Token must be invalidated in DB
      const updatedUser = await User.findOne({ email: studentUser.email }).select('+resetPasswordToken +resetPasswordExpire');
      expect(updatedUser.resetPasswordToken).toBeUndefined();
      expect(updatedUser.resetPasswordExpire).toBeUndefined();

      // 3. Re-using the same token must fail
      const reuseRes = await request(app)
        .post(`/api/auth/reset-password/${rawToken}`)
        .send({ password: 'anotherPassword123' });
      expect(reuseRes.statusCode).toBe(400);

      // 4. Login with old password must fail
      const oldLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: studentUser.email, password: studentUser.password });

      expect(oldLoginRes.statusCode).toBe(401);
      expect(oldLoginRes.body.success).toBe(false);

      // 5. Login with new password must succeed
      const newLoginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: studentUser.email, password: newPassword });

      expect(newLoginRes.statusCode).toBe(200);
      expect(newLoginRes.body.success).toBe(true);
      expect(newLoginRes.body.token).toBeDefined();
    });
  });

  describe('Expense Management Module & Alerts', () => {
    let token;
    let userId;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Rahul Verma',
        email: 'rahul.verma@hostel.in',
        password: 'password123',
      });
      token = res.body.token;
      userId = res.body.user.id;

      // Update budget: ₹1000 monthly, ₹100 daily
      const now = new Date();
      await Budget.findOneAndUpdate(
        { userId, month: now.getMonth() + 1, year: now.getFullYear() },
        { monthlyLimit: 1000, dailyLimit: 100 },
        { upsert: true, new: true }
      );
    });

    it('should create an expense and trigger warning when reaching 70%', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Canteen Meal & Snacks',
          amount: 750,
          category: 'Food',
          paymentMethod: 'UPI',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.expense.amount).toBe(750);

      // Verify alert triggered for 70% threshold
      expect(res.body.alerts).toBeDefined();
      const warningAlert = res.body.alerts.find((a) => a.type === 'warning');
      expect(warningAlert).toBeDefined();
      expect(warningAlert.message).toMatch(/70%|75%/i);
    });

    it('should reject expense with amount <= 0', async () => {
      const res = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Free water',
          amount: 0,
          category: 'Food',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should update and delete an expense', async () => {
      const createRes = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Bus Pass',
          amount: 150,
          category: 'Travel',
        });

      const expenseId = createRes.body.expense._id;

      // Update
      const updateRes = await request(app)
        .put(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 180, title: 'Updated Bus Pass' });

      expect(updateRes.statusCode).toBe(200);
      expect(updateRes.body.expense.amount).toBe(180);
      expect(updateRes.body.expense.title).toBe('Updated Bus Pass');

      // Delete
      const deleteRes = await request(app)
        .delete(`/api/expenses/${expenseId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(deleteRes.statusCode).toBe(200);
      expect(deleteRes.body.success).toBe(true);
    });

    it('should trigger danger and exceeded alerts at 90% and 100%', async () => {
      // Add 920 expense -> 92% of ₹1000
      const res90 = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Semester Textbooks',
          amount: 920,
          category: 'Education',
        });

      expect(res90.body.alerts.some((a) => a.type === 'danger')).toBe(true);

      // Add another 100 expense -> 1020 total -> exceeded 100%
      const res100 = await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Hostel Night Tea',
          amount: 100,
          category: 'Snacks',
        });

      expect(res100.body.alerts.some((a) => a.type === 'exceeded')).toBe(true);
    });
  });

  describe('Budget & Analytics Module', () => {
    let token;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Priya Patel',
        email: 'priya.patel@hostel.in',
        password: 'password123',
      });
      token = res.body.token;
    });

    it('should return budget calculation with correct remaining and usage percent', async () => {
      // Set budget: ₹5000 monthly, ₹250 daily
      await request(app)
        .post('/api/budgets')
        .set('Authorization', `Bearer ${token}`)
        .send({ monthlyLimit: 5000, dailyLimit: 250 });

      // Add expense ₹1000
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Groceries & Milk',
          amount: 1000,
          category: 'Food',
        });

      const budgetRes = await request(app)
        .get('/api/budgets/current')
        .set('Authorization', `Bearer ${token}`);

      expect(budgetRes.statusCode).toBe(200);
      expect(budgetRes.body.budget.monthlyLimit).toBe(5000);
      expect(budgetRes.body.budget.totalMonthlySpent).toBe(1000);
      expect(budgetRes.body.budget.remainingMonthly).toBe(4000);
      expect(budgetRes.body.budget.monthlyUsagePercent).toBe(20);
      expect(budgetRes.body.budget.monthlyStatus).toBe('Normal');
    });

    it('should return analytics summary with category breakdown', async () => {
      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Mess Bill', amount: 2000, category: 'Food' });

      await request(app)
        .post('/api/expenses')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Hostel WiFi Contribution', amount: 500, category: 'Personal' });

      const analyticsRes = await request(app)
        .get('/api/analytics/summary')
        .set('Authorization', `Bearer ${token}`);

      expect(analyticsRes.statusCode).toBe(200);
      expect(analyticsRes.body.data.totalSpent).toBe(2500);
      expect(analyticsRes.body.data.highestCategory.category).toBe('Food');
    });
  });

  describe('Savings Goals Module', () => {
    let token;

    beforeEach(async () => {
      const res = await request(app).post('/api/auth/register').send({
        name: 'Siddharth Roy',
        email: 'sid.roy@hostel.in',
        password: 'password123',
      });
      token = res.body.token;
    });

    it('should create goal and mark as completed when contribution reaches target', async () => {
      const createRes = await request(app)
        .post('/api/savings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Acoustic Guitar',
          targetAmount: 5000,
          savedAmount: 4000,
          deadline: '2026-12-31',
        });

      expect(createRes.statusCode).toBe(201);
      const goalId = createRes.body.goal._id;

      // Contribute remaining 1000
      const contributeRes = await request(app)
        .post(`/api/savings/${goalId}/contribute`)
        .set('Authorization', `Bearer ${token}`)
        .send({ amount: 1000, note: 'Saved from semester stipend' });

      expect(contributeRes.statusCode).toBe(200);
      expect(contributeRes.body.goal.savedAmount).toBe(5000);
      expect(contributeRes.body.goal.status).toBe('completed');
      expect(contributeRes.body.completedJustNow).toBe(true);
    });
  });
});
