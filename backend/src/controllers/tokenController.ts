import { Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { AuthRequest } from '../middlewares/authMiddleware';

export const purchaseToken = async (req: AuthRequest, res: Response): Promise<void> => {
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const { packageId, voucherCode } = req.body;

    // Validasi input
    if (!packageId || typeof packageId !== 'number') {
      res.status(400).json({ message: 'packageId wajib dikirim dan harus berupa number.' });
      return;
    }

    // Panggil endpoint pembayaran Xendit via axios (loopback HTTP call)
    const axios = require('axios');
    const paymentRes = await axios.post(
      'http://localhost:5000/api/payment/xendit',
      { userId, packageId, voucherCode },
      {
        headers: {
          Authorization: req.headers.authorization || '',
        },
      }
    );

    res.status(200).json({
      message: 'Silakan lanjutkan ke halaman pembayaran.',
      paymentUrl: paymentRes.data.paymentUrl,
      invoiceId: paymentRes.data.invoiceId,
    });

  } catch (err: any) {
    console.error('purchaseToken error:', err.response?.data || err.message);
    res.status(500).json({ message: 'Gagal memproses pembelian token.', error: err.message });
  }
};

export const addChildUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const parentId = req.user?.userId;
  if (!parentId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const parent = await User.findByPk(parentId, {
      include: ['package'],
    });

    if (!parent) {
      res.status(404).json({ message: 'User tidak ditemukan.' });
      return;
    }

    const currentPackageName = parent.package?.name?.toLowerCase();
    if (currentPackageName !== 'family' && currentPackageName !== 'enterprise') {
      res.status(403).json({ message: 'Paket Anda tidak mendukung fitur anak.' });
      return;
    }

    const { username, email, fullname, address, phoneNumber } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) {
      res.status(400).json({ message: 'Email sudah terdaftar.' });
      return;
    }

    const hashedPassword = await bcrypt.hash('12345678', 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      roleId: 3,
      fullname,
      address,
      phoneNumber,
      parentId,
    });

    res.status(201).json({ message: 'User anak berhasil ditambahkan.', user: newUser });
  } catch (err: any) {
    console.error('AddChildUser error:', err);
    res.status(500).json({ message: 'Gagal menambahkan user anak.', error: err.message });
  }
};

export const getChildrenUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  const parentId = req.user?.userId;
  if (!parentId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  try {
    const children = await User.findAll({ where: { parentId } });
    res.status(200).json(children);
  } catch (err: any) {
    console.error('GetChildren error:', err);
    res.status(500).json({ message: 'Gagal mengambil data anak.', error: err.message });
  }
};

export const switchActiveUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const parentId = req.user?.userId;
  if (!parentId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { targetUserId } = req.body;

  // Validasi tambahan agar tidak undefined/null atau bukan number
  if (!targetUserId || typeof targetUserId !== 'number') {
    res.status(400).json({ message: 'targetUserId wajib dikirim dan harus berupa number.' });
    return;
  }

  try {
    const targetUser = await User.findOne({ where: { id: targetUserId, parentId } });

    if (!targetUser) {
      res.status(404).json({ message: 'User tidak ditemukan atau bukan anak Anda.' });
      return;
    }

    res.status(200).json({ message: 'Berhasil switch user.', user: targetUser });
  } catch (err: any) {
    console.error('SwitchUser error:', err);
    res.status(500).json({ message: 'Gagal switch user.', error: err.message });
  }
};

export const transferTokenToChild = async (req: AuthRequest, res: Response): Promise<void> => {
  const parentId = req.user?.userId;
  if (!parentId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const { childId, tokenAmount } = req.body;

  // Validasi input
  if (!childId || typeof childId !== 'number' || !tokenAmount || typeof tokenAmount !== 'number' || tokenAmount <= 0) {
    res.status(400).json({ message: 'childId dan tokenAmount wajib diisi dengan benar.' });
    return;
  }

  try {
    // Cari parent & child
    const parent = await User.findByPk(parentId);
    const child = await User.findOne({ where: { id: childId, parentId } });

    if (!parent) {
      res.status(404).json({ message: 'Parent user tidak ditemukan.' });
      return;
    }

    if (!child) {
      res.status(404).json({ message: 'User anak tidak ditemukan atau bukan milik Anda.' });
      return;
    }

    if (parent.tokens < tokenAmount) {
      res.status(400).json({ message: 'Token Anda tidak mencukupi untuk transfer.' });
      return;
    }

    // Lakukan transfer token
    parent.tokens -= tokenAmount;
    child.tokens += tokenAmount;

    await parent.save();
    await child.save();

    res.status(200).json({
      message: 'Transfer token berhasil.',
      transfer: {
        from: parent.username,
        to: child.username,
        amount: tokenAmount,
      },
      remainingTokens: parent.tokens,
    });

  } catch (err: any) {
    console.error('TransferToken error:', err);
    res.status(500).json({ message: 'Gagal mentransfer token.', error: err.message });
  }
};
