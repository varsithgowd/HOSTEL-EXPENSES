// Currency formatter: Indian Rupee (₹)
export const formatCurrency = (amount) => {
  const num = Number(amount) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
    minimumFractionDigits: num % 1 === 0 ? 0 : 2,
  }).format(num);
};

// Date formatter: DD MMM YYYY (e.g. 06 Nov 2026)
export const formatDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Kolkata',
  });
};

// Relative date formatter (e.g. Today, Yesterday, or DD MMM)
export const formatRelativeDate = (dateInput) => {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  const now = new Date();
  
  const isToday =
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear();

  if (isToday) return 'Today';

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    d.getDate() === yesterday.getDate() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Yesterday';

  return formatDate(dateInput);
};

// Category Colors & Styling for badges and charts
export const CATEGORY_CONFIG = {
  Food: {
    color: '#8B5CF6', // Primary purple
    bg: 'rgba(139, 92, 246, 0.15)',
    border: 'rgba(139, 92, 246, 0.4)',
    icon: 'Utensils',
  },
  Snacks: {
    color: '#EC4899', // Pink
    bg: 'rgba(236, 72, 153, 0.15)',
    border: 'rgba(236, 72, 153, 0.4)',
    icon: 'Coffee',
  },
  Travel: {
    color: '#3B82F6', // Blue
    bg: 'rgba(59, 130, 246, 0.15)',
    border: 'rgba(59, 130, 246, 0.4)',
    icon: 'Bus',
  },
  Shopping: {
    color: '#F59E0B', // Amber
    bg: 'rgba(245, 158, 11, 0.15)',
    border: 'rgba(245, 158, 11, 0.4)',
    icon: 'ShoppingBag',
  },
  Education: {
    color: '#10B981', // Emerald
    bg: 'rgba(16, 185, 129, 0.15)',
    border: 'rgba(16, 185, 129, 0.4)',
    icon: 'BookOpen',
  },
  Entertainment: {
    color: '#6366F1', // Indigo
    bg: 'rgba(99, 102, 241, 0.15)',
    border: 'rgba(99, 102, 241, 0.4)',
    icon: 'Film',
  },
  Personal: {
    color: '#14B8A6', // Teal
    bg: 'rgba(20, 184, 166, 0.15)',
    border: 'rgba(20, 184, 166, 0.4)',
    icon: 'User',
  },
  Other: {
    color: '#94A3B8', // Slate
    bg: 'rgba(148, 163, 184, 0.15)',
    border: 'rgba(148, 163, 184, 0.4)',
    icon: 'MoreHorizontal',
  },
};
