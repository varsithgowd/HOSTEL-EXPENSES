import Expense, { EXPENSE_CATEGORIES, PAYMENT_METHODS } from '../models/Expense.js';
import { checkAndGenerateAlerts } from '../services/alertService.js';

// @desc    Get user expenses with search, filter, sort, pagination
// @route   GET /api/expenses
// @access  Private
export const getExpenses = async (req, res, next) => {
  try {
    const {
      search,
      category,
      paymentMethod,
      startDate,
      endDate,
      sortBy = 'date',
      order = 'desc',
      page = 1,
      limit = 10,
    } = req.query;

    const query = { userId: req.user._id };

    // Search by title or description
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by payment method
    if (paymentMethod && paymentMethod !== 'All') {
      query.paymentMethod = paymentMethod;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Sorting
    const sortOptions = {};
    const sortField = ['date', 'amount', 'title'].includes(sortBy) ? sortBy : 'date';
    sortOptions[sortField] = order === 'asc' ? 1 : -1;

    // Pagination
    const pageNum = Math.max(1, parseInt(page, 10));
    const pageSize = Math.max(1, parseInt(limit, 10));
    const skip = (pageNum - 1) * pageSize;

    const total = await Expense.countDocuments(query);
    const expenses = await Expense.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    // Also calculate total sum for the current filter
    const totalAmountAgg = await Expense.aggregate([
      { $match: query },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const filteredTotalAmount = totalAmountAgg.length > 0 ? totalAmountAgg[0].total : 0;

    res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / pageSize) || 1,
      filteredTotalAmount,
      expenses,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single expense by ID
// @route   GET /api/expenses/:id
// @access  Private
export const getExpenseById = async (req, res, next) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or unauthorized',
      });
    }

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new expense
// @route   POST /api/expenses
// @access  Private
export const createExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, paymentMethod, description } = req.body;

    if (!title || !amount || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, amount, and category are required',
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than zero',
      });
    }

    if (!EXPENSE_CATEGORIES.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Invalid category. Must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
      });
    }

    const expense = await Expense.create({
      userId: req.user._id,
      title: title.trim(),
      amount: numAmount,
      category,
      paymentMethod: paymentMethod || 'UPI',
      date: date ? new Date(date) : new Date(),
      description: description ? description.trim() : '',
    });

    // Check alerts and thresholds
    const alerts = await checkAndGenerateAlerts(req.user._id, expense.date);

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update expense
// @route   PUT /api/expenses/:id
// @access  Private
export const updateExpense = async (req, res, next) => {
  try {
    const { title, amount, category, date, paymentMethod, description } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or unauthorized',
      });
    }

    if (amount !== undefined) {
      const numAmount = parseFloat(amount);
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Amount must be greater than zero',
        });
      }
      expense.amount = numAmount;
    }

    if (category) {
      if (!EXPENSE_CATEGORIES.includes(category)) {
        return res.status(400).json({
          success: false,
          message: `Invalid category. Must be one of: ${EXPENSE_CATEGORIES.join(', ')}`,
        });
      }
      expense.category = category;
    }

    if (title) expense.title = title.trim();
    if (paymentMethod) expense.paymentMethod = paymentMethod;
    if (date) expense.date = new Date(date);
    if (description !== undefined) expense.description = description.trim();

    await expense.save();

    // Recalculate alerts
    const alerts = await checkAndGenerateAlerts(req.user._id, expense.date);

    res.status(200).json({
      success: true,
      message: 'Expense updated successfully',
      expense,
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
export const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found or unauthorized',
      });
    }

    // Recalculate alerts
    const alerts = await checkAndGenerateAlerts(req.user._id, expense.date);

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully',
      alerts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Seed sample hostel expenses for new student
// @route   POST /api/expenses/seed-demo
// @access  Private
export const seedDemoExpenses = async (req, res, next) => {
  try {
    const now = new Date();
    const demoData = [
      { title: 'Hostel Canteen Breakfast', amount: 80, category: 'Food', paymentMethod: 'UPI', daysAgo: 0, description: 'Idli & filter coffee' },
      { title: 'Evening Chai & Samosa', amount: 50, category: 'Snacks', paymentMethod: 'Cash', daysAgo: 0, description: 'With hostel wingmates' },
      { title: 'College Bus Monthly Pass', amount: 450, category: 'Travel', paymentMethod: 'UPI', daysAgo: 1, description: 'Campus transit' },
      { title: 'Data Structures Notebooks & Pens', amount: 220, category: 'Education', paymentMethod: 'UPI', daysAgo: 2, description: 'Stationery shop' },
      { title: 'Weekend Movie Night', amount: 280, category: 'Entertainment', paymentMethod: 'Debit Card', daysAgo: 3, description: 'Cinema ticket' },
      { title: 'Shampoo, Soap & Toothpaste', amount: 310, category: 'Personal', paymentMethod: 'UPI', daysAgo: 4, description: 'Hostel toiletries' },
      { title: 'Hostel Mess Special Dinner', amount: 160, category: 'Food', paymentMethod: 'UPI', daysAgo: 5, description: 'Paneer butter masala feast' },
      { title: 'Midnight Maggi & Chips', amount: 90, category: 'Snacks', paymentMethod: 'Cash', daysAgo: 6, description: 'Study session munchies' },
      { title: 'Auto Ride to Railway Station', amount: 120, category: 'Travel', paymentMethod: 'Cash', daysAgo: 7, description: 'Weekend trip home' },
      { title: 'College Fest T-Shirt', amount: 499, category: 'Shopping', paymentMethod: 'UPI', daysAgo: 8, description: 'Techfest merchandise' },
      { title: 'Library Book Photostat & Bind', amount: 140, category: 'Education', paymentMethod: 'UPI', daysAgo: 10, description: 'Engineering syllabus notes' },
      { title: 'Hostel Laundry Service', amount: 200, category: 'Personal', paymentMethod: 'Cash', daysAgo: 12, description: 'Ironing and wash' },
    ];

    const records = demoData.map((item) => {
      const d = new Date(now);
      d.setDate(d.getDate() - item.daysAgo);
      return {
        userId: req.user._id,
        title: item.title,
        amount: item.amount,
        category: item.category,
        paymentMethod: item.paymentMethod,
        date: d,
        description: item.description,
      };
    });

    await Expense.insertMany(records);
    await checkAndGenerateAlerts(req.user._id, now);

    res.status(201).json({
      success: true,
      message: 'Demo hostel expenses seeded successfully!',
    });
  } catch (error) {
    next(error);
  }
};
