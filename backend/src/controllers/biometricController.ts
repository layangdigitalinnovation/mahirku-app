import { Request, Response } from 'express';
import crypto from 'crypto';
import BiometricKey from '../models/BiometricKey';
import BiometricChallenge from '../models/BiometricChallenge';
import { Op } from 'sequelize';

// Register Public Key
export const registerKey = async (req: Request, res: Response): Promise<void> => {
  try {
    const { publicKey, deviceId } = req.body;
    const userId = (req as any).user.userId; // Assuming auth middleware adds user to req

    if (!publicKey) {
      res.status(400).json({ message: 'Public key is required' });
      return;
    }

    // Check if key already exists for this device
    const existingKey = await BiometricKey.findOne({
      where: { userId, deviceId: deviceId || null }
    });

    if (existingKey) {
      existingKey.publicKey = publicKey;
      await existingKey.save();
    } else {
      await BiometricKey.create({
        userId,
        publicKey,
        deviceId
      });
    }

    res.status(200).json({ message: 'Public key registered successfully' });
  } catch (error: any) {
    console.error('registerKey error:', error);
    res.status(500).json({ message: 'Failed to register key', error: error.message });
  }
};

// Get Challenge
export const getChallenge = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;

    // Generate random challenge
    const challenge = crypto.randomBytes(32).toString('base64');

    // Set expiration (e.g., 5 minutes)
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await BiometricChallenge.create({
      userId,
      challenge,
      expiresAt
    });

    res.status(200).json({ challenge });
  } catch (error: any) {
    console.error('getChallenge error:', error);
    res.status(500).json({ message: 'Failed to generate challenge', error: error.message });
  }
};

// Verify Signature
export const verifySignature = async (req: Request, res: Response): Promise<void> => {
  try {
    const { signature, challenge } = req.body;
    const userId = (req as any).user.userId;

    if (!signature || !challenge) {
      res.status(400).json({ message: 'Signature and challenge are required' });
      return;
    }

    // 1. Verify challenge validity
    const validChallenge = await BiometricChallenge.findOne({
      where: {
        userId,
        challenge,
        expiresAt: { [Op.gt]: new Date() }
      }
    });

    if (!validChallenge) {
      res.status(401).json({ message: 'Invalid or expired challenge' });
      return;
    }

    // 2. Get user's public key
    const biometricKey = await BiometricKey.findOne({
      where: { userId }
    });

    if (!biometricKey) {
      res.status(404).json({ message: 'Biometric key not found' });
      return;
    }

    // 3. Verify signature
    try {
      console.log('Verifying signature...');
      console.log('Challenge:', challenge);
      console.log('Signature length:', signature?.length);
      console.log('Public Key from DB:', biometricKey.publicKey.substring(0, 50) + '...');

      // Clean the public key string
      let cleanKey = biometricKey.publicKey.trim();
      // Remove quotes if present
      if (cleanKey.startsWith('"') && cleanKey.endsWith('"')) {
        cleanKey = cleanKey.slice(1, -1);
      }

      // react-native-biometrics returns public key as base64-encoded SPKI (DER format)
      const publicKeyBuffer = Buffer.from(cleanKey, 'base64');

      // Create a public key object from the SPKI buffer
      const publicKeyObject = crypto.createPublicKey({
        key: publicKeyBuffer,
        format: 'der',
        type: 'spki'
      });

      const verifier = crypto.createVerify('RSA-SHA256');
      verifier.update(challenge);

      // Verify using the public key object
      const isVerified = verifier.verify(publicKeyObject, signature, 'base64');

      if (isVerified) {
        // Clean up used challenge
        await validChallenge.destroy();
        res.status(200).json({ message: 'Signature verified successfully', verified: true });
      } else {
        console.log('Verification failed: signature invalid');
        res.status(401).json({ message: 'Invalid signature', verified: false });
      }
    } catch (verifyError: any) {
      console.error('Signature verification error:', verifyError);
      console.error('Key used:', biometricKey.publicKey);
      res.status(401).json({ message: 'Invalid signature format', verified: false });
    }
  } catch (error: any) {
    console.error('verifySignature error:', error);
    res.status(500).json({ message: 'Failed to verify signature', error: error.message });
  }
};
