import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

// Role ID Mapping (bisa diimpor dari DB kalau dinamis)
export const ROLE = {
  SUPER_ADMIN: 1,
  AFFILIATOR: 2,
  USER: 3,
  MITRA: 4
};

// Cek apakah user memiliki role tertentu
export const checkRole = (...allowedRoles: number[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: 'Unauthorized: No user found in request' });
      return;
    }

    if (!allowedRoles.includes(user.roleId)) {
      res.status(403).json({ message: 'Forbidden: You do not have access' });
      return;
    }

    next();
  };
};

// Shortcut middleware (optional)
export const isAdmin = checkRole(ROLE.SUPER_ADMIN);
export const isAffiliator = checkRole(ROLE.AFFILIATOR);
export const isUser = checkRole(ROLE.USER);
export const isMitra = checkRole(ROLE.MITRA);
