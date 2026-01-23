import { Request, Response } from "express";
import models from "../models";
import User from "../models/User";
import { getReferralFromCookie, clearReferralCookie } from '../middlewares/referralMiddleware';
import { OAuth2Client } from 'google-auth-library';

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
    const { username, email, password, fullname, address, phoneNumber, bankAccountNumber, bankAccountName, bankName, mitraId } =
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

    // Proses referrerId atau mitraId menjadi parentId
    let parentId = null;

    // Prioritas 1: Input ID Mitra manual (untuk member join mitra)
    if (mitraId) {
      if (isNaN(Number(mitraId))) {
        res.status(400).json({ message: "ID Mitra harus berupa angka." });
        return;
      }
      const mitra = await User.findByPk(mitraId);
      if (!mitra) {
        res.status(400).json({ message: "ID Mitra tidak ditemukan." });
        return;
      }
      if (mitra.roleId !== 4) { // 4 = Mitra
        res.status(400).json({ message: "ID tersebut bukan merupakan ID Mitra yang valid." });
        return;
      }
      parentId = parseInt(mitraId);
    }
    // Prioritas 2: Cookie referral (untuk link affiliator atau mitra)
    else if (referrerId) {
      // Ekstrak user ID dari referral code (format: aff{userId})
      const referrerUserId = referrerId.replace('aff', '');
      if (referrerUserId && !isNaN(Number(referrerUserId))) {
        // Verifikasi bahwa referrer exists dan merupakan affiliator atau mitra
        const referrer = await User.findOne({
          where: {
            id: Number(referrerUserId),
            roleId: [2, 4] // Affiliator atau Mitra
          }
        });
        if (referrer) {
          // PERBEDAAN PENTING:
          // - Mitra (roleId=4): Set parentId → user jadi MEMBER
          // - Affiliator (roleId=2): TIDAK set parentId → hanya tracking untuk komisi

          if (referrer.roleId === 4) {
            // MITRA: Set parentId untuk member relationship
            parentId = Number(referrerUserId);
            console.log(`✅ User baru akan menjadi MEMBER Mitra ID: ${parentId}`);
          } else if (referrer.roleId === 2) {
            // AFFILIATOR: Jangan set parentId, hanya log untuk tracking
            console.log(`✅ User direferensikan oleh Affiliator ID: ${referrerUserId} (tracking only, bukan member)`);
            // parentId tetap null (atau dari mitraId manual input jika ada)
          }
        } else {
          console.log(`❌ Referrer ID ${referrerUserId} tidak valid (harus Affiliator atau Mitra)`);
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
      include: [
        "role",
        {
          model: models.User,
          as: 'parent',
          attributes: ['id', 'fullname', 'email', 'roleId'],
          include: ['role']
        }
      ],
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

// Google OAuth login
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { idToken } = req.body as { idToken?: string };
    if (!idToken) {
      res.status(400).json({ message: 'idToken wajib dikirim.' });
      return;
    }

    const webClientId = process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_WEB_CLIENT_ID;
    const androidClientId = process.env.GOOGLE_ANDROID_CLIENT_ID;
    const iosClientId = process.env.GOOGLE_IOS_CLIENT_ID;

    // Kumpulkan semua Client ID yang valid
    const audience = [webClientId, androidClientId, iosClientId].filter((id) => id && id.trim() !== '') as string[];

    if (audience.length === 0) {
      // Fallback default jika tidak ada env set (sebaiknya jangan di production)
      audience.push('1061850144136-r1k407gtpglk67otkdvdqbo55eknhdj2.apps.googleusercontent.com');
    }

    if (audience.length === 0) {
      res.status(500).json({ message: 'Konfigurasi Google OAuth tidak tersedia di server.' });
      return;
    }

    const client = new OAuth2Client(audience[0]); // Gunakan salah satu client ID untuk inisialisasi, verifyIdToken akan cek against 'audience' array
    const ticket = await client.verifyIdToken({
      idToken,
      audience // google-auth-library supports array of audiences
    });
    const payload = ticket.getPayload();
    if (!payload) {
      res.status(401).json({ message: 'Token Google tidak valid.' });
      return;
    }

    const email = payload.email as string | undefined;
    const name = payload.name as string | undefined;
    const sub = payload.sub as string | undefined; // Google user ID
    if (!email) {
      res.status(400).json({ message: 'Email tidak tersedia dari Google.' });
      return;
    }

    // Cari berdasarkan googleId atau googleEmail terlebih dahulu
    let user = await User.findOne({ where: { googleId: sub } });
    if (!user && email) {
      user = await User.findOne({ where: { googleEmail: email } });
    }
    // Jika masih belum ada, coba tautkan ke akun email biasa
    if (!user && email) {
      const existingByEmail = await models.User.findByEmail(email);
      if (existingByEmail) {
        existingByEmail.googleId = sub || null;
        existingByEmail.googleEmail = email;
        await existingByEmail.save();
        user = existingByEmail as any;
      }
    }
    // Jika tetap tidak ada, buat akun baru dengan field Google
    if (!user) {
      const baseUsername = (email || name || 'user').split('@')[0];
      let username = baseUsername;
      let counter = 1;
      while (await models.User.findOne({ where: { username } })) {
        username = `${baseUsername}${counter}`;
        counter += 1;
      }
      user = await models.User.create({
        username,
        email,
        password: null,
        fullname: name || baseUsername,
        address: '-',
        phoneNumber: '0',
        roleId: 3,
        tokens: 0,
        googleId: sub || null,
        googleEmail: email || null,
      });
    }

    const token = user.generateAuthToken();
    res.status(200).json({ message: 'Login Google berhasil', token, user });
  } catch (err: any) {
    console.error('googleLogin error:', err);
    res.status(500).json({ message: 'Gagal memproses login Google', error: err?.message });
  }
};
