import { Request, Response } from "express";
import models from "../models";
import User from "../models/User";
import { getReferralFromCookie, clearReferralCookie } from '../middlewares/referralMiddleware';

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
    const { username, email, password, fullname, address, phoneNumber, bankAccountNumber, bankAccountName, bankName } =
      req.body;
    
    // Ambil referral dari cookie alih-alih dari request body
    const referrerId = getReferralFromCookie(req);

    // Validasi email dan password dasar
    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      res.status(409).json({ message: "Email already registered." });
      return;
    }

    // Cek apakah username sudah terdaftar
    if (!username) {
      res.status(400).json({ message: "Username is required." });
      return;
    }
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      res.status(409).json({ message: "Username already registered." });
      return;
    }

    // Proses referrerId menjadi parentId
    let parentId = null;
    if (referrerId) {
      // Ekstrak user ID dari referral code (format: aff{userId})
      const referrerUserId = referrerId.replace('aff', '');
      if (referrerUserId && !isNaN(Number(referrerUserId))) {
        // Verifikasi bahwa referrer exists dan merupakan affiliator
        const referrer = await User.findOne({ 
          where: { 
            id: Number(referrerUserId),
            roleId: 2 // pastikan referrer adalah affiliator
          } 
        });
        if (referrer) {
          parentId = Number(referrerUserId);
          console.log(`User baru akan direferensikan ke affiliator ID: ${parentId}`);
        } else {
          console.log(`Referrer ID ${referrerUserId} tidak valid atau bukan affiliator`);
        }
      }
    }

    if (roleId === 2 && (!bankAccountNumber || !bankAccountName || !bankName)) {
      res.status(400).json({ message: "Bank account details are required for affiliators." });
      return;
    }

    // Sanitasi nomor HP
    const phoneSanitized = typeof phoneNumber === 'string' ? phoneNumber.replace(/\s+/g, '') : phoneNumber;
    if (!phoneSanitized || !/^\+?[0-9]+$/.test(phoneSanitized)) {
      res.status(400).json({ message: "Invalid phone number format." });
      return;
    }

    // Buat user baru
    const user = await models.User.create({
      username,
      email,
      password,
      fullname,
      address,
      phoneNumber: phoneSanitized,
      roleId,
      bankAccountNumber,
      bankAccountName,
      bankName,
      parentId,
    });

    // Clear referral cookie setelah registrasi berhasil
    // if (referrerId) {
    //   clearReferralCookie(res);
    // }

    res.status(201).json({ message: "User registered successfully", user });
  } catch (err: any) {
    console.error("Register error:", err);
    console.error("Error stack:", err instanceof Error ? err.stack : 'Unknown error');
    if (err?.name === 'SequelizeUniqueConstraintError') {
      res.status(409).json({ message: "Duplicate field value.", error: err?.message });
      return;
    }
    if (err?.name === 'SequelizeValidationError') {
      res.status(400).json({ message: "Validation failed.", error: err?.message });
      return;
    }
    res.status(500).json({ message: "Internal server error", error: err instanceof Error ? err.message : 'Unknown error' });
  }
};

// Endpoint khusus untuk user biasa (publik)
export const registerUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  const roleId = req.body.roleId || 3; // default ke 3 jika tidak dikirim
  await registerUserWithRole(req, res, roleId);
};

// Endpoint khusus untuk affiliator (landing page berbeda)
export const registerAffiliator = async (
  req: Request,
  res: Response
): Promise<void> => {
  await registerUserWithRole(req, res, 2); // roleId 2 = affiliator
};

// Login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email and password are required." });
      return;
    }

    const user = await models.User.findByEmail(email);
    console.log('LOGIN attempt for email:', email, 'found:', !!user);
    if (!user || !(await user.comparePassword(password))) {
      if (user) {
        const match = await user.comparePassword(password);
        console.log('PASSWORD compare result:', match);
      }
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }

    const token = user.generateAuthToken();
    res.status(200).json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get current user info
export const getMe = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const user = await models.User.findByPk(req.user.userId, {
      include: ["role"], // Pastikan relasi 'roles' tersedia di model
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error("GetMe error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};
