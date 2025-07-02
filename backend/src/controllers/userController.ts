import { Request, Response } from 'express';
import User from '../models/User';
import bcrypt from 'bcryptjs';

/**
 * @route   GET /api/users
 * @desc    Get all users with their roles
 * @access  Admin only
 */
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      include: ['role'],
      attributes: { exclude: ['password'] }
    });
    res.status(200).json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Admin only
 */
export const createUser = async (req: Request, res: Response): Promise<void> => {
  const {
    username,
    email,
    password,
    fullname,
    phoneNumber,
    address,
    roleId
  } = req.body;

  try {
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(409).json({ message: 'Email already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      fullname,
      phoneNumber,
      address,
      roleId,
    });

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        fullname: newUser.fullname,
        phoneNumber: newUser.phoneNumber,
        address: newUser.address,
      }
    });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ error: 'Failed to create user' });
  }
};
