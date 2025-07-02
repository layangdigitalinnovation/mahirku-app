import { Request, Response } from 'express';
import models from '../models';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: any;
}

export const register = async (req: Request, res: Response) => {
  try {
    const {
      username,
      email,
      password,
      fullname,
      address,
      phoneNumber,
      roleId
    } = req.body;

    // Batasi self-register hanya untuk Affiliator dan User (roleId 2 dan 3)
    const allowedRoles = [2, 3];
    if (!allowedRoles.includes(Number(roleId))) {
      res.status(403).json({ message: 'Forbidden role for self-registration' });
    } else {
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(409).json({ message: 'Email already registered.' });
      } else {
        const user = await models.User.create({
          username,
          email,
          password,
          fullname,
          address,
          phoneNumber,
          roleId
        });

        res.status(201).json({ message: 'User registered successfully', user });
      }
    }
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await models.User.findByEmail(email);
    if (!user || !(await user.comparePassword(password))) {
      res.status(401).json({ message: 'Invalid email or password' });
      return;
    }

    const token = user.generateAuthToken();
    res.json({ token, user });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: ['roles']
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
