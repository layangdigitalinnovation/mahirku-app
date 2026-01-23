import express from 'express';
import { getQuestions, submitTest } from '../controllers/discController';
import { authMiddleware as authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/questions', authenticateToken, getQuestions);
router.post('/submit', authenticateToken, submitTest);

export default router;
