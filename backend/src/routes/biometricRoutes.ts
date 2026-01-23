import express from 'express';
import { registerKey, getChallenge, verifySignature } from '../controllers/biometricController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = express.Router();

router.post('/register-key', authMiddleware, registerKey);
router.get('/challenge', authMiddleware, getChallenge);
router.post('/verify', authMiddleware, verifySignature);

export default router;
