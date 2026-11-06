import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  PiggyBank,
  Clock,
  ShieldAlert,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Edit3,
  Loader2,
  Save,
  ArrowRight,
  Sparkles,
  TrendingDown,
} from 'lucide-react';
import api from '../services/api';
import AlertBanner from '../components/AlertBanner';
import { formatCurrency } from '../utils/formatters';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const BudgetPage = () => {
  const { refreshKey, triggerRefresh } = useOutletContext() || {};

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  const [loading, setLoading] = useState(true);
  const [budgetData, setBudgetData] = useState(null);
  const [history, setHistory] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Edit limits state
  const [isEditing, setIsEditing] = useState(false);
  const [dailyLimitInput, setDailyLimitInput] = useState('');
  const [monthlyLimitInput, setMonthlyLimitInput] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: '', text: '' });

  const fetchBudget = useCallback(async () => {
    setLoading(true);
    try {
      const [res, histRes] = await Promise.all([
        api.get(`/budgets/current?month=${selectedMonth}&year=${selectedYear}`),
        api.get('/budgets/history'),
      ]);

      if (res.data.success) {
        setBudgetData(res.data.budget);
        setAlerts(res.data.alerts || []);
        setDailyLimitInput(res.data.budget.dailyLimit);
        setMonthlyLimitInput(res.data.budget.monthlyLimit);
      }

      if (histRes.data.success) {
        setHistory(histRes.data.budgets || []);
      }
    } catch (err) {
      console.error('Error fetching budget:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchBudget();
  }, [fetchBudget, refreshKey]);

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setSaveMessage({ type: '', text: '' });

    const daily = parseFloat(dailyLimitInput);
    const monthly = parseFloat(monthlyLimitInput);

    if (isNaN(daily) || daily < 0 || isNaN(monthly) || monthly < 0) {
      setSaveMessage({ type: 'error', text: 'Please enter valid non-negative numbers.' });
      return;
    }

    setSaveLoading(true);
    try {
      const res = await api.post('/budgets', {
        dailyLimit: daily,
        monthlyLimit: monthly,
        month: selectedMonth,
        year: selectedYear,
      });

      if (res.data.success) {
        setSaveMessage({ type: 'success', text: 'Budget limits saved successfully!' });
        setIsEditing(false);
        if (triggerRefresh) triggerRefresh();
        fetchBudget();
      }
    } catch (err) {
      setSaveMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to update budget limits.',
      });
    } finally {
      setSaveLoading(false);
    }
  };

  const getStatusBadge = (status, level) => {
    switch (level) {
      case 'danger':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-danger/15 text-status-danger border border-status-danger/30 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      case 'warning':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-warning/15 text-status-warning border border-status-warning/30 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-status-success/15 text-status-success border border-status-success/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
            Budget Management
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Set and monitor daily spending caps and monthly hostel allowance
          </p>
        </div>

        {/* Month Selector */}
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
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-xs font-bold shadow-soft-purple flex items-center gap-1.5 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Cancel Edit' : 'Edit Limits'}</span>
          </button>
        </div>
      </div>

      {/* Active Threshold Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert, idx) => (
            <AlertBanner key={idx} alert={alert} />
          ))}
        </div>
      )}

      {/* Edit Form Drawer / Card */}
      {isEditing && (
        <div className="glass-card p-6 border-brand-purple/40 bg-gradient-to-r from-bg-card via-bg-card to-brand-purple/10">
          <h3 className="text-sm font-bold text-text-main mb-1">
            Update Limits for {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
          </h3>
          <p className="text-xs text-text-muted mb-4">
            Recommended limits for hostel students: Daily ₹250–₹400, Monthly ₹6,000–₹10,000.
          </p>

          {saveMessage.text && (
            <div
              className={`p-3 rounded-xl mb-4 text-xs ${
                saveMessage.type === 'success'
                  ? 'bg-status-success/10 text-status-success border border-status-success/30'
                  : 'bg-status-danger/10 text-status-danger border border-status-danger/30'
              }`}
            >
              {saveMessage.text}
            </div>
          )}

          <form onSubmit={handleSaveBudget} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Daily Spending Limit (₹)
              </label>
              <input
                type="number"
                min="0"
                value={dailyLimitInput}
                onChange={(e) => setDailyLimitInput(e.target.value)}
                className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-4 py-2.5 text-sm text-text-main font-semibold focus:outline-none"
                placeholder="300"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1">
                Monthly Spending Limit (₹)
              </label>
              <input
                type="number"
                min="0"
                value={monthlyLimitInput}
                onChange={(e) => setMonthlyLimitInput(e.target.value)}
                className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-4 py-2.5 text-sm text-text-main font-semibold focus:outline-none"
                placeholder="8000"
                required
              />
            </div>

            <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl border border-border-subtle text-xs font-semibold text-text-secondary hover:text-text-main"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saveLoading}
                className="px-5 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark disabled:opacity-50 text-white text-xs font-bold shadow-soft-purple flex items-center gap-2 transition"
              >
                {saveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>Save Limits</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Budget Gauges Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Monthly Budget Card */}
        <div className="glass-card p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-brand-purple/15 text-brand-purple flex items-center justify-center shrink-0">
                  <PiggyBank className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-text-main">Monthly Budget Overview</h3>
                  <p className="text-[11px] sm:text-xs text-text-muted">
                    {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
                  </p>
                </div>
              </div>

              {budgetData && getStatusBadge(budgetData.monthlyStatus, budgetData.monthlyStatusLevel)}
            </div>

            {/* Values */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 my-4 sm:my-6 p-2.5 sm:p-4 rounded-xl bg-bg-cardHover border border-border-subtle text-center">
              <div>
                <p className="text-[10px] sm:text-[11px] text-text-muted">Monthly Limit</p>
                <p className="text-xs sm:text-base font-extrabold text-text-main mt-0.5 truncate">
                  {formatCurrency(budgetData?.monthlyLimit || 0)}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-text-muted">Total Spent</p>
                <p className="text-xs sm:text-base font-extrabold text-brand-purpleLight mt-0.5 truncate">
                  {formatCurrency(budgetData?.totalMonthlySpent || 0)}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-text-muted">Remaining</p>
                <p
                  className={`text-xs sm:text-base font-extrabold mt-0.5 truncate ${
                    (budgetData?.remainingMonthly || 0) <= 0
                      ? 'text-status-danger'
                      : 'text-status-success'
                  }`}
                >
                  {formatCurrency(budgetData?.remainingMonthly || 0)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-text-secondary font-medium">Budget Consumed</span>
                <span className="text-text-main font-bold">
                  {budgetData?.monthlyUsagePercent || 0}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-bg-main overflow-hidden p-0.5 border border-border-subtle">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    (budgetData?.monthlyUsagePercent || 0) >= 100
                      ? 'bg-status-danger'
                      : (budgetData?.monthlyUsagePercent || 0) >= 70
                      ? 'bg-status-warning'
                      : 'bg-gradient-to-r from-brand-purple to-brand-purpleLight'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, budgetData?.monthlyUsagePercent || 0))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
            <span>Threshold Alert at 70% & 90%</span>
            <span>
              Status:{' '}
              <strong className="text-text-main">{budgetData?.monthlyStatus || 'Normal'}</strong>
            </span>
          </div>
        </div>

        {/* Daily Spending Limit Card */}
        <div className="glass-card p-4 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold text-text-main">Today's Daily Cap</h3>
                  <p className="text-[11px] sm:text-xs text-text-muted">Day-level spending control</p>
                </div>
              </div>

              {budgetData && getStatusBadge(budgetData.dailyStatus, budgetData.dailyStatusLevel)}
            </div>

            {/* Values */}
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3 my-4 sm:my-6 p-2.5 sm:p-4 rounded-xl bg-bg-cardHover border border-border-subtle text-center">
              <div>
                <p className="text-[10px] sm:text-[11px] text-text-muted">Daily Limit</p>
                <p className="text-xs sm:text-base font-extrabold text-text-main mt-0.5 truncate">
                  {formatCurrency(budgetData?.dailyLimit || 0)}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-text-muted">Spent Today</p>
                <p className="text-xs sm:text-base font-extrabold text-blue-400 mt-0.5 truncate">
                  {formatCurrency(budgetData?.totalTodaySpent || 0)}
                </p>
              </div>
              <div>
                <p className="text-[10px] sm:text-[11px] text-text-muted">Remaining</p>
                <p
                  className={`text-xs sm:text-base font-extrabold mt-0.5 truncate ${
                    (budgetData?.remainingDaily || 0) <= 0
                      ? 'text-status-danger'
                      : 'text-status-success'
                  }`}
                >
                  {formatCurrency(budgetData?.remainingDaily || 0)}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-text-secondary font-medium">Daily Limit Used</span>
                <span className="text-text-main font-bold">
                  {budgetData?.dailyUsagePercent || 0}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full bg-bg-main overflow-hidden p-0.5 border border-border-subtle">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    (budgetData?.dailyUsagePercent || 0) >= 100
                      ? 'bg-status-danger'
                      : (budgetData?.dailyUsagePercent || 0) >= 70
                      ? 'bg-status-warning'
                      : 'bg-blue-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, budgetData?.dailyUsagePercent || 0))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-muted">
            <span>Resets daily at 00:00 IST</span>
            <span>
              Safe Pace:{' '}
              <strong className="text-text-main">
                {budgetData?.totalTodaySpent <= budgetData?.dailyLimit ? 'On Track' : 'Overspent'}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Threshold Guide */}
      <div className="glass-card p-5">
        <h4 className="text-xs font-bold text-text-main mb-3 uppercase tracking-wider">
          How Hostel Budget Thresholds Work
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-status-success/10 border border-status-success/20">
            <span className="font-bold text-status-success">0% – 69% (Normal)</span>
            <p className="text-text-muted text-[11px] mt-1">
              Safe spending pace. You have plenty of runway left for the month.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-status-warning/10 border border-status-warning/20">
            <span className="font-bold text-status-warning">70% – 89% (Warning)</span>
            <p className="text-text-muted text-[11px] mt-1">
              System generates a Warning banner. Time to cut down on extra takeaway meals.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/20">
            <span className="font-bold text-status-danger">90% – 99% (Danger)</span>
            <p className="text-text-muted text-[11px] mt-1">
              Critical budget threshold. Only essential mess meals and necessities recommended.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-status-danger/20 border border-status-danger/40">
            <span className="font-bold text-status-danger">100%+ (Exceeded)</span>
            <p className="text-text-muted text-[11px] mt-1">
              Budget overrun alert! You've depleted your allowance for this month.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;

