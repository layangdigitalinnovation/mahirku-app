import express from 'express';
import { getUsers, createUser } from '../controllers/userController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { isAdmin } from '../middlewares/roleMiddleware';

const router = express.Router();

/**
 * @route   GET /api/users
 * @desc    Get all users
 * @access  Protected - Admin only
 */
router.get('/', authMiddleware, isAdmin, getUsers);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Protected - Admin only
 */
router.post('/add', authMiddleware, isAdmin, createUser);

export default router;
