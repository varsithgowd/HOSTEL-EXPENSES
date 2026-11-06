import express from 'express';
import {
  getSummary,
  getCategoryBreakdown,
  getDailySpending,
  getMonthlyTrends,
} from '../controllers/analyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/summary', getSummary);
router.get('/categories', getCategoryBreakdown);
router.get('/daily', getDailySpending);
router.get('/monthly', getMonthlyTrends);

export default router;
