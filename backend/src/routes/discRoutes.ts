import express from 'express';
import { getQuestions, submitTest, getDiscAiReport } from '../controllers/discController';
import { authMiddleware as authenticateToken } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/questions', authenticateToken, getQuestions);
router.post('/submit', authenticateToken, submitTest);
router.get('/ai-report/:resultId', authenticateToken, getDiscAiReport);

export default router;
