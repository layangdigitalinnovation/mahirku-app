import { Request, Response } from 'express';
import crypto from 'crypto';
import User from '../models/User';
import BiometricChallenge from '../models/BiometricChallenge';
import { AuthRequest } from '../middlewares/authMiddleware';

const toPem = (publicKeyBase64: string): string => {
  const wrapped = publicKeyBase64.match(/.{1,64}/g)?.join('\n') || publicKeyBase64;
  return `-----BEGIN PUBLIC KEY-----\n${wrapped}\n-----END PUBLIC KEY-----`;
};

export const registerPublicKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { publicKey } = req.body;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    if (!publicKey) {
      res.status(400).json({ message: 'publicKey is required' });
      return;
    }
    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    await user.update({ biometricPublicKey: publicKey });
    res.status(200).json({ message: 'Biometric public key registered' });
  } catch (err: any) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const requestChallengeByEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ message: 'email is required' });
      return;
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    const challenge = crypto.randomBytes(32).toString('base64');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const rec = await BiometricChallenge.create({ userId: user.id, challenge, expiresAt });
    res.status(200).json({ challengeId: rec.id, challenge });
  } catch (err: any) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const requestChallengeAuthenticated = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }
    const challenge = crypto.randomBytes(32).toString('base64');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const rec = await BiometricChallenge.create({ userId, challenge, expiresAt });
    res.status(200).json({ challengeId: rec.id, challenge });
  } catch (err: any) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const verifyLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, challengeId, signature } = req.body;
    if (!email || !challengeId || !signature) {
      res.status(400).json({ message: 'email, challengeId, signature are required' });
      return;
    }
    const user = await User.findOne({ where: { email } });
    if (!user || !user.biometricPublicKey) {
      res.status(404).json({ message: 'User or biometric key not found' });
      return;
    }
    const rec = await BiometricChallenge.findByPk(challengeId);
    if (!rec || rec.userId !== user.id) {
      res.status(400).json({ message: 'Invalid challenge' });
      return;
    }
    if (rec.used || rec.expiresAt.getTime() < Date.now()) {
      res.status(400).json({ message: 'Challenge expired or used' });
      return;
    }
    const verifier = crypto.createVerify('SHA256');
    verifier.update(rec.challenge);
    verifier.end();
    const pem = toPem(user.biometricPublicKey);
    const valid = verifier.verify(pem, Buffer.from(signature, 'base64'));
    if (!valid) {
      res.status(401).json({ message: 'Invalid signature' });
      return;
    }
    await rec.update({ used: true });
    const token = user.generateAuthToken();
    res.status(200).json({ token, user });
  } catch (err: any) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

export const verifyChallengeAuthenticated = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { challengeId, signature } = req.body;
    if (!userId || !challengeId || !signature) {
      res.status(400).json({ message: 'user, challengeId, signature are required' });
      return;
    }
    const user = await User.findByPk(userId);
    if (!user || !user.biometricPublicKey) {
      res.status(404).json({ message: 'User or biometric key not found' });
      return;
    }
    const rec = await BiometricChallenge.findByPk(challengeId);
    if (!rec || rec.userId !== user.id) {
      res.status(400).json({ message: 'Invalid challenge' });
      return;
    }
    if (rec.used || rec.expiresAt.getTime() < Date.now()) {
      res.status(400).json({ message: 'Challenge expired or used' });
      return;
    }
    const verifier = crypto.createVerify('SHA256');
    verifier.update(rec.challenge);
    verifier.end();
    const pem = toPem(user.biometricPublicKey);
    const valid = verifier.verify(pem, Buffer.from(signature, 'base64'));
    if (!valid) {
      res.status(401).json({ message: 'Invalid signature' });
      return;
    }
    await rec.update({ used: true });
    res.status(200).json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};
