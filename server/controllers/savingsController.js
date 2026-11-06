import SavingsGoal from '../models/SavingsGoal.js';
import Notification from '../models/Notification.js';

// @desc    Get user savings goals
// @route   GET /api/savings
// @access  Private
export const getSavingsGoals = async (req, res, next) => {
  try {
    const goals = await SavingsGoal.find({ userId: req.user._id }).sort({ createdAt: -1 });

    const formattedGoals = goals.map((goal) => {
      const remainingAmount = Math.max(0, goal.targetAmount - goal.savedAmount);
      const progressPercent = Math.min(
        100,
        Math.round((goal.savedAmount / (goal.targetAmount || 1)) * 100)
      );

      return {
        _id: goal._id,
        title: goal.title,
        targetAmount: goal.targetAmount,
        savedAmount: goal.savedAmount,
        remainingAmount,
        progressPercent,
        deadline: goal.deadline,
        category: goal.category,
        status: goal.status,
        contributions: goal.contributions,
        createdAt: goal.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      goals: formattedGoals,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new savings goal
// @route   POST /api/savings
// @access  Private
export const createSavingsGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, savedAmount = 0, deadline, category } = req.body;

    if (!title || !targetAmount || !deadline) {
      return res.status(400).json({
        success: false,
        message: 'Title, target amount, and deadline are required',
      });
    }

    const numTarget = parseFloat(targetAmount);
    if (isNaN(numTarget) || numTarget <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Target amount must be greater than zero',
      });
    }

    const numSaved = parseFloat(savedAmount) || 0;

    const goal = await SavingsGoal.create({
      userId: req.user._id,
      title: title.trim(),
      targetAmount: numTarget,
      savedAmount: numSaved,
      deadline: new Date(deadline),
      category: category || 'General',
      status: numSaved >= numTarget ? 'completed' : 'active',
      contributions: numSaved > 0 ? [{ amount: numSaved, note: 'Initial deposit' }] : [],
    });

    res.status(201).json({
      success: true,
      message: 'Savings goal created successfully',
      goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update savings goal
// @route   PUT /api/savings/:id
// @access  Private
export const updateSavingsGoal = async (req, res, next) => {
  try {
    const { title, targetAmount, deadline, category, status } = req.body;

    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found or unauthorized',
      });
    }

    if (title) goal.title = title.trim();
    if (targetAmount !== undefined) {
      const num = parseFloat(targetAmount);
      if (isNaN(num) || num <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Target amount must be greater than zero',
        });
      }
      goal.targetAmount = num;
      if (goal.savedAmount >= num) {
        goal.status = 'completed';
      }
    }
    if (deadline) goal.deadline = new Date(deadline);
    if (category) goal.category = category;
    if (status) goal.status = status;

    await goal.save();

    res.status(200).json({
      success: true,
      message: 'Savings goal updated successfully',
      goal,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add contribution to savings goal
// @route   POST /api/savings/:id/contribute
// @access  Private
export const addContribution = async (req, res, next) => {
  try {
    const { amount, note, allowExceed } = req.body;

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Contribution amount must be greater than zero',
      });
    }

    const goal = await SavingsGoal.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found or unauthorized',
      });
    }

    const newTotal = goal.savedAmount + numAmount;
    if (newTotal > goal.targetAmount && !allowExceed) {
      return res.status(400).json({
        success: false,
        exceedsTarget: true,
        message: `This contribution will exceed your target of ₹${goal.targetAmount.toLocaleString('en-IN')}. Please confirm if you wish to exceed.`,
      });
    }

    goal.savedAmount = newTotal;
    goal.contributions.push({
      amount: numAmount,
      note: note ? note.trim() : 'Manual deposit',
      date: new Date(),
    });

    let completedJustNow = false;
    if (goal.savedAmount >= goal.targetAmount && goal.status !== 'completed') {
      goal.status = 'completed';
      completedJustNow = true;

      await Notification.create({
        userId: req.user._id,
        type: 'goal_reached',
        title: '🎯 Savings Goal Reached!',
        message: `Congratulations! You reached your goal "${goal.title}" by saving ₹${goal.savedAmount.toLocaleString('en-IN')}!`,
      });
    }

    await goal.save();

    res.status(200).json({
      success: true,
      message: completedJustNow
        ? `🎉 Woohoo! Goal "${goal.title}" reached!`
        : 'Contribution added successfully',
      goal,
      completedJustNow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete savings goal
// @route   DELETE /api/savings/:id
// @access  Private
export const deleteSavingsGoal = async (req, res, next) => {
  try {
    const goal = await SavingsGoal.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Savings goal not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Savings goal deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
