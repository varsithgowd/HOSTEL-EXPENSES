import express from 'express';
import {
  getCurrentBudget,
  setBudget,
  getBudgetHistory,
} from '../controllers/budgetController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/current', getCurrentBudget);
router.post('/', setBudget);
router.put('/current', setBudget);
router.get('/history', getBudgetHistory);

export default router;
