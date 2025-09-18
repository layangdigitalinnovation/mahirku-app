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
  const authHeader = req.headers.authorization;

  // Check for token in cookies first, then Authorization header
  const token = req.cookies.token || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null);


  if (!token) {

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

    next();
  } catch (err) {
    console.log('DEBUG authMiddleware - Token verification failed:', err);
    res.status(403).json({ message: 'Forbidden: Invalid token' });
  }
};