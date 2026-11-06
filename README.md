# Hostel Expense Tracker — Personal Finance Management System for Students

A modern, production-grade, secure full-stack personal finance web application built specifically for college students living in university hostels to manage daily expenses, set budget caps, monitor pocket money, avoid month-end deficits, and achieve personal savings goals.

Designed with a sophisticated dark purple and violet theme, responsive mobile/desktop UI, real-time analytics, automated budget alert thresholds, and an AI-powered spending assistant.

---

## 🌟 Key Features

### 1. Financial Dashboard (`/dashboard`)
- **4 Real-Time Summary Cards**:
  - **Monthly Budget** (default or custom limit with progress tracking)
  - **Total Spending** (real-time aggregation from MongoDB)
  - **Remaining Budget** (with daily safe spending allowance recommendation)
  - **Today's Spending** (day-level monitoring vs daily limit)
- **Visual Charts** (powered by Recharts):
  - Category-wise spending donut/pie chart with percentage breakdowns
  - Daily spending bar chart with daily average indicators
  - 6-month historical spending trend line chart
- **Recent Transactions Stream** with category badges and payment methods
- **Month & Year Selector** for historical monthly analysis
- **Quick Add Expense** accessible from anywhere
- **One-Click Demo Data Seeder** for test-driving rich analytics instantly

### 2. Expense Management (`/expenses`)
- Full **CRUD** functionality (Create, Read, Update, Delete)
- **Hostel-Tailored Categories**: `Food`, `Snacks`, `Travel`, `Shopping`, `Education`, `Entertainment`, `Personal`, `Other`
- **Payment Method Tracking**: `UPI`, `Cash`, `Debit Card`, `Credit Card`, `Other`
- **Instant Search**: Search across titles and notes
- **Multi-Filter & Sorting**:
  - Filter by category, payment method, and custom date range
  - Sort by date (newest/oldest) or amount (highest/lowest)
  - Filtered total calculation
- **Pagination**: Smooth pagination controls
- **Data Export**: Export expenses to CSV for auditing or sharing with parents/wardens

### 3. Budget Management & Thresholds (`/budget`)
- **Configurable Limits**: Set daily spending cap (e.g., ₹300) and monthly budget (e.g., ₹8,000)
- **Precise Financial Formulas**:
  - $\text{Remaining Budget} = \text{Budget} - \text{Total Spending}$
  - $\text{Usage Percentage} = (\frac{\text{Total Spending}}{\text{Budget}}) \times 100$
- **Dynamic Status Gauges**:
  - **Normal** (0% – 69%): Safe spending pace
  - **Warning** (70% – 89%): Warning generated to curb non-essential expenses
  - **Danger** (90% – 99%): Critical budget alert; recommended essentials only
  - **Exceeded** (100%+): Overrun alert with exact overspent amount

### 4. Low-Budget Alert & Notification Engine
- Threshold detection at **70%**, **90%**, and **100%+**
- Persistent alert banners on Dashboard and Budget pages
- Header notification bell with live unread counter, dropdown menu, mark read, and dismissal
- Duplicate prevention (one notification per user per threshold per month)

### 5. Deep Analytics Module (`/analytics`)
- **Category Analysis Table**: Detailed breakdown by transaction count, sum, and percentage share
- **Spending Insights**:
  - Highest spending category
  - Highest spending day
  - Daily spending average
  - Month-over-month comparison (difference in ₹ and %)
- **Date Filters**: Current month, Previous month, and Custom date range

### 6. Savings Goals Module (`/savings`)
- Set savings goals (e.g., "Acoustic Guitar", "Trip Home", "Semester Books")
- Formula: $\text{Remaining Savings} = \text{Target Amount} - \text{Saved Amount}$
- Track progress percentages with visual bars and target date countdowns
- Log incremental contributions with optional notes
- Guardrail preventing accidental over-deposits without explicit user confirmation
- Automatic goal completion celebration & notification

