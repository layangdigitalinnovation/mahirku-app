import { Response, NextFunction } from 'express';
import { AuthRequest } from './authMiddleware';

// Role ID Mapping (bisa diimpor dari DB kalau dinamis)
const ROLE = {
  SUPER_ADMIN: 1,
  AFFILIATOR: 2,
  USER: 3
};

// Cek apakah user memiliki role tertentu
export const checkRole = (...allowedRoles: number[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const user = req.user;
    console.log('DEBUG checkRole - Logged in user:', user); // ✅ Enhanced debug
    console.log('DEBUG checkRole - Allowed roles:', allowedRoles);

    if (!user) {
      console.log('DEBUG checkRole - No user found in request');
      res.status(401).json({ message: 'Unauthorized: No user found in request' });
      return;
    }

    if (!allowedRoles.includes(user.roleId)) {
      console.log('DEBUG checkRole - roleId not allowed:', user.roleId, 'Expected:', allowedRoles);
      res.status(403).json({ message: 'Forbidden: You do not have access' });
      return;
    }

    console.log('DEBUG checkRole - Role check passed, proceeding to next middleware');
    next();
  };
};

// Shortcut middleware (optional)
export const isAdmin = checkRole(ROLE.SUPER_ADMIN);
export const isAffiliator = checkRole(ROLE.AFFILIATOR);
export const isUser = checkRole(ROLE.USER);
