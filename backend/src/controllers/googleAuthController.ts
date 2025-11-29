import { Request, Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

interface GoogleLoginBody {
    idToken: string;
}

export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { idToken } = req.body as GoogleLoginBody;

        if (!idToken) {
            res.status(400).json({ message: 'ID token is required' });
            return;
        }

        // Verify Google ID token
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload) {
            res.status(401).json({ message: 'Invalid token' });
            return;
        }

        const { sub: googleId, email, name, picture } = payload;

        if (!email) {
            res.status(400).json({ message: 'Email not found in Google account' });
            return;
        }

        // Check if user exists by googleId
        let user = await User.findOne({ where: { googleId } });

        if (!user) {
            // Check if user exists by email
            user = await User.findOne({ where: { email } });

            if (user) {
                // Link Google account to existing user
                user.googleId = googleId;
                user.googleEmail = email;
                await user.save();
            } else {
                // Create new user
                user = await User.create({
                    username: email.split('@')[0], // Use email prefix as username
                    email,
                    fullname: name || 'Google User',
                    address: '-',
                    phoneNumber: '-',
                    roleId: 3, // User role
                    tokens: 0,
                    googleId,
                    googleEmail: email,
                    // password is optional for Google users
                });
            }
        }

        // Generate JWT token
        const token = user.generateAuthToken();

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullname: user.fullname,
                roleId: user.roleId,
                tokens: user.tokens,
            },
        });
    } catch (error: any) {
        console.error('Google login error:', error);
        res.status(500).json({
            message: 'Google login failed',
            error: error.message
        });
    }
};
