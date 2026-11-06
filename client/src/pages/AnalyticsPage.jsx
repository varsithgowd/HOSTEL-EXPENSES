import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  PieChart as PieIcon,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Calendar,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Utensils,
  Receipt,
  Download,
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
import CategoryBadge from '../components/CategoryBadge';
import { formatCurrency, formatDate, CATEGORY_CONFIG } from '../utils/formatters';

export const AnalyticsPage = () => {
  const { refreshKey } = useOutletContext() || {};

  const [filterType, setFilterType] = useState('current'); // 'current' | 'previous' | 'custom'
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [categoryData, setCategoryData] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [monthlyTrends, setMonthlyTrends] = useState([]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ filter: filterType });
      if (filterType === 'custom' && customStart && customEnd) {
        params.append('startDate', customStart);
        params.append('endDate', customEnd);
      }

      const [sumRes, catRes, dailyRes, trendRes] = await Promise.all([
        api.get(`/analytics/summary?${params.toString()}`),
        api.get(`/analytics/categories?${params.toString()}`),
        api.get(`/analytics/daily?${params.toString()}`),
        api.get('/analytics/monthly'),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (catRes.data.success) setCategoryData(catRes.data.categories);
      if (dailyRes.data.success) setDailyData(dailyRes.data.daily);
      if (trendRes.data.success) setMonthlyTrends(trendRes.data.trends);
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [filterType, customStart, customEnd]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics, refreshKey]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title & Filter Buttons */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
            Spending Analytics
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Deep financial breakdown, patterns, and historical comparisons
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <div className="p-1 rounded-xl bg-bg-card border border-border-subtle flex flex-wrap items-center gap-1 text-xs w-full sm:w-auto">
            <button
              onClick={() => setFilterType('current')}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg font-semibold transition ${
                filterType === 'current'
                  ? 'bg-brand-purple text-white shadow-soft-purple'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              Current Month
            </button>
            <button
              onClick={() => setFilterType('previous')}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg font-semibold transition ${
                filterType === 'previous'
                  ? 'bg-brand-purple text-white shadow-soft-purple'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              Previous Month
            </button>
            <button
              onClick={() => setFilterType('custom')}
              className={`flex-1 sm:flex-initial text-center px-3 py-1.5 rounded-lg font-semibold transition ${
                filterType === 'custom'
                  ? 'bg-brand-purple text-white shadow-soft-purple'
                  : 'text-text-secondary hover:text-text-main'
              }`}
            >
              Custom Range
            </button>
          </div>
        </div>
      </div>

      {/* Custom Range Picker */}
      {filterType === 'custom' && (
        <div className="glass-card p-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="text-text-secondary font-medium">Select Dates:</span>
          <input
            type="date"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="bg-bg-input border border-border-subtle rounded-xl px-3 py-1.5 text-text-main focus:outline-none"
          />
          <span className="text-text-muted">to</span>
          <input
            type="date"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="bg-bg-input border border-border-subtle rounded-xl px-3 py-1.5 text-text-main focus:outline-none"
          />
        </div>
      )}

      {/* Key Insights Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Expense */}
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Total Incurred
          </p>
          <h3 className="text-2xl font-extrabold text-text-main mt-1">
            {formatCurrency(summary?.totalSpent || 0)}
          </h3>
          <p className="text-[11px] text-text-muted mt-2">
            Across {summary?.totalTransactions || 0} recorded items
          </p>
        </div>

        {/* Highest Category */}
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Top Category
          </p>
          <h3 className="text-2xl font-extrabold text-brand-purpleLight mt-1 truncate">
            {summary?.highestCategory?.category || 'None'}
          </h3>
          <p className="text-[11px] text-text-muted mt-2">
            {summary?.highestCategory
              ? `${formatCurrency(summary.highestCategory.total)} (${summary.highestCategory.percentage}%)`
              : 'No records'}
          </p>
        </div>

        {/* Daily Average */}
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            Daily Average
          </p>
          <h3 className="text-2xl font-extrabold text-blue-400 mt-1">
            {formatCurrency(summary?.averageDailyExpense || 0)}
          </h3>
          <p className="text-[11px] text-text-muted mt-2">Per-day spending rate</p>
        </div>

        {/* Prior Month Comparison */}
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
            vs Previous Period
          </p>
          <div className="flex items-center gap-2 mt-1">
            {summary?.previousPeriod?.difference > 0 ? (
              <>
                <ArrowUpRight className="w-6 h-6 text-status-danger" />
                <h3 className="text-2xl font-extrabold text-status-danger">
                  +{formatCurrency(summary.previousPeriod.difference)}
                </h3>
              </>
            ) : summary?.previousPeriod?.difference < 0 ? (
              <>
                <ArrowDownRight className="w-6 h-6 text-status-success" />
                <h3 className="text-2xl font-extrabold text-status-success">
                  -{formatCurrency(Math.abs(summary.previousPeriod.difference))}
                </h3>
              </>
            ) : (
              <h3 className="text-2xl font-extrabold text-text-muted">₹0</h3>
            )}
          </div>
          <p className="text-[11px] text-text-muted mt-2">
            {summary?.previousPeriod?.totalSpent
              ? `Prior: ${formatCurrency(summary.previousPeriod.totalSpent)}`
              : 'No prior data'}
          </p>
        </div>
      </div>

      {/* Row 1: Pie Chart & Daily Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-text-main mb-1">Category Distribution</h3>
          <p className="text-xs text-text-muted mb-4">Percentage allocation by category</p>

          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-text-muted">
              No expenses in this period.
            </div>
          ) : (
            <div className="h-64 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="total"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={55}
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

        {/* Daily Bar Chart */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-text-main mb-1">Daily Spending Graph</h3>
          <p className="text-xs text-text-muted mb-4">Chronological expense progression</p>

          <div className="h-64 w-full">
            {dailyData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-text-muted">
                No daily records available.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#232338" vertical={false} />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
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
                  <Bar dataKey="amount" fill="#8B5CF6" radius={[6, 6, 0, 0]} maxBarSize={35} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Monthly Trends Line Chart */}
      <div className="glass-card p-6">
        <h3 className="text-sm font-bold text-text-main mb-1">Long-Term Spending Trends</h3>
        <p className="text-xs text-text-muted mb-4">Historical monthly trajectory</p>

        <div className="h-64 w-full">
          {monthlyTrends.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-text-muted">
              Accumulate spending across multiple months to unlock long-term trends.
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
                  formatter={(val) => [formatCurrency(val), 'Monthly Total']}
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

      {/* Category Analysis Detailed Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-border-subtle">
          <h3 className="text-sm font-bold text-text-main">Category Analysis Table</h3>
          <p className="text-[11px] text-text-muted">Detailed breakdown per expenditure category</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-cardHover/50 text-[11px] uppercase tracking-wider text-text-muted">
                <th className="py-3 px-4 font-semibold">Category Name</th>
                <th className="py-3 px-4 font-semibold text-center">Transactions</th>
                <th className="py-3 px-4 font-semibold text-right">Total Spent</th>
                <th className="py-3 px-4 font-semibold text-right">% of Total</th>
                <th className="py-3 px-4 font-semibold">Share Visualizer</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {categoryData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-text-muted">
                    No category data available for this range.
                  </td>
                </tr>
              ) : (
                categoryData.map((cat) => (
                  <tr key={cat.name} className="hover:bg-bg-cardHover transition">
                    <td className="py-3 px-4">
                      <CategoryBadge category={cat.name} />
                    </td>
                    <td className="py-3 px-4 text-center font-medium text-text-secondary">
                      {cat.count}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-text-main">
                      {formatCurrency(cat.total)}
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-brand-purpleLight">
                      {cat.percentage}%
                    </td>
                    <td className="py-3 px-4 w-48">
                      <div className="w-full h-2 rounded-full bg-bg-main overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: CATEGORY_CONFIG[cat.name]?.color || '#8B5CF6',
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;

