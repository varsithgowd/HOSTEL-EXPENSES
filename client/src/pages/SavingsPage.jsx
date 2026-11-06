import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Target,
  Plus,
  PiggyBank,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Loader2,
  Sparkles,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import api from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';

export const SavingsPage = () => {
  const { refreshKey, triggerRefresh } = useOutletContext() || {};

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [goalToEdit, setGoalToEdit] = useState(null);
  const [contributeGoal, setContributeGoal] = useState(null);

  // Contribution state
  const [contributeAmount, setContributeAmount] = useState('');
  const [contributeNote, setContributeNote] = useState('');
  const [exceedWarning, setExceedWarning] = useState(false);
  const [contributeLoading, setContributeLoading] = useState(false);

  // Create/Edit form
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [category, setCategory] = useState('Personal');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/savings');
      if (res.data.success) {
        setGoals(res.data.goals);
      }
    } catch (err) {
      console.error('Error fetching savings goals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals, refreshKey]);

  // Open Edit Modal
  const handleOpenEdit = (goal) => {
    setGoalToEdit(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount);
    setDeadline(goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : '');
    setCategory(goal.category || 'Personal');
    setIsCreateOpen(true);
  };

  // Reset form
  const handleCloseModal = () => {
    setIsCreateOpen(false);
    setGoalToEdit(null);
    setTitle('');
    setTargetAmount('');
    setDeadline('');
    setFormError('');
  };

  // Submit Create or Edit Goal
  const handleSubmitGoal = async (e) => {
    e.preventDefault();
    setFormError('');

    const target = parseFloat(targetAmount);
    if (!title.trim() || isNaN(target) || target <= 0 || !deadline) {
      setFormError('Please fill in valid title, target amount, and deadline.');
      return;
    }

    setFormLoading(true);
    try {
      if (goalToEdit) {
        await api.put(`/savings/${goalToEdit._id}`, {
          title: title.trim(),
          targetAmount: target,
          deadline,
          category,
        });
      } else {
        await api.post('/savings', {
          title: title.trim(),
          targetAmount: target,
          deadline,
          category,
        });
      }

      handleCloseModal();
      fetchGoals();
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to save savings goal.');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Goal
  const handleDeleteGoal = async (id) => {
    if (!window.confirm('Are you sure you want to delete this savings goal?')) return;
    try {
      await api.delete(`/savings/${id}`);
      fetchGoals();
      if (triggerRefresh) triggerRefresh();
    } catch (err) {
      console.error('Failed to delete goal:', err);
    }
  };

  // Submit Contribution
  const handleContributeSubmit = async (allowExceed = false) => {
    const amt = parseFloat(contributeAmount);
    if (isNaN(amt) || amt <= 0) return;

    setContributeLoading(true);
    try {
      const res = await api.post(`/savings/${contributeGoal._id}/contribute`, {
        amount: amt,
        note: contributeNote,
        allowExceed,
      });

      if (res.data.success) {
        setContributeGoal(null);
        setContributeAmount('');
        setContributeNote('');
        setExceedWarning(false);
        fetchGoals();
        if (triggerRefresh) triggerRefresh();
      }
    } catch (err) {
      if (err.response?.data?.exceedsTarget) {
        setExceedWarning(true);
      } else {
        alert(err.response?.data?.message || 'Failed to add contribution.');
      }
    } finally {
      setContributeLoading(false);
    }
  };

  const totalSavedAcrossGoals = goals.reduce((acc, g) => acc + (g.savedAmount || 0), 0);
  const totalTargetAcrossGoals = goals.reduce((acc, g) => acc + (g.targetAmount || 0), 0);
  const completedGoalsCount = goals.filter((g) => g.status === 'completed').length;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
            Savings Goals
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Save up for personal goals, gadgets, trips home, or emergency funds
          </p>
        </div>

        <button
          onClick={() => {
            handleCloseModal();
            setIsCreateOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-xs font-bold shadow-soft-purple flex items-center gap-1.5 transition active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Savings Goal</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-text-secondary uppercase">Total Saved So Far</p>
          <h3 className="text-2xl font-extrabold text-status-success mt-1">
            {formatCurrency(totalSavedAcrossGoals)}
          </h3>
          <p className="text-[11px] text-text-muted mt-2">
            Towards ₹{totalTargetAcrossGoals.toLocaleString('en-IN')} total targets
          </p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-text-secondary uppercase">Active Goals</p>
          <h3 className="text-2xl font-extrabold text-brand-purpleLight mt-1">
            {goals.filter((g) => g.status !== 'completed').length} Goals
          </h3>
          <p className="text-[11px] text-text-muted mt-2">In progress</p>
        </div>

        <div className="glass-card p-5">
          <p className="text-xs font-semibold text-text-secondary uppercase">Completed Goals</p>
          <h3 className="text-2xl font-extrabold text-text-main mt-1">
            {completedGoalsCount} Goals 🎉
          </h3>
          <p className="text-[11px] text-text-muted mt-2">100% Target reached</p>
        </div>
      </div>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 glass-card p-12 text-center text-xs text-text-muted">
            Loading savings goals...
          </div>
        ) : goals.length === 0 ? (
          <div className="col-span-2 glass-card p-12 text-center">
            <Target className="w-10 h-10 mx-auto mb-3 text-brand-purple/40" />
            <h3 className="text-sm font-bold text-text-main">No Savings Goals Yet</h3>
            <p className="text-xs text-text-secondary mt-1 max-w-sm mx-auto">
              Start setting aside small amounts from your monthly hostel allowance for a dream item or trip!
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-xs font-bold transition inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              Create First Goal
            </button>
          </div>
        ) : (
          goals.map((goal) => {
            const isCompleted = goal.status === 'completed';
            const percent = goal.progressPercent || 0;

            return (
              <div
                key={goal._id}
                className={`glass-card p-6 flex flex-col justify-between transition relative overflow-hidden ${
                  isCompleted ? 'border-status-success/40 bg-status-success/5' : ''
                }`}
              >
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-bg-cardHover text-text-secondary border border-border-subtle">
                          {goal.category}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-status-success/20 text-status-success border border-status-success/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Completed
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-bold text-text-main mt-2 leading-snug">
                        {goal.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(goal)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-brand-purpleLight hover:bg-bg-cardHover transition"
                        title="Edit Goal"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal._id)}
                        className="p-1.5 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition"
                        title="Delete Goal"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Financial Metrics */}
                  <div className="grid grid-cols-2 gap-3 my-5 p-3 rounded-xl bg-bg-cardHover border border-border-subtle text-xs">
                    <div>
                      <span className="text-text-muted">Target Amount:</span>
                      <p className="text-sm font-bold text-text-main mt-0.5">
                        {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-text-muted">Saved So Far:</span>
                      <p className="text-sm font-bold text-status-success mt-0.5">
                        {formatCurrency(goal.savedAmount)}
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-text-secondary font-medium">Progress</span>
                      <span className="text-text-main font-bold">{percent}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-bg-main overflow-hidden border border-border-subtle">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isCompleted
                            ? 'bg-status-success'
                            : 'bg-gradient-to-r from-brand-purple to-brand-purpleLight'
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Target Date */}
                  <div className="mt-4 flex items-center justify-between text-xs text-text-muted">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-text-muted" />
                      Target Date: {formatDate(goal.deadline)}
                    </span>
                    <span>
                      Remaining:{' '}
                      <strong className="text-brand-purpleLight">
                        {formatCurrency(goal.remainingAmount)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Contribute Button */}
                <div className="mt-5 pt-4 border-t border-border-subtle">
                  <button
                    onClick={() => {
                      setContributeGoal(goal);
                      setContributeAmount('');
                      setContributeNote('');
                      setExceedWarning(false);
                    }}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      isCompleted
                        ? 'bg-bg-cardHover hover:bg-bg-input text-text-main border border-border-subtle'
                        : 'bg-brand-purple hover:bg-brand-purpleDark text-white shadow-soft-purple active:scale-95'
                    }`}
                  >
                    <PiggyBank className="w-4 h-4" />
                    <span>{isCompleted ? 'Add Extra Savings' : 'Add Contribution'}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create / Edit Goal Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-base font-bold text-text-main">
                {goalToEdit ? 'Edit Savings Goal' : 'Create Savings Goal'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="p-1 rounded-lg text-text-muted hover:text-text-main transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmitGoal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text-secondary mb-1">
                  Goal Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Acoustic Guitar, Noise Cancelling Headphones, Goa Trip"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3.5 py-2.5 text-text-main placeholder-text-muted focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">
                    Target Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="5000"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(e.target.value)}
                    className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3.5 py-2.5 text-text-main font-semibold focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3 py-2.5 text-text-main focus:outline-none cursor-pointer"
                  >
                    <option value="Personal">Personal</option>
                    <option value="Gadgets">Gadgets</option>
                    <option value="Travel">Travel</option>
                    <option value="Education">Education</option>
                    <option value="Emergency">Emergency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-secondary mb-1">
                  Target Completion Date *
                </label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3.5 py-2.5 text-text-main focus:outline-none"
                  required
                />
              </div>

              <div className="pt-3 border-t border-border-subtle flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-xl border border-border-subtle text-text-secondary hover:text-text-main font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark disabled:opacity-50 text-white font-bold shadow-soft-purple flex items-center gap-1.5"
                >
                  {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{goalToEdit ? 'Save Changes' : 'Create Goal'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Contribution Modal */}
      {contributeGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-base font-bold text-text-main">
                Deposit to "{contributeGoal.title}"
              </h3>
              <button
                onClick={() => setContributeGoal(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-main transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-bg-cardHover border border-border-subtle text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-text-muted">Target:</span>
                <span className="font-bold text-text-main">
                  {formatCurrency(contributeGoal.targetAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Already Saved:</span>
                <span className="font-bold text-status-success">
                  {formatCurrency(contributeGoal.savedAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Remaining to reach goal:</span>
                <span className="font-bold text-brand-purpleLight">
                  {formatCurrency(contributeGoal.remainingAmount)}
                </span>
              </div>
            </div>

            {/* Exceed Target Warning Box */}
            {exceedWarning && (
              <div className="p-3 rounded-xl bg-status-warning/10 border border-status-warning/30 text-xs text-status-warning space-y-2">
                <p className="font-semibold">
                  ⚠️ This deposit will exceed your target of {formatCurrency(contributeGoal.targetAmount)}.
                </p>
                <p className="text-[11px] text-text-secondary">
                  Do you want to proceed and save extra buffer money?
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setExceedWarning(false)}
                    className="px-3 py-1 rounded-lg border border-border-subtle text-text-secondary"
                  >
                    Adjust Amount
                  </button>
                  <button
                    onClick={() => handleContributeSubmit(true)}
                    className="px-3 py-1 rounded-lg bg-status-warning text-black font-bold"
                  >
                    Yes, Allow Exceed
                  </button>
                </div>
              </div>
            )}

            {!exceedWarning && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-text-secondary mb-1">
                    Contribution Amount (₹) *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-brand-purpleLight font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 500"
                      value={contributeAmount}
                      onChange={(e) => setContributeAmount(e.target.value)}
                      className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl pl-8 pr-3.5 py-2.5 text-text-main font-semibold focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-text-secondary mb-1">
                    Note / Source (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Saved from weekend pocket money"
                    value={contributeNote}
                    onChange={(e) => setContributeNote(e.target.value)}
                    className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3.5 py-2 text-text-main placeholder-text-muted focus:outline-none"
                  />
                </div>

                <div className="pt-3 border-t border-border-subtle flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setContributeGoal(null)}
                    className="px-4 py-2 rounded-xl border border-border-subtle text-text-secondary hover:text-text-main font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleContributeSubmit(false)}
                    disabled={contributeLoading}
                    className="px-5 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark disabled:opacity-50 text-white font-bold shadow-soft-purple flex items-center gap-1.5"
                  >
                    {contributeLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm Deposit</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsPage;

