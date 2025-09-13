import { Router } from 'express';
import { submitThinkingStyleTest, getThinkingStyleHistory, downloadThinkingStylePDF } from '../controllers/thinkingStyleController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Route untuk submit tes gaya berpikir
router.post('/submit', authMiddleware, submitThinkingStyleTest);
router.get('/history', authMiddleware, getThinkingStyleHistory);
router.get('/pdf/:resultId', authMiddleware, downloadThinkingStylePDF);



export default router;
