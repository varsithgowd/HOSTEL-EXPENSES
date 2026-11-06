import Notification from '../models/Notification.js';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';

export const checkAndGenerateAlerts = async (userId, customDate = new Date()) => {
  try {
    const targetDate = new Date(customDate);
    const month = targetDate.getMonth() + 1;
    const year = targetDate.getFullYear();
    const period = `${year}-${String(month).padStart(2, '0')}`;

    // Get current month budget
    const budget = await Budget.findOne({ userId, month, year });
    if (!budget || budget.monthlyLimit <= 0) {
      return [];
    }

    // Calculate total spending for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalSpent = monthlyExpenses.length > 0 ? monthlyExpenses[0].total : 0;
    const monthlyLimit = budget.monthlyLimit;
    const remainingBudget = Math.max(0, monthlyLimit - totalSpent);
    const usagePercent = Math.round((totalSpent / monthlyLimit) * 100);

    const alerts = [];

    // Monthly threshold checks: 70%, 90%, 100%
    if (usagePercent >= 100) {
      const overspent = totalSpent - monthlyLimit;
      const message = `Alert! You have exceeded your monthly budget of ₹${monthlyLimit.toLocaleString('en-IN')} by ₹${overspent.toLocaleString('en-IN')}.`;
      
      const existing = await Notification.findOne({
        userId,
        period,
        threshold: 100,
      });

      if (!existing) {
        await Notification.create({
          userId,
          type: 'exceeded',
          title: 'Monthly Budget Exceeded',
          message,
          threshold: 100,
          period,
        });
      }
      alerts.push({
        type: 'exceeded',
        title: 'Monthly Budget Exceeded',
        message,
        usagePercent,
        remainingBudget: 0,
      });
    } else if (usagePercent >= 90) {
      const message = `Danger! You have spent ${usagePercent}% of your monthly budget. Only ₹${remainingBudget.toLocaleString('en-IN')} remains.`;
      
      const existing = await Notification.findOne({
        userId,
        period,
        threshold: 90,
      });

      if (!existing) {
        await Notification.create({
          userId,
          type: 'danger',
          title: '90% Budget Limit Reached',
          message,
          threshold: 90,
          period,
        });
      }
      alerts.push({
        type: 'danger',
        title: 'Critical Budget Alert',
        message,
        usagePercent,
        remainingBudget,
      });
    } else if (usagePercent >= 70) {
      const message = `Warning! You have spent ${usagePercent}% of your monthly budget. Only ₹${remainingBudget.toLocaleString('en-IN')} remains.`;
      
      const existing = await Notification.findOne({
        userId,
        period,
        threshold: 70,
      });

      if (!existing) {
        await Notification.create({
          userId,
          type: 'warning',
          title: '70% Budget Limit Reached',
          message,
          threshold: 70,
          period,
        });
      }
      alerts.push({
        type: 'warning',
        title: 'Budget Warning',
        message,
        usagePercent,
        remainingBudget,
      });
    }

    // Daily Limit check
    if (budget.dailyLimit > 0) {
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const todayExpenses = await Expense.aggregate([
        {
          $match: {
            userId,
            date: { $gte: startOfDay, $lte: endOfDay },
          },
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
          },
        },
      ]);

      const todaySpent = todayExpenses.length > 0 ? todayExpenses[0].total : 0;
      if (todaySpent > budget.dailyLimit) {
        const dailyOver = todaySpent - budget.dailyLimit;
        alerts.push({
          type: 'danger',
          title: 'Daily Limit Exceeded',
          message: `Today's spending is ₹${todaySpent.toLocaleString('en-IN')}, exceeding your daily limit of ₹${budget.dailyLimit.toLocaleString('en-IN')} by ₹${dailyOver.toLocaleString('en-IN')}.`,
          usagePercent: Math.round((todaySpent / budget.dailyLimit) * 100),
          remainingBudget: 0,
        });
      }
    }

    return alerts;
  } catch (error) {
    console.error('[AlertService] Error checking alerts:', error);
    return [];
  }
};