### 7. AI Spending Assistant (`/ai-assistant`)
- Powered by **Google Gemini API** (`@google/generative-ai`) with intelligent heuristic fallback engine
- Strict security: API keys are never exposed to the client; all insights are calculated server-side from authentic user metrics
- Empathetic hostel senior persona with actionable advice (mess vs delivery, sharing auto rides, buying snacks in bulk)
- Interactive chat UI with quick-prompt suggestions

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS, React Router DOM v7, Axios, Lucide React, Recharts |
| **Backend** | Node.js, Express.js (REST API, Helmet, CORS, Express-Rate-Limit, Morgan) |
| **Database** | MongoDB Atlas / Mongoose (with In-Memory MongoDB zero-config development fallback) |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs password hashing |
| **Testing** | Jest, Supertest, MongoMemoryServer |
| **Deployment** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |

---

## 🎨 UI/UX Design System

- **Color Palette**:
  - Main Background: `#0B0B12`
  - Sidebar Background: `#11111B`
  - Card Background: `#171725`
  - Card Hover: `#1E1E30`
  - Subtle Border: `#232338`
  - Primary Purple: `#8B5CF6`
  - Secondary Purple: `#A78BFA`
  - Success Green: `#22C55E`
  - Warning Yellow: `#F59E0B`
  - Danger Red: `#EF4444`
  - Main Text: `#F8FAFC`
  - Secondary Text: `#94A3B8`
- **Typography**: Inter (Google Fonts)
- **Currency**: Indian Rupee (`₹`)
- **Timezone**: Asia/Kolkata (`en-IN`)

---

## 📂 Project Directory Structure

```
hostel-expense-tracker/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── AddExpenseModal.jsx
│   │   │   ├── AlertBanner.jsx
│   │   │   ├── CategoryBadge.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── StatCard.jsx
│   │   ├── context/            # Global state contexts
│   │   │   ├── AuthContext.jsx
│   │   │   └── NotificationContext.jsx
│   │   ├── layouts/            # Dashboard layout
│   │   │   └── DashboardLayout.jsx
│   │   ├── pages/              # Main route views
│   │   │   ├── AIAssistantPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   ├── BudgetPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ExpensesPage.jsx
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   └── SavingsPage.jsx
│   │   ├── services/           # Axios API instance
│   │   │   └── api.js
│   │   ├── utils/              # Formatters & category constants
│   │   │   └── formatters.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vercel.json             # Vercel SPA routing
│   ├── vite.config.js
│   └── .env.example
│
├── server/                     # Backend API (Node.js + Express)
│   ├── config/
│   │   └── db.js               # MongoDB connection with memory fallback
│   ├── controllers/
│   │   ├── aiController.js
│   │   ├── analyticsController.js
│   │   ├── authController.js
│   │   ├── budgetController.js
│   │   ├── expenseController.js
│   │   ├── notificationController.js
│   │   └── savingsController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT verification middleware
│   │   ├── errorHandler.js     # Centralized error handler
│   │   └── validate.js         # Zod validation middleware
│   ├── models/
│   │   ├── Budget.js
│   │   ├── Expense.js
│   │   ├── Notification.js
│   │   ├── SavingsGoal.js
│   │   └── User.js
│   ├── routes/
│   │   ├── aiRoutes.js
│   │   ├── analyticsRoutes.js
│   │   ├── authRoutes.js
│   │   ├── budgetRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── savingsRoutes.js
│   ├── services/
│   │   ├── aiService.js        # Gemini AI & heuristic advisor
│   │   └── alertService.js     # 70%, 90%, 100% threshold engine
│   ├── tests/
│   │   └── api.test.js         # Comprehensive integration test suite
│   ├── app.js                  # Express app setup
│   ├── server.js               # Entry point & port listener
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── package.json                # Root workspace orchestration
├── render.yaml                 # Render deployment descriptor
├── .gitignore
└── README.md
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- (Optional) MongoDB Atlas account or local MongoDB. *If not provided, the server automatically starts an In-Memory MongoDB instance for seamless instant local testing!*

### 1. Clone & Install Dependencies

```bash
# In the project root directory
npm run install:all
```

Or install separately:
```bash
cd server && npm install
cd ../client && npm install
```

### 2. Configure Environment Variables

**Backend (`server/.env`):**
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/hostel-expenses
JWT_SECRET=your_secure_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_optional_gemini_api_key_here
```

