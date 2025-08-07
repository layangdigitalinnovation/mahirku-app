import { Request, Response } from 'express';
import axios from 'axios';
import { xenditConfig } from '../config/xenditConfig';
import Invoice from '../models/Invoice';
import User from '../models/User';
import Package from '../models/Package';
import { validateVoucher, calculateDiscount } from '../utils/voucherUtils';

export const xenditPayment = async (req: Request, res: Response): Promise<void> => {
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

    // Xendit API memerlukan autentikasi dengan API key dalam format Base64
    const authHeader = Buffer.from(`${xenditConfig.apiKey}:`).toString('base64');

    // Payload untuk Xendit Invoice API
    const payload = {
      external_id: `INV-${invoice.id}`,
      amount: paymentAmount,
      description: `Paket ${selectedPackage.name}`,
      invoice_duration: 86400, // 24 jam dalam detik
      customer: {
        given_names: user.fullname || 'Customer',
        email: user.email,
        mobile_number: user.phoneNumber
      },
      success_redirect_url: xenditConfig.successRedirectUrl,
      failure_redirect_url: xenditConfig.failureRedirectUrl,
      callback_url: xenditConfig.callbackUrl
    };

    const response = await axios.post(
      `${xenditConfig.baseUrl}/v2/invoices`,
      payload,
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json'
        },
      }
    );

    if (response.data && response.data.invoice_url) {
      // Simpan xenditInvoiceId ke database
      invoice.set({ xenditInvoiceId: response.data.id });
      await invoice.save();

      res.status(200).json({
        message: 'Redirect ke halaman pembayaran Xendit',
        paymentUrl: response.data.invoice_url,
        invoiceId: invoice.id,
        xenditInvoiceId: response.data.id
      });
    } else {
      res.status(500).json({ message: 'Gagal mendapatkan URL pembayaran dari Xendit' });
    }
  } catch (err: any) {
    console.error('xenditPayment error:', err.response?.data || err.message);
    res.status(500).json({
      message: 'Gagal memulai pembayaran.',
      error: err.response?.data || err.message,
    });
  }
};

export const handlePaymentCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      external_id,
      status,
      paid_at
    } = req.body;

    // Ekstrak ID invoice dari external_id (format: INV-{id})
    const invoiceId = external_id.replace('INV-', '');

    // Ambil invoice
    const invoice = await Invoice.findByPk(invoiceId);
    if (!invoice) {
      res.status(404).json({ message: 'Invoice tidak ditemukan' });
      return;
    }

    // Jika status bukan pending, abaikan
    if (invoice.status !== 'PENDING') {
      res.status(200).json({ message: 'Callback sudah diproses sebelumnya' });
      return;
    }

    // Verifikasi callback dengan Xendit API (opsional, untuk keamanan tambahan)
    // Ini bisa diimplementasikan dengan memanggil Xendit API untuk memverifikasi status invoice

    // Jika gagal bayar
    if (status !== 'PAID') {
      invoice.status = 'FAILED';
      await invoice.save();
      res.status(200).json({ message: 'Pembayaran gagal' });
      return;
    }

    // Jika sukses
    invoice.status = 'PAID';
    invoice.paymentDate = paid_at ? new Date(paid_at) : new Date();
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