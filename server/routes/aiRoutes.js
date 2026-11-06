import express from 'express';
import { askAssistant } from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/chat', askAssistant);

export default router;
