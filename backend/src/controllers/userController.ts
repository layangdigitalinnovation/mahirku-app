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

/**
 * @route   PUT /api/users/:id
 * @desc    Update user details
 * @access  Admin only
 */
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const {
    username,
    email,
    password,
    fullname,
    phoneNumber,
    address,
    roleId,
    tokens
  } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if email/username is taken by another user
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        res.status(409).json({ message: 'Email already in use' });
        return;
      }
    }

    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        res.status(409).json({ message: 'Username already in use' });
        return;
      }
    }

    // Update basic fields
    if (username) user.username = username;
    if (email) user.email = email;
    if (fullname) user.fullname = fullname;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (address) user.address = address;
    if (roleId) user.roleId = roleId;
    if (tokens !== undefined) user.tokens = tokens;

    // Update password if provided
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullname: user.fullname,
        roleId: user.roleId,
      }
    });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Admin only
 */
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id, { include: ['role'] });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if user is super admin
    if (user.role && (user.role as any).name === 'super_admin') {
      res.status(403).json({ message: 'Cannot delete Super Admin account' });
      return;
    }

    await user.destroy();

    res.status(200).json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