**Frontend (`client/.env`):**
```env
VITE_API_URL=http://localhost:5000/api
```
*(In local development with Vite proxy, you can also leave `VITE_API_URL` empty to proxy `/api` automatically).*

### 3. Run Backend & Frontend

Open two terminal tabs:

**Terminal 1 (Backend):**
```bash
cd server
npm run dev
# Server will run on http://localhost:5000
```

**Terminal 2 (Frontend):**
```bash
cd client
npm run dev
# Vite client will run on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser.

---

## 🧪 Automated Test Suite

Run the full integration test suite covering Authentication, Expenses, Budgets, Alert Thresholds, Analytics, and Savings:

```bash
cd server
npm test
```

### Test Results Summary:
```
PASS tests/api.test.js
  Hostel Expense Tracker API Suite
    Health Check
      ✓ GET /api/health should return online status
    Authentication Module
      ✓ should register a new student user and return a JWT token
      ✓ should reject registration with duplicate email
      ✓ should successfully log in an existing student
      ✓ should reject login with wrong password
      ✓ should reject unauthorized access without JWT token
    Expense Management Module & Alerts
      ✓ should create an expense and trigger warning when reaching 70%
      ✓ should reject expense with amount <= 0
      ✓ should update and delete an expense
      ✓ should trigger danger and exceeded alerts at 90% and 100%
    Budget & Analytics Module
      ✓ should return budget calculation with correct remaining and usage percent
      ✓ should return analytics summary with category breakdown
    Savings Goals Module
      ✓ should create goal and mark as completed when contribution reaches target

Test Suites: 1 passed, 1 total
Tests:       13 passed, 13 total
```

---

## 🚀 Production Deployment Guide

### A. Deploy Backend to Render

1. Push your repository to **GitHub**.
2. Sign in to [Render](https://render.com) and create a **New Web Service**.
3. Select your repository.
4. Set the following build settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `PORT`: `5000`
   - `MONGODB_URI`: *Your MongoDB Atlas connection string (e.g. `mongodb+srv://...`)*
   - `JWT_SECRET`: *A strong random 32+ character secret*
   - `CLIENT_URL`: *Your Vercel frontend URL (e.g. `https://hostel-expense-tracker.vercel.app`)*
   - `GEMINI_API_KEY`: *(Optional) Your Google Gemini API Key*
6. Click **Create Web Service**. Note your Render service URL (e.g., `https://hostel-expense-api.onrender.com`).

### B. Deploy Frontend to Vercel

1. Sign in to [Vercel](https://vercel.com) and click **Add New Project**.
2. Import your GitHub repository.
3. Configure the project settings:
   - **Root Directory**: `client`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://hostel-expense-api.onrender.com/api`
5. Click **Deploy**.
6. Vercel will build and deploy the application. `client/vercel.json` already contains SPA route rewrites to support deep linking on `/dashboard`, `/expenses`, `/budget`, etc.

### C. Connect MongoDB Atlas

1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user with read/write privileges.
3. In Network Access, allow access from anywhere (`0.0.0.0/0`) or whitelist Render's IP addresses.
4. Copy the connection string and paste it into Render's `MONGODB_URI` environment variable.

---

## 🔒 Security Measures

- **No Plaintext Passwords**: Passwords hashed with `bcryptjs` (salt factor 10).
- **JWT Protection**: All private API endpoints enforce `protect` middleware verifying tokens.
- **Strict Data Isolation**: Every MongoDB query scopes by `userId: req.user._id` extracted from the verified token. Users can never access or modify another student's expenses or budgets.
- **Rate Limiting**: `express-rate-limit` prevents brute-force attacks on `/api/auth/login` and `/api/auth/register`.
- **HTTP Headers**: `helmet` enforces secure HTTP response headers.
- **CORS Protection**: Restricted in production to trusted origins.
- **Safe Environment Handling**: `.gitignore` strictly protects `.env` secrets from ever being committed to source control.

