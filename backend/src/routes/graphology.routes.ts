import { Router } from 'express';
import { uploadGraphologyImage, getGraphologyResult } from '../controllers/GraphologyController';
import { uploadMiddleware } from '../middlewares/uploadMiddleware';

const router = Router();

router.post('/upload', uploadMiddleware.single('image'), uploadGraphologyImage);
router.get('/result/:test_id', getGraphologyResult);

export default router;
