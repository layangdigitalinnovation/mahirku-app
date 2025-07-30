import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import TokenPurchase from '../models/TokenPurchase';
import Invoice from '../models/Invoice';
import Package from '../models/Package';
import { validateVoucher } from '../utils/voucherUtils';
import { AuthRequest } from '../middlewares/authMiddleware';

interface PaymentCallbackBody {
  invoiceId: number;
  status: 'PAID' | 'PENDING' | 'FAILED';
}

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

    // Ambil package yang dipilih
    const selectedPackage = await Package.findByPk(packageId);
    if (!selectedPackage) {
      res.status(404).json({ message: 'Paket tidak ditemukan.' });
      return;
    }

    // Ambil data user
    const user = await User.findByPk(userId, {
      include: ['package'],
    });
    if (!user) {
      res.status(404).json({ message: 'User tidak ditemukan.' });
      return;
    }

    // Harga awal
    const totalToken = selectedPackage.defaultTokenAmount;
    const pricePerToken = Math.round(selectedPackage.price / totalToken);
    let totalAmount = selectedPackage.price;

    let voucher = null;
    let voucherId = null;
    let discountAmount = 0;

    // Jika ada voucher
    if (voucherCode) {
      voucher = await validateVoucher(voucherCode);
      if (!voucher) {
        res.status(400).json({ message: 'Voucher tidak valid atau sudah tidak aktif.' });
        return;
      }

      // Hitung diskon
      if (voucher.type === 'percentage') {
        discountAmount = (voucher.value / 100) * totalAmount;
      } else if (voucher.type === 'fixed') {
        discountAmount = voucher.value;
      }

      // Maksimal diskon tidak melebihi harga paket
      if (discountAmount > totalAmount) {
        discountAmount = totalAmount;
      }

      totalAmount -= discountAmount;
      voucherId = voucher.id;
    }

    // Tambah token ke user & update paket
    user.tokens += totalToken;
    user.packageId = selectedPackage.id;
    await user.save();

    // Simpan histori pembelian
    await TokenPurchase.create({
      userId,
      packageId: selectedPackage.id,
      voucherId,
      totalToken,
      pricePerToken,
      totalAmount,
      paymentStatus: 'paid',
      paymentMethod: 'manual', // ganti sesuai payment gateway jika perlu
      paymentGatewayResponse: null,
    });

    res.status(200).json({
      message: `Pembelian paket ${selectedPackage.name} berhasil.`,
      tokensAdded: totalToken,
      totalTokens: user.tokens,
      voucherUsed: voucher ? {
        code: voucher.code,
        type: voucher.type,
        value: voucher.value,
        discountAmount
      } : null
    });

  } catch (err: any) {
    console.error('PurchaseToken error:', err);
    res.status(500).json({ message: 'Gagal memproses pembelian.', error: err.message });
  }
};


export const handlePaymentCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId, status }: PaymentCallbackBody = req.body;

    if (!invoiceId || !status) {
      res.status(400).json({ message: 'invoiceId dan status wajib diisi.' });
      return;
    }

    if (!['PAID', 'PENDING', 'FAILED'].includes(status)) {
      res.status(400).json({ message: 'Status tidak valid.' });
      return;
    }

    const invoice = await Invoice.findOne({ where: { id: invoiceId } });

    if (!invoice) {
      res.status(404).json({ message: 'Invoice tidak ditemukan.' });
      return;
    }

    if (invoice.status === 'PAID') {
      res.status(200).json({ message: 'Invoice sudah dibayar sebelumnya.' });
      return;
    }

    const user = await User.findByPk(invoice.userId);
    if (!user) {
      res.status(404).json({ message: 'User tidak ditemukan.' });
      return;
    }

    if (status === 'PAID') {
      // Update invoice
      invoice.status = 'PAID';
      invoice.paymentDate = new Date();
      await invoice.save();

      // Tambahkan token ke user
      user.tokens += invoice.tokenAmount;
      await user.save();

      // Update atau buat token purchase (berdasarkan invoiceId dummy)
      const existingPurchase = await TokenPurchase.findOne({
        where: {
          userId: user.id,
          paymentStatus: 'pending',
        },
      });

      if (existingPurchase) {
        existingPurchase.paymentStatus = 'paid';
        existingPurchase.totalToken = invoice.tokenAmount;
        existingPurchase.totalAmount = invoice.tokenAmount * 10000;
        existingPurchase.pricePerToken = 10000;
        await existingPurchase.save();
      } else {
        await TokenPurchase.create({
          userId: user.id,
          totalToken: invoice.tokenAmount,
          pricePerToken: 10000,
          totalAmount: invoice.tokenAmount * 10000,
          paymentStatus: 'paid',
        });
      }

      res.status(200).json({ message: 'Pembayaran berhasil diproses dan token ditambahkan.', tokens: user.tokens });
    } else {
      // Jika status bukan PAID, tidak lakukan update token
      invoice.status = status;
      await invoice.save();
      res.status(200).json({ message: `Status pembayaran diperbarui ke ${status}.` });
    }

  } catch (err: any) {
    console.error('PaymentCallback error:', err);
    res.status(500).json({ message: 'Gagal memproses pembayaran.', error: err.message });
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
