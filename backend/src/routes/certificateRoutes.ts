import express from 'express';
import { downloadCertificate } from '../controllers/certificateController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/thinking-style/:testId', authMiddleware, downloadCertificate);

export default router;
