import express from 'express';
import { downloadCertificate, verifyCertificate } from '../controllers/certificateController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.get('/thinking-style/:testId', authMiddleware, downloadCertificate);
router.get('/verify/:certificateId', verifyCertificate); // Public route for verification

export default router;
