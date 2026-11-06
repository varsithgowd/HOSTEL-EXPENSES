import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';

// Helper to get date boundaries
const getDateRange = (filter, startDate, endDate, reqMonth, reqYear) => {
  const now = new Date();
  let start, end;

  if (filter === 'previous') {
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    start = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth(), 1);
    end = new Date(prevMonthDate.getFullYear(), prevMonthDate.getMonth() + 1, 0, 23, 59, 59, 999);
  } else if (filter === 'custom' && startDate && endDate) {
    start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
  } else if (reqMonth && reqYear) {
    const m = parseInt(reqMonth, 10);
    const y = parseInt(reqYear, 10);
    start = new Date(y, m - 1, 1);
    end = new Date(y, m, 0, 23, 59, 59, 999);
  } else {
    // Current month by default
    start = new Date(now.getFullYear(), now.getMonth(), 1);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
  }

  return { start, end };
};

// @desc    Get dashboard analytics summary
// @route   GET /api/analytics/summary
// @access  Private
export const getSummary = async (req, res, next) => {
  try {
    const { filter, startDate, endDate, month, year } = req.query;
    const { start, end } = getDateRange(filter, startDate, endDate, month, year);

    // 1. Total spending in range
    const spendingAgg = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const totalSpent = spendingAgg.length > 0 ? spendingAgg[0].total : 0;
    const totalTransactions = spendingAgg.length > 0 ? spendingAgg[0].count : 0;

    // 2. Days in range for daily average calculation
    const daysDiff = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
    const averageDailyExpense = Math.round(totalSpent / daysDiff);

    // 3. Compare with equivalent previous period
    const prevDurationMs = end.getTime() - start.getTime();
    const prevStart = new Date(start.getTime() - prevDurationMs);
    const prevEnd = new Date(start.getTime() - 1);

    const prevSpendingAgg = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: prevStart, $lte: prevEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const prevTotalSpent = prevSpendingAgg.length > 0 ? prevSpendingAgg[0].total : 0;
    const spendingDifference = totalSpent - prevTotalSpent;
    const spendingDiffPercent = prevTotalSpent > 0
      ? Math.round(((totalSpent - prevTotalSpent) / prevTotalSpent) * 100)
      : totalSpent > 0 ? 100 : 0;

    // 4. Highest spending day
    const highestDayAgg = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          dayTotal: { $sum: '$amount' },
        },
      },
      { $sort: { dayTotal: -1 } },
      { $limit: 1 },
    ]);

    const highestDay = highestDayAgg.length > 0
      ? { date: highestDayAgg[0]._id, amount: highestDayAgg[0].dayTotal }
      : null;

    // 5. Category breakdown
    const categoryAgg = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const categories = categoryAgg.map((item) => ({
      category: item._id,
      total: item.total,
      count: item.count,
      percentage: totalSpent > 0 ? Math.round((item.total / totalSpent) * 100) : 0,
    }));

    const highestCategory = categories.length > 0 ? categories[0] : null;

    // 6. Recent 5 transactions
    const recentTransactions = await Expense.find({ userId: req.user._id })
      .sort({ date: -1 })
      .limit(5);

    // 7. Active monthly budget
    const activeMonth = start.getMonth() + 1;
    const activeYear = start.getFullYear();
    const budget = await Budget.findOne({
      userId: req.user._id,
      month: activeMonth,
      year: activeYear,
    });

    const monthlyLimit = budget ? budget.monthlyLimit : 8000;
    const dailyLimit = budget ? budget.dailyLimit : 300;
    const remainingBudget = Math.max(0, monthlyLimit - totalSpent);
    const budgetUsagePercent = monthlyLimit > 0
      ? Math.round((totalSpent / monthlyLimit) * 100)
      : 0;

    // Today's spending
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayAgg = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: todayStart, $lte: todayEnd },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const todaySpent = todayAgg.length > 0 ? todayAgg[0].total : 0;

    res.status(200).json({
      success: true,
      data: {
        dateRange: { start, end },
        totalSpent,
        totalTransactions,
        averageDailyExpense,
        previousPeriod: {
          totalSpent: prevTotalSpent,
          difference: spendingDifference,
          percentage: spendingDiffPercent,
        },
        highestCategory,
        highestDay,
        categories,
        recentTransactions,
        budget: {
          monthlyLimit,
          dailyLimit,
          remainingBudget,
          budgetUsagePercent,
        },
        todaySpent,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get category-wise spending
// @route   GET /api/analytics/categories
// @access  Private
export const getCategoryBreakdown = async (req, res, next) => {
  try {
    const { filter, startDate, endDate, month, year } = req.query;
    const { start, end } = getDateRange(filter, startDate, endDate, month, year);

    const totalAgg = await Expense.aggregate([
      { $match: { userId: req.user._id, date: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const overallTotal = totalAgg.length > 0 ? totalAgg[0].total : 0;

    const categories = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const result = categories.map((c) => ({
      name: c._id,
      total: c.total,
      count: c.count,
      percentage: overallTotal > 0 ? Math.round((c.total / overallTotal) * 100) : 0,
    }));

    res.status(200).json({
      success: true,
      totalSpent: overallTotal,
      categories: result,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily spending trend
// @route   GET /api/analytics/daily
// @access  Private
export const getDailySpending = async (req, res, next) => {
  try {
    const { filter, startDate, endDate, month, year } = req.query;
    const { start, end } = getDateRange(filter, startDate, endDate, month, year);

    const daily = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format dates nicely as 'DD MMM'
    const formatted = daily.map((d) => {
      const parts = d._id.split('-');
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      return {
        rawDate: d._id,
        date: dateObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        amount: d.total,
        count: d.count,
      };
    });

    res.status(200).json({
      success: true,
      daily: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly spending trend (last 6-12 months)
// @route   GET /api/analytics/monthly
// @access  Private
export const getMonthlyTrends = async (req, res, next) => {
  try {
    const now = new Date();
    // 6 months ago start
    const startRange = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyAgg = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startRange, $lte: now },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const trends = monthlyAgg.map((item) => ({
      year: item._id.year,
      monthNum: item._id.month,
      month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
      total: item.total,
      count: item.count,
    }));

    res.status(200).json({
      success: true,
      trends,
    });
  } catch (error) {
    next(error);
  }
};
