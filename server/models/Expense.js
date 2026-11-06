import mongoose from 'mongoose';

export const EXPENSE_CATEGORIES = [
  'Food',
  'Snacks',
  'Travel',
  'Shopping',
  'Education',
  'Entertainment',
  'Personal',
  'Other',
];

export const PAYMENT_METHODS = [
  'Cash',
  'UPI',
  'Debit Card',
  'Credit Card',
  'Other',
];

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Expense title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: EXPENSE_CATEGORIES,
        message: '{VALUE} is not a valid category',
      },
    },
    paymentMethod: {
      type: String,
      enum: {
        values: PAYMENT_METHODS,
        message: '{VALUE} is not a valid payment method',
      },
      default: 'UPI',
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Description cannot exceed 300 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for querying user expenses sorted by date
expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1 });

export default mongoose.model('Expense', expenseSchema);

