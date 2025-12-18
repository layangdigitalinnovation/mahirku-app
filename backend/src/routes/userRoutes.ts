import express from 'express';
import { getUsers, createUser, updateUser, deleteUser } from '../controllers/userController';
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
 * @route   POST /api/users/add
 * @desc    Create a new user
 * @access  Protected - Admin only
 */
router.post('/add', authMiddleware, isAdmin, createUser);

/**
 * @route   PUT /api/users/:id
 * @desc    Update a user
 * @access  Protected - Admin only
 */
router.put('/:id', authMiddleware, isAdmin, updateUser);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Protected - Admin only
 */
router.delete('/:id', authMiddleware, isAdmin, deleteUser);

export default router;
