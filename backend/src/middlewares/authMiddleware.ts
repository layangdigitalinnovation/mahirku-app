import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    roleId: number;
    [key: string]: any;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  console.log('=== AUTH MIDDLEWARE CALLED ===');
  console.log('DEBUG authMiddleware - Request method:', req.method);
  console.log('DEBUG authMiddleware - Request URL:', req.originalUrl);
  console.log('DEBUG authMiddleware - Timestamp:', new Date().toISOString());
  console.log('DEBUG authMiddleware - Cookies:', req.cookies);
  const authHeader = req.headers.authorization;
  console.log('DEBUG authMiddleware - Auth header:', authHeader);

  // Check for token in cookies first, then Authorization header
  const token = req.cookies.token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);
  console.log('DEBUG authMiddleware - Token source:', req.cookies.token ? 'cookie' : 'header');
  console.log('DEBUG authMiddleware - Extracted token:', token ? 'Present' : 'Missing');

  if (!token) {
    console.log('DEBUG authMiddleware - No token found in cookies or header');
    res.status(401).json({ message: 'Unauthorized: Token not provided' });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET as string;
    console.log('DEBUG authMiddleware - JWT_SECRET exists:', !!secret);
    const decoded = jwt.verify(token, secret) as JwtPayload;
    console.log('DEBUG authMiddleware - Decoded token:', JSON.stringify(decoded, null, 2));

    req.user = {
      userId: decoded.userId,
      roleId: decoded.roleId,
      ...decoded
    };
    console.log('DEBUG authMiddleware - Set req.user:', JSON.stringify(req.user, null, 2));
    console.log('DEBUG authMiddleware - req.user.userId:', req.user.userId);
    console.log('DEBUG authMiddleware - req.user.roleId:', req.user.roleId);
    console.log('DEBUG: authMiddleware completed successfully, calling next()');

    next();
  } catch (err) {
    console.log('DEBUG authMiddleware - Token verification failed:', err);
    res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};