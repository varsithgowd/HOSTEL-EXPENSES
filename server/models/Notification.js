import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['warning', 'danger', 'exceeded', 'goal_reached', 'info'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    threshold: {
      type: Number, // 70, 90, 100
      default: null,
    },
    period: {
      type: String, // e.g. "2026-11"
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate alert spam for the same user, period, and threshold
notificationSchema.index({ userId: 1, period: 1, threshold: 1 });
notificationSchema.index({ userId: 1, isRead: 1 });

export default mongoose.model('Notification', notificationSchema);

