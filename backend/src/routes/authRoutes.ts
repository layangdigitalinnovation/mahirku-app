import { Router } from 'express';
import {
  login,
  getMe,
  registerUser,
  registerAffiliator,
} from '../controllers/authController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   POST /api/auth/register-user
 * @desc    Register user biasa (publik)
 */
router.post('/register-user', registerUser);

/**
 * @route   POST /api/auth/register-affiliator
 * @desc    Register affiliator (akses dari halaman khusus affiliator)
 */
router.post('/register-affiliator', registerAffiliator);

/**
 * @route   POST /api/auth/login
 * @desc    Login user dan dapatkan JWT token
 */
router.post('/login', login);

/**
 * @route   GET /api/auth/me
 * @desc    Ambil data user yang sedang login
 * @access  Protected
 */
router.get('/me', authMiddleware, getMe);

export default router;
