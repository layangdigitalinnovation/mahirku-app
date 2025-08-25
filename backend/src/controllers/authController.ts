import { Request, Response } from 'express';
import models from '../models';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Fungsi reusable untuk register user berdasarkan role
const registerUserWithRole = async (
  req: Request,
  res: Response,
  roleId: number
): Promise<void> => {
  try {
    const {
      username,
      email,
      password,
      fullname,
      address,
      phoneNumber,
    } = req.body;

    // Validasi email dan password dasar
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    // Cek apakah user sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: 'Email already registered.' });
      return;
    }

    // Buat user baru
    const user = await models.User.create({
      username,
      email,
      password,
      fullname,
      address,
      phoneNumber,
      roleId,
    });

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Endpoint khusus untuk user biasa (publik)
export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const roleId = req.body.roleId || 3; // default ke 3 jika tidak dikirim
  await registerUserWithRole(req, res, roleId);
}

// Endpoint khusus untuk affiliator (landing page berbeda)
export const registerAffiliator = async (req: Request, res: Response): Promise<void> => {
  await registerUserWithRole(req, res, 2); // roleId 2 = affiliator
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required.' });
      return;
    }

    const user = await models.User.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = user.generateAuthToken();
    res.status(200).json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current user info
export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: ['roles'], // Pastikan relasi 'roles' tersedia di model
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
