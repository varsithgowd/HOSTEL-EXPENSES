import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import { checkAndGenerateAlerts } from '../services/alertService.js';

// Calculate budget status label
export const getBudgetStatus = (usagePercent) => {
  if (usagePercent >= 100) return { label: 'Exceeded', level: 'danger' };
  if (usagePercent >= 90) return { label: 'Danger', level: 'danger' };
  if (usagePercent >= 70) return { label: 'Warning', level: 'warning' };
  return { label: 'Normal', level: 'success' };
};

// @desc    Get current user budget with real spending calculations
// @route   GET /api/budgets/current
// @access  Private
export const getCurrentBudget = async (req, res, next) => {
  try {
    const now = new Date();
    const month = parseInt(req.query.month, 10) || now.getMonth() + 1;
    const year = parseInt(req.query.year, 10) || now.getFullYear();

    let budget = await Budget.findOne({
      userId: req.user._id,
      month,
      year,
    });

    // If no budget exists yet for this month, create default
    if (!budget) {
      budget = await Budget.create({
        userId: req.user._id,
        month,
        year,
        dailyLimit: 300,
        monthlyLimit: 8000,
      });
    }

    // Calculate total spending for this month
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    const monthlySpentAgg = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startOfMonth, $lte: endOfMonth },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalMonthlySpent = monthlySpentAgg.length > 0 ? monthlySpentAgg[0].total : 0;
    const monthlyLimit = budget.monthlyLimit || 0;
    const remainingMonthly = Math.max(0, monthlyLimit - totalMonthlySpent);
    const monthlyUsagePercent = monthlyLimit > 0
      ? Math.round((totalMonthlySpent / monthlyLimit) * 100)
      : 0;

    // Calculate today's spending
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const todaySpentAgg = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          date: { $gte: startOfDay, $lte: endOfDay },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const totalTodaySpent = todaySpentAgg.length > 0 ? todaySpentAgg[0].total : 0;
    const dailyLimit = budget.dailyLimit || 0;
    const remainingDaily = Math.max(0, dailyLimit - totalTodaySpent);
    const dailyUsagePercent = dailyLimit > 0
      ? Math.round((totalTodaySpent / dailyLimit) * 100)
      : 0;

    const monthlyStatus = getBudgetStatus(monthlyUsagePercent);
    const dailyStatus = getBudgetStatus(dailyUsagePercent);

    // Active alert list
    const alerts = await checkAndGenerateAlerts(req.user._id, now);

    res.status(200).json({
      success: true,
      budget: {
        _id: budget._id,
        month: budget.month,
        year: budget.year,
        dailyLimit: budget.dailyLimit,
        monthlyLimit: budget.monthlyLimit,
        totalMonthlySpent,
        remainingMonthly,
        monthlyUsagePercent,
        monthlyStatus: monthlyStatus.label,
        monthlyStatusLevel: monthlyStatus.level,
        totalTodaySpent,
        remainingDaily,
        dailyUsagePercent,
        dailyStatus: dailyStatus.label,
        dailyStatusLevel: dailyStatus.level,
      },
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Set or update current budget limits
// @route   POST /api/budgets & PUT /api/budgets/current
// @access  Private
export const setBudget = async (req, res, next) => {
  try {
    const { dailyLimit, monthlyLimit, month, year } = req.body;

    const targetDate = new Date();
    const targetMonth = month ? parseInt(month, 10) : targetDate.getMonth() + 1;
    const targetYear = year ? parseInt(year, 10) : targetDate.getFullYear();

    if (dailyLimit !== undefined && (isNaN(dailyLimit) || Number(dailyLimit) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Daily limit cannot be negative',
      });
    }

    if (monthlyLimit !== undefined && (isNaN(monthlyLimit) || Number(monthlyLimit) < 0)) {
      return res.status(400).json({
        success: false,
        message: 'Monthly limit cannot be negative',
      });
    }

    let budget = await Budget.findOne({
      userId: req.user._id,
      month: targetMonth,
      year: targetYear,
    });

    if (budget) {
      if (dailyLimit !== undefined) budget.dailyLimit = Number(dailyLimit);
      if (monthlyLimit !== undefined) budget.monthlyLimit = Number(monthlyLimit);
      await budget.save();
    } else {
      budget = await Budget.create({
        userId: req.user._id,
        month: targetMonth,
        year: targetYear,
        dailyLimit: dailyLimit !== undefined ? Number(dailyLimit) : 300,
        monthlyLimit: monthlyLimit !== undefined ? Number(monthlyLimit) : 8000,
      });
    }

    // Recalculate alerts
    const alerts = await checkAndGenerateAlerts(req.user._id, targetDate);

    res.status(200).json({
      success: true,
      message: 'Budget limits updated successfully',
      budget,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get historical budgets
// @route   GET /api/budgets/history
// @access  Private
export const getBudgetHistory = async (req, res, next) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id })
      .sort({ year: -1, month: -1 })
      .limit(12);

    res.status(200).json({
      success: true,
      budgets,
    });
  } catch (error) {
    next(error);
  }
};
