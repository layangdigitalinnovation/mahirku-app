import { Router } from 'express';
import { register, login, getMe } from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Get current logged-in user
 * @access  Protected
 */
router.get('/me', authMiddleware, getMe);

export default router;
