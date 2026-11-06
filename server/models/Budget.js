import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    dailyLimit: {
      type: Number,
      required: [true, 'Daily limit is required'],
      min: [0, 'Daily limit cannot be negative'],
      default: 300,
    },
    monthlyLimit: {
      type: Number,
      required: [true, 'Monthly limit is required'],
      min: [0, 'Monthly limit cannot be negative'],
      default: 8000,
    },
    month: {
      type: Number,
      required: true,
      min: 1,
      max: 12,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
  },
  {
    timestamps: true,
  }
);

// One budget per user per month/year
budgetSchema.index({ userId: 1, month: 1, year: 1 }, { unique: true });

export default mongoose.model('Budget', budgetSchema);
