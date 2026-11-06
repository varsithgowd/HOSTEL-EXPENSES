import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import { generateFinancialAdvice } from '../services/aiService.js';

// @desc    Get AI Spending Analysis and Advice
// @route   POST /api/ai/chat
// @access  Private
export const askAssistant = async (req, res, next) => {
  try {
    const { message } = req.body;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Current month dates
    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    // Current month total
    const currentSpentAgg = await Expense.aggregate([
      { $match: { userId: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const currentTotalSpent = currentSpentAgg.length > 0 ? currentSpentAgg[0].total : 0;

    // Previous month dates
    const prevMonthDate = new Date(currentYear, currentMonth - 2, 1);
    const prevStart = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
    const prevEnd = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);

    const prevSpentAgg = await Expense.aggregate([
      { $match: { userId: req.user._id, date: { $gte: prevStart, $lte: prevEnd } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const prevTotalSpent = prevSpentAgg.length > 0 ? prevSpentAgg[0].total : 0;

    // Current Budget
    const budget = await Budget.findOne({
      userId: req.user._id,
      month: currentMonth,
      year: currentYear,
    });

    const monthlyLimit = budget ? budget.monthlyLimit : 8000;
    const dailyLimit = budget ? budget.dailyLimit : 300;
    const remainingBudget = Math.max(0, monthlyLimit - currentTotalSpent);
    const usagePercent = monthlyLimit > 0 ? Math.round((currentTotalSpent / monthlyLimit) * 100) : 0;

    // Categories breakdown
    const categoryAgg = await Expense.aggregate([
      { $match: { userId: req.user._id, date: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
    ]);

    const categoryBreakdown = categoryAgg.map((c) => ({
      category: c._id,
      total: c.total,
      percentage: currentTotalSpent > 0 ? Math.round((c.total / currentTotalSpent) * 100) : 0,
    }));

    // Recent 5 expenses
    const recentExpenses = await Expense.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    // Call AI Service
    const adviceResult = await generateFinancialAdvice({
      userMessage: message,
      currentMonthSummary: {
        totalSpent: currentTotalSpent,
        remainingBudget,
        usagePercent,
      },
      previousMonthSummary: {
        totalSpent: prevTotalSpent,
      },
      categoryBreakdown,
      budget: {
        monthlyLimit,
        dailyLimit,
      },
      recentExpenses,
    });

    res.status(200).json({
      success: true,
      data: {
        reply: adviceResult.reply,
        source: adviceResult.source,
        metrics: {
          currentTotalSpent,
          monthlyLimit,
          remainingBudget,
          usagePercent,
          topCategory: categoryBreakdown[0] || null,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
