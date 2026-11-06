import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  Trash2,
  Edit2,
  Calendar,
  Download,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import api from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import AddExpenseModal from '../components/AddExpenseModal';
import SplitBillModal from '../components/SplitBillModal';
import { formatCurrency, formatDate } from '../utils/formatters';

const CATEGORIES = [
  'All',
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
  'All',
  'UPI',
  'Cash',
  'Debit Card',
  'Credit Card',
  'Other',
];

export const ExpensesPage = () => {
  const { refreshKey, triggerRefresh } = useOutletContext() || {};

  const [expenses, setExpenses] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [filteredTotal, setFilteredTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & query params
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [order, setOrder] = useState('desc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  const [viewExpense, setViewExpense] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const handleLogSharedBill = (shareData) => {
    setExpenseToEdit({
      title: shareData.title,
      amount: shareData.amount,
      category: shareData.category,
      paymentMethod: 'UPI',
      date: new Date(),
      description: shareData.description,
    });
    setIsModalOpen(true);
  };

  const fetchExpenses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit,
        sortBy,
        order,
      });

      if (search.trim()) params.append('search', search.trim());
      if (category !== 'All') params.append('category', category);
      if (paymentMethod !== 'All') params.append('paymentMethod', paymentMethod);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const res = await api.get(`/expenses?${params.toString()}`);
      if (res.data.success) {
        setExpenses(res.data.expenses);
        setTotalCount(res.data.total);
        setTotalPages(res.data.totalPages);
        setFilteredTotal(res.data.filteredTotalAmount || 0);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, sortBy, order, search, category, paymentMethod, startDate, endDate]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses, refreshKey]);

  // Handle delete
  const handleDelete = async (id) => {
    try {
      await api.delete(`/expenses/${id}`);
      setDeleteConfirmId(null);
      if (triggerRefresh) triggerRefresh();
      fetchExpenses();
    } catch (err) {
      console.error('Failed to delete expense:', err);
    }
  };

  // Export to CSV
  const exportToCSV = () => {
    if (expenses.length === 0) return;

    const headers = ['Title', 'Amount (INR)', 'Category', 'Payment Method', 'Date', 'Description'];
    const rows = expenses.map((e) => [
      `"${e.title.replace(/"/g, '""')}"`,
      e.amount,
      `"${e.category}"`,
      `"${e.paymentMethod}"`,
      `"${new Date(e.date).toLocaleDateString('en-IN')}"`,
      `"${(e.description || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hostel_Expenses_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setPaymentMethod('All');
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setOrder('desc');
    setPage(1);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2 border-b border-border-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-text-main tracking-tight">
            Expense Management
          </h1>
          <p className="text-xs text-text-secondary mt-0.5">
            Log, filter, inspect, and organize all your hostel expenditures
          </p>
        </div>

        <div className="flex items-center gap-2">
          {expenses.length > 0 && (
            <button
              onClick={exportToCSV}
              className="px-3.5 py-2 rounded-xl bg-bg-card border border-border-subtle hover:bg-bg-cardHover text-text-main text-xs font-semibold flex items-center gap-1.5 transition"
              title="Download CSV report"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          )}

          <button
            onClick={() => setIsSplitOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-bg-card border border-border-accent hover:border-brand-purple/50 text-brand-purpleLight text-xs font-semibold flex items-center gap-1.5 transition"
            title="Split Bill with Roommates"
          >
            <span>Split Bill</span>
          </button>

          <button
            onClick={() => {
              setExpenseToEdit(null);
              setIsModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-brand-purple hover:bg-brand-purpleDark text-white text-xs font-bold shadow-soft-purple flex items-center gap-1.5 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-text-muted">
              <Search className="w-3.5 h-3.5" />
            </div>
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl pl-9 pr-3 py-2 text-xs text-text-main placeholder-text-muted focus:outline-none transition"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none transition cursor-pointer"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method Dropdown */}
          <div>
            <select
              value={paymentMethod}
              onChange={(e) => {
                setPaymentMethod(e.target.value);
                setPage(1);
              }}
              className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none transition cursor-pointer"
            >
              {PAYMENT_METHODS.map((pm) => (
                <option key={pm} value={pm}>
                  Payment: {pm}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={`${sortBy}-${order}`}
              onChange={(e) => {
                const [sb, ord] = e.target.value.split('-');
                setSortBy(sb);
                setOrder(ord);
                setPage(1);
              }}
              className="w-full bg-bg-input border border-border-subtle focus:border-brand-purple rounded-xl px-3 py-2 text-xs text-text-main focus:outline-none transition cursor-pointer"
            >
              <option value="date-desc">Sort: Newest First</option>
              <option value="date-asc">Sort: Oldest First</option>
              <option value="amount-desc">Sort: Amount (High to Low)</option>
              <option value="amount-asc">Sort: Amount (Low to High)</option>
              <option value="title-asc">Sort: Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Date Range Sub-Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-text-muted text-[11px]">Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="bg-bg-input border border-border-subtle rounded-lg px-2.5 py-1 text-xs text-text-main focus:outline-none"
            />
            <span className="text-text-muted">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="bg-bg-input border border-border-subtle rounded-lg px-2.5 py-1 text-xs text-text-main focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            {(search || category !== 'All' || paymentMethod !== 'All' || startDate || endDate) && (
              <button
                onClick={handleClearFilters}
                className="text-[11px] text-text-muted hover:text-brand-purpleLight transition underline"
              >
                Clear Filters
              </button>
            )}

            <span className="text-xs font-semibold text-text-secondary">
              Filtered Total:{' '}
              <strong className="text-brand-purpleLight font-bold">
                {formatCurrency(filteredTotal)}
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle bg-bg-cardHover/50 text-[11px] uppercase tracking-wider text-text-muted">
                <th className="py-3 px-4 font-semibold">Expense Title</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Payment</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold text-right">Amount</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border-subtle text-xs">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-text-muted">
                    Loading expenses...
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-text-muted">
                    <Receipt className="w-8 h-8 mx-auto mb-2 text-brand-purple/40" />
                    <p className="font-semibold text-text-main">No expenses match your filters.</p>
                    <p className="text-[11px] mt-0.5">Try clearing filters or click "+ Add Expense".</p>
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr
                    key={expense._id}
                    className="hover:bg-bg-cardHover/70 transition group"
                  >
                    <td className="py-3 px-4 font-semibold text-text-main">
                      <div>
                        <span>{expense.title}</span>
                        {expense.description && (
                          <p className="text-[11px] text-text-muted truncate max-w-xs font-normal">
                            {expense.description}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <CategoryBadge category={expense.category} />
                    </td>

                    <td className="py-3 px-4 text-text-secondary">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-bg-input border border-border-subtle text-[11px]">
                        <CreditCard className="w-3 h-3 text-text-muted" />
                        {expense.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-text-secondary">
                      {formatDate(expense.date)}
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-text-main">
                      {formatCurrency(expense.amount)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* View button */}
                        <button
                          onClick={() => setViewExpense(expense)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-main hover:bg-bg-input transition"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={() => {
                            setExpenseToEdit(expense);
                            setIsModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-brand-purpleLight hover:bg-bg-input transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => setDeleteConfirmId(expense._id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border-subtle flex items-center justify-between text-xs text-text-secondary">
            <div>
              Showing {expenses.length} of {totalCount} transactions
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-border-subtle hover:bg-bg-cardHover disabled:opacity-40 transition"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-semibold text-text-main">
                Page {page} of {totalPages}
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-border-subtle hover:bg-bg-cardHover disabled:opacity-40 transition"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-sm w-full p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-status-danger/15 text-status-danger flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-text-main">Delete Expense?</h3>
              <p className="text-xs text-text-secondary mt-1">
                Are you sure you want to delete this expense? This action will immediately recalculate your budget and analytics.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-border-subtle hover:bg-bg-cardHover text-xs font-semibold text-text-secondary transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-status-danger hover:bg-red-600 text-white text-xs font-bold transition shadow-lg"
              >
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Expense Details Modal */}
      {viewExpense && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="glass-card max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="text-base font-bold text-text-main">Expense Details</h3>
              <button
                onClick={() => setViewExpense(null)}
                className="p-1 rounded-lg text-text-muted hover:text-text-main transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-text-muted">Title:</span>
                <p className="text-sm font-bold text-text-main mt-0.5">{viewExpense.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-text-muted">Amount:</span>
                  <p className="text-base font-extrabold text-brand-purpleLight mt-0.5">
                    {formatCurrency(viewExpense.amount)}
                  </p>
                </div>
                <div>
                  <span className="text-text-muted">Category:</span>
                  <div className="mt-0.5">
                    <CategoryBadge category={viewExpense.category} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-text-muted">Payment Method:</span>
                  <p className="font-semibold text-text-main mt-0.5">{viewExpense.paymentMethod}</p>
                </div>
                <div>
                  <span className="text-text-muted">Date:</span>
                  <p className="font-semibold text-text-main mt-0.5">{formatDate(viewExpense.date)}</p>
                </div>
              </div>

              {viewExpense.description && (
                <div>
                  <span className="text-text-muted">Notes:</span>
                  <p className="text-text-secondary mt-0.5 p-2.5 rounded-lg bg-bg-input border border-border-subtle">
                    {viewExpense.description}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-border-subtle flex justify-end">
              <button
                onClick={() => setViewExpense(null)}
                className="px-4 py-2 rounded-xl bg-bg-cardHover hover:bg-bg-input text-xs font-semibold text-text-main transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Roommate Bill Splitter Modal */}
      <SplitBillModal
        isOpen={isSplitOpen}
        onClose={() => setIsSplitOpen(false)}
        onLogShare={handleLogSharedBill}
      />

      {/* Add / Edit Expense Modal */}
      <AddExpenseModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setExpenseToEdit(null);
        }}
        onExpenseSaved={() => {
          if (triggerRefresh) triggerRefresh();
          fetchExpenses();
        }}
        expenseToEdit={expenseToEdit}
      />
    </div>
  );
};

export default ExpensesPage;

