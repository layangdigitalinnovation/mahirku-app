import { Router } from 'express';
import { uploadGraphologyImage, getGraphologyResult } from '../controllers/GraphologyController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';

const router = Router();

router.post('/upload', authMiddleware, uploadMiddleware.single('image'), uploadGraphologyImage);
router.get('/result/:test_id', authMiddleware, getGraphologyResult);

export default router;
