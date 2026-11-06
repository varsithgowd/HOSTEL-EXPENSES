import React, { useState, useEffect } from 'react';
import { X, Loader2, IndianRupee, Calendar, Tag, CreditCard, AlignLeft, Sparkles } from 'lucide-react';
import api from '../services/api';
import { useNotifications } from '../context/NotificationContext';

const CATEGORIES = [
  'Food',
  'Snacks',
  'Travel',
  'Shopping',
  'Education',
  'Entertainment',
  'Personal',
  'Other',
];

const PAYMENT_METHODS = [
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Other',
];

export const AddExpenseModal = ({ isOpen, onClose, onExpenseSaved, expenseToEdit = null }) => {
  const { fetchNotifications } = useNotifications();
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    paymentMethod: 'UPI',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        title: expenseToEdit.title || '',
        amount: expenseToEdit.amount || '',
        category: expenseToEdit.category || 'Food',
        paymentMethod: expenseToEdit.paymentMethod || 'UPI',
        date: expenseToEdit.date ? new Date(expenseToEdit.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        description: expenseToEdit.description || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        category: 'Food',
        paymentMethod: 'UPI',
        date: new Date().toISOString().split('T')[0],
        description: '',
      });
    }
    setError('');
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim()) {
      setError('Please provide an expense title.');
      return;
    }

    const numAmount = parseFloat(formData.amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Amount must be a valid number greater than ₹0.');
      return;
    }

    setLoading(true);

    try {
      if (expenseToEdit) {
        await api.put(`/expenses/${expenseToEdit._id}`, {
          ...formData,
          amount: numAmount,
        });
      } else {
        await api.post('/expenses', {
          ...formData,
          amount: numAmount,
        });
      }

      fetchNotifications();
      if (onExpenseSaved) onExpenseSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-bg-card border border-border-accent rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-purple/20 flex items-center justify-center text-brand-purpleLight">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-text-main">
              {expenseToEdit ? 'Edit Hostel Expense' : 'Add New Expense'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-text-main hover:bg-bg-cardHover transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-status-danger/10 border border-status-danger/30 text-xs text-status-danger">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Expense Title *
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Canteen Dinner, Swiggy, Bus Ticket"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-4 py-2.5 text-sm text-text-main placeholder-text-muted focus:outline-none transition"
                required
              />
            </div>
          </div>

          {/* Amount & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Amount (₹) *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-purpleLight font-semibold">
                  ₹
                </div>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl pl-8 pr-4 py-2.5 text-sm font-semibold text-text-main placeholder-text-muted focus:outline-none transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-4 py-2.5 text-sm text-text-main focus:outline-none transition"
                  required
                />
              </div>
            </div>
          </div>

          {/* Category & Payment Method Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3 py-2.5 text-sm text-text-main focus:outline-none transition cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-secondary mb-1.5">
                Payment Method
              </label>
              <select
                value={formData.paymentMethod}
                onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3 py-2.5 text-sm text-text-main focus:outline-none transition cursor-pointer"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-text-secondary mb-1.5">
              Description / Notes (Optional)
            </label>
            <textarea
              rows="2"
              placeholder="Add optional notes, hostel wing split details, or items purchased..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-4 py-2 text-sm text-text-main placeholder-text-muted focus:outline-none transition resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl border border-border-subtle hover:bg-bg-cardHover text-text-secondary hover:text-text-main text-xs font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-brand-purple hover:bg-brand-purpleDark disabled:opacity-50 text-white text-xs font-bold shadow-soft-purple flex items-center gap-2 transition active:scale-95"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{expenseToEdit ? 'Save Changes' : 'Record Expense'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddExpenseModal;
