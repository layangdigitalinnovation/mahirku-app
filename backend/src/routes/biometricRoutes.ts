import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import {
  registerPublicKey,
  requestChallengeByEmail,
  verifyLogin,
  requestChallengeAuthenticated,
  verifyChallengeAuthenticated,
} from '../controllers/biometricController';

const router = Router();

router.post('/register', authMiddleware, registerPublicKey);
router.post('/challenge', requestChallengeByEmail);
router.post('/verify-login', verifyLogin);
router.post('/challenge/auth', authMiddleware, requestChallengeAuthenticated);
router.post('/verify/auth', authMiddleware, verifyChallengeAuthenticated);

export default router;
