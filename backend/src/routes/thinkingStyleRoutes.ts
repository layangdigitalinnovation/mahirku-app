import { Router } from 'express';
import { submitThinkingStyleTest, getThinkingStyleHistory, downloadThinkingStylePDF } from '../controllers/thinkingStyleController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { getThinkingStyleById } from '../controllers/adminThinkingStyleController';

const router = Router();

// Route untuk submit tes gaya berpikir
router.post('/submit', authMiddleware, submitThinkingStyleTest);
router.get('/history', authMiddleware, getThinkingStyleHistory);
router.get('/pdf/:resultId', authMiddleware, downloadThinkingStylePDF);
router.get('/:id' ,getThinkingStyleById);




export default router;
