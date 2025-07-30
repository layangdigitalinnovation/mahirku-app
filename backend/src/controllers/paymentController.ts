import { Request, Response } from 'express';
import axios from 'axios';
import { duitkuConfig } from '../config/duitkuConfig';
import crypto from 'crypto';
import Invoice from '../models/Invoice';
import User from '../models/User';
import Package from '../models/Package';
import { validateVoucher, calculateDiscount } from '../utils/voucherUtils';

export const startDuitkuPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, packageId, voucherCode } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User tidak ditemukan' });
      return;
    }

    const selectedPackage = await Package.findByPk(packageId);
    if (!selectedPackage) {
      res.status(404).json({ message: 'Paket tidak ditemukan' });
      return;
    }

    let totalAmount = selectedPackage.price;
    let tokenAmount = selectedPackage.defaultTokenAmount;
    let voucher = null;
    let voucherId = null;
    let discountAmount = 0;

    if (voucherCode) {
      voucher = await validateVoucher(voucherCode);
      discountAmount = calculateDiscount(totalAmount, voucher);
      totalAmount -= discountAmount;
      voucherId = voucher.id;
    }

    const invoice = await Invoice.create({
      userId,
      packageId,
      tokenAmount,
      voucherId,
      voucherCode,
      status: 'PENDING',
    });

    const paymentAmount = Math.round(totalAmount);

    const signature = crypto
      .createHash('sha256')
      .update(`${duitkuConfig.merchantCode}${invoice.id}${paymentAmount}${duitkuConfig.apiKey}`)
      .digest('hex');

    const payload = {
      paymentAmount,
      merchantOrderId: invoice.id.toString(),
      productDetails: `Paket ${selectedPackage.name}`,
      email: user.email,
      phoneNumber: user.phoneNumber,
      merchantCode: duitkuConfig.merchantCode,
      callbackUrl: duitkuConfig.callbackUrl,
      returnUrl: duitkuConfig.returnUrl,
      signature,
      expiryPeriod: 60,
    };

    const response = await axios.post(
      `${duitkuConfig.baseUrl}/api/merchant/createInvoice`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (response.data && response.data.paymentUrl) {
      res.status(200).json({
        message: 'Redirect ke halaman pembayaran Duitku',
        paymentUrl: response.data.paymentUrl,
        reference: response.data.reference,
        invoiceId: invoice.id,
      });
    } else {
      res.status(500).json({ message: 'Gagal mendapatkan URL pembayaran dari Duitku' });
    }
  } catch (err: any) {
    console.error('startDuitkuPayment error:', err.response?.data || err.message);
    res.status(500).json({
      message: 'Gagal memulai pembayaran.',
      error: err.response?.data || err.message,
    });
  }
};

export const handlePaymentCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      merchantOrderId, // invoiceId
      resultCode, // '00' berarti sukses
      amount,
      signature,
    } = req.body;

    // Validasi signature
    const expectedSignature = crypto
      .createHash('sha256')
      .update(merchantOrderId + amount + duitkuConfig.apiKey)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.warn('Signature tidak valid');
      res.status(400).json({ message: 'Signature tidak valid' });
      return;
    }

    // Ambil invoice
    const invoice = await Invoice.findByPk(merchantOrderId);
    if (!invoice) {
      res.status(404).json({ message: 'Invoice tidak ditemukan' });
      return;
    }

    // Jika status bukan pending, abaikan
    if (invoice.status !== 'PENDING') {
      res.status(200).json({ message: 'Callback sudah diproses sebelumnya' });
      return;
    }

    // Jika gagal bayar
    if (resultCode !== '00') {
      invoice.status = 'FAILED';
      await invoice.save();
      res.status(200).json({ message: 'Pembayaran gagal' });
      return;
    }

    // Jika sukses
    invoice.status = 'PAID';
    invoice.paymentDate = new Date();
    await invoice.save();

    // Tambahkan token ke user
    await User.increment(
      { tokens: invoice.tokenAmount },
      { where: { id: invoice.userId } }
    );

    res.status(200).json({ message: 'Pembayaran berhasil & token ditambahkan ke user' });
  } catch (error: any) {
    console.error('handlePaymentCallback error:', error);
    res.status(500).json({ message: 'Gagal memproses callback pembayaran', error: error.message });
  }
};

