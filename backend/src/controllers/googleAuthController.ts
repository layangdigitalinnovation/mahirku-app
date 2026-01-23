import { Request, Response } from 'express';
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    res.status(501).json({ message: 'Google OAuth login is temporarily disabled' });
};
