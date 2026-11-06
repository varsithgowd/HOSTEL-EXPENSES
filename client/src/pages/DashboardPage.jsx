import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  Wallet,
  TrendingDown,
  TrendingUp,
  CreditCard,
  Clock,
  ArrowRight,
  Plus,
  Calendar,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Utensils,
  Receipt,
  Layers,
  PiggyBank,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';

import api from '../services/api';
import StatCard from '../components/StatCard';
import CategoryBadge from '../components/CategoryBadge';
import AlertBanner from '../components/AlertBanner';
import { formatCurrency, formatDate, formatRelativeDate, CATEGORY_CONFIG } from '../utils/formatters';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const DashboardPage = () => {
  const { refreshKey, triggerRefresh } = useOutletContext() || {};

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [seeding, setSeeding] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumRes, catRes, dailyRes, trendRes, budgetRes] = await Promise.all([
        api.get(`/analytics/summary?month=${selectedMonth}&year=${selectedYear}`),
        api.get(`/analytics/categories?month=${selectedMonth}&year=${selectedYear}`),
        api.get(`/analytics/daily?month=${selectedMonth}&year=${selectedYear}`),
        api.get('/analytics/monthly'),
        api.get(`/budgets/current?month=${selectedMonth}&year=${selectedYear}`),
      ]);

      if (sumRes.data.success) {
        setSummary(sumRes.data.data);
      }
      if (catRes.data.success) {
        setCategoryData(catRes.data.categories);
      }
      if (dailyRes.data.success) {
        setDailyData(dailyRes.data.daily);
      }
      if (trendRes.data.success) {
        setMonthlyTrends(trendRes.data.trends);
      }
      if (budgetRes.data.success && budgetRes.data.alerts) {
        setAlerts(budgetRes.data.alerts);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refreshKey]);

  const handleSeedDemoData = async () => {
    setSeeding(true);
    try {
      await api.post('/expenses/seed-demo');
      if (triggerRefresh) triggerRefresh();
      fetchDashboardData();
    } catch (err) {
      console.error('Error seeding demo data:', err);
    } finally {
      setSeeding(false);
    }
  };

  const budgetInfo = summary?.budget || {
    monthlyLimit: 8000,
    dailyLimit: 300,
    remainingBudget: 8000,
    budgetUsagePercent: 0,
  };

  const totalSpent = summary?.totalSpent || 0;
  const todaySpent = summary?.todaySpent || 0;
  const remainingBudget = budgetInfo.remainingBudget;
  const usagePercent = budgetInfo.budgetUsagePercent;

  // Pie chart custom colors
  const pieColors = categoryData.map(
    (c) => CATEGORY_CONFIG[c.name]?.color || '#8B5CF6'
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner: Month Selector & Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
            Financial Dashboard
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Real-time hostel cash flow and monthly expense overview
          </p>
        </div>

        {/* Month & Year Filter */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-bg-card border border-border-subtle rounded-xl px-3 py-1.5 text-xs text-text-main">
            <Calendar className="w-3.5 h-3.5 text-brand-purpleLight" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-text-main focus:outline-none cursor-pointer"
            >
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx + 1} className="bg-bg-card text-text-main">
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-xs font-semibold text-text-main focus:outline-none cursor-pointer ml-1"
            >
              {[now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1].map((y) => (
                <option key={y} value={y} className="bg-bg-card text-text-main">
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={fetchDashboardData}
            title="Refresh Data"
            className="p-2 rounded-xl bg-bg-card border border-border-subtle hover:bg-bg-cardHover text-text-secondary hover:text-text-main transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Alert Banners (70%, 90%, 100% threshold) */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <AlertBanner key={idx} alert={alert} />
          ))}
        </div>
      )}

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Monthly Budget */}
        <StatCard
          title="Monthly Budget"
          value={formatCurrency(budgetInfo.monthlyLimit)}
          subtitle={`${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`}
          icon={Wallet}
          color="purple"
          badge={{
            text: `Limit: ₹${budgetInfo.monthlyLimit}`,
            className: 'bg-brand-purple/15 text-brand-purpleLight',
          }}
        />

        {/* Card 2: Total Monthly Spending */}
        <StatCard
          title="Total Spending"
          value={formatCurrency(totalSpent)}
          subtitle={`${usagePercent}% of monthly limit`}
          icon={TrendingDown}
          color={usagePercent >= 100 ? 'red' : usagePercent >= 70 ? 'yellow' : 'purple'}
          progress={usagePercent}
          badge={{
            text: usagePercent >= 100 ? 'Exceeded' : usagePercent >= 70 ? 'Warning' : 'Normal',
            className:
              usagePercent >= 100
                ? 'bg-status-danger/15 text-status-danger'
                : usagePercent >= 70
                ? 'bg-status-warning/15 text-status-warning'
                : 'bg-status-success/15 text-status-success',
          }}
        />

        {/* Card 3: Remaining Budget */}
        <StatCard
          title="Remaining Budget"
          value={formatCurrency(remainingBudget)}
          subtitle={
            remainingBudget <= 0
              ? 'Overspent limit!'
              : `₹${Math.round(remainingBudget / 30)} safe daily allowance`
          }
          icon={PiggyBank}
          color={remainingBudget <= 0 ? 'red' : 'green'}
          badge={{
            text: `${Math.max(0, 100 - usagePercent)}% Left`,
            className: 'bg-status-success/15 text-status-success',
          }}
        />

        {/* Card 4: Today's Spending */}
        <StatCard
          title="Today's Spending"
          value={formatCurrency(todaySpent)}
          subtitle={`Daily Limit: ₹${budgetInfo.dailyLimit}`}
          icon={Clock}
          color={todaySpent > budgetInfo.dailyLimit ? 'red' : 'blue'}
          badge={{
            text: todaySpent > budgetInfo.dailyLimit ? 'Over Daily Cap' : 'Within Cap',
            className:
              todaySpent > budgetInfo.dailyLimit
                ? 'bg-status-danger/15 text-status-danger'
                : 'bg-blue-500/15 text-blue-400',
          }}
        />
      </div>

      {/* Main Charts Row: Pie Chart & Daily Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Category-wise Pie Chart (2 cols on lg) */}
        <div className="glass-card p-5 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-text-main">Category Breakdown</h3>
                <p className="text-[11px] text-text-muted">Where your money was spent</p>
              </div>
              <span className="text-xs font-semibold text-brand-purpleLight">
                {categoryData.length} Categories
              </span>
            </div>

            {categoryData.length === 0 ? (
              <div className="h-60 flex flex-col items-center justify-center text-center p-4">
                <Utensils className="w-10 h-10 text-brand-purple/30 mb-2" />
                <p className="text-xs text-text-muted">No expenses recorded for this month.</p>
                <button
                  onClick={handleSeedDemoData}
                  disabled={seeding}
                  className="mt-3 text-xs font-semibold text-brand-purpleLight hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {seeding ? 'Adding Demo Data...' : 'Seed Sample Hostel Data'}
                </button>
              </div>
            ) : (
              <div className="h-56 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="total"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_CONFIG[entry.name]?.color || '#8B5CF6'}
                          stroke="#171725"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      formatter={(val) => formatCurrency(val)}
                      contentStyle={{
                        backgroundColor: '#171725',
                        borderColor: '#33334F',
                        borderRadius: '0.75rem',
                        fontSize: '12px',
                        color: '#F8FAFC',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category Legend list */}
          {categoryData.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border-subtle max-h-36 overflow-y-auto space-y-2">
              {categoryData.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: CATEGORY_CONFIG[cat.name]?.color || '#8B5CF6' }}
                    />
                    <span className="text-text-secondary">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2 font-medium">
                    <span className="text-text-main">{formatCurrency(cat.total)}</span>
                    <span className="text-[10px] text-text-muted w-8 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily Spending Bar Chart (3 cols on lg) */}
        <div className="glass-card p-5 lg:col-span-3 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-main">Daily Spending Pattern</h3>
              <p className="text-[11px] text-text-muted">Day-by-day expense distribution</p>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-text-main">
                Avg: {formatCurrency(summary?.averageDailyExpense || 0)} / day
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            {dailyData.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <Receipt className="w-10 h-10 text-brand-purple/30 mb-2" />
                <p className="text-xs text-text-muted">No daily spending recorded yet.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232338" vertical={false} />
                  <XAxis
                    dataKey="date"
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={11}
                    tickLine={false}
                    tickFormatter={(val) => `₹${val}`}
                  />
                  <RechartsTooltip
                    formatter={(val) => [formatCurrency(val), 'Amount']}
                    contentStyle={{
                      backgroundColor: '#171725',
                      borderColor: '#33334F',
                      borderRadius: '0.75rem',
                      fontSize: '12px',
                      color: '#F8FAFC',
                    }}
                  />
                  <Bar
                    dataKey="amount"
                    fill="#8B5CF6"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Bottom Insights row */}
          {summary?.highestDay && (
            <div className="mt-4 pt-3 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
              <span>
                Highest single day:{' '}
                <strong className="text-text-main">{formatDate(summary.highestDay.date)}</strong>
              </span>
              <span className="text-brand-purpleLight font-bold">
                {formatCurrency(summary.highestDay.amount)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Trend Line Chart */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-text-main">Monthly Spending Trends</h3>
            <p className="text-[11px] text-text-muted">Past 6 months spending progression</p>
          </div>
          <Link
            to="/analytics"
            className="text-xs font-semibold text-brand-purpleLight hover:underline flex items-center gap-1"
          >
            Detailed Analytics <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="h-56 w-full">
          {monthlyTrends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-text-muted">
              Trends will appear as you record expenses across months.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#232338" vertical={false} />
                <XAxis dataKey="month" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `₹${val}`}
                />
                <RechartsTooltip
                  formatter={(val) => [formatCurrency(val), 'Spent']}
                  contentStyle={{
                    backgroundColor: '#171725',
                    borderColor: '#33334F',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#F8FAFC',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#A78BFA"
                  strokeWidth={3}
                  dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#8B5CF6', stroke: '#F8FAFC', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Transactions & Quick Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions (2 cols on lg) */}
        <div className="glass-card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-text-main">Recent Transactions</h3>
              <p className="text-[11px] text-text-muted">Latest 5 logged expenses</p>
            </div>
            <Link
              to="/expenses"
              className="text-xs font-semibold text-brand-purpleLight hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border-subtle">
            {!summary?.recentTransactions || summary.recentTransactions.length === 0 ? (
              <div className="py-8 text-center text-xs text-text-muted">
                No recent transactions found. Click "+ Add Expense" above to add your first!
              </div>
            ) : (
              summary.recentTransactions.map((tx) => (
                <div key={tx._id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-bg-cardHover border border-border-subtle flex items-center justify-center shrink-0">
                      <Receipt className="w-4 h-4 text-brand-purpleLight" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-text-main truncate">
                        {tx.title}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] text-text-muted">
                          {formatRelativeDate(tx.date)}
                        </span>
                        <span className="text-[10px] text-text-muted">•</span>
                        <span className="text-[10px] text-text-secondary">{tx.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <CategoryBadge category={tx.category} />
                    <span className="text-xs font-bold text-text-main">
                      {formatCurrency(tx.amount)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Insights & AI Assistant Callout */}
        <div className="space-y-4">
          <div className="glass-card p-5">
            <h3 className="text-sm font-bold text-text-main mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-purpleLight" />
              Monthly Spending Insights
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-bg-cardHover border border-border-subtle">
                <p className="text-text-muted text-[11px]">Top Expense Category</p>
                <p className="text-sm font-bold text-text-main mt-0.5">
                  {summary?.highestCategory
                    ? `${summary.highestCategory.category} (${formatCurrency(summary.highestCategory.total)})`
                    : 'None yet'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-bg-cardHover border border-border-subtle">
                <p className="text-text-muted text-[11px]">Previous Month Comparison</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {summary?.previousPeriod?.difference > 0 ? (
                    <span className="text-status-danger font-bold flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      +{formatCurrency(summary.previousPeriod.difference)} higher
                    </span>
                  ) : summary?.previousPeriod?.difference < 0 ? (
                    <span className="text-status-success font-bold flex items-center gap-1">
                      <TrendingDown className="w-3.5 h-3.5" />
                      {formatCurrency(Math.abs(summary.previousPeriod.difference))} lower
                    </span>
                  ) : (
                    <span className="text-text-muted">No difference</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* AI Banner Card */}
          <div className="rounded-2xl p-5 bg-gradient-to-br from-brand-purpleDark/50 to-bg-card border border-brand-purple/30">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand-purpleLight" />
              AI Hostel Mentor
            </h4>
            <p className="text-[11px] text-text-secondary mt-1 leading-relaxed">
              Wondering where your allowance went? Get personalized mess and hostel budgeting advice.
            </p>
            <Link
              to="/ai-assistant"
              className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-brand-purple text-white text-xs font-bold hover:bg-brand-purpleDark transition shadow-soft-purple"
            >
              Ask AI Assistant <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;

