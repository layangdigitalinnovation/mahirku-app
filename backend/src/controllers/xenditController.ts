import { Request, Response } from 'express';
import axios from 'axios';
import { xenditConfig } from '../config/xenditConfig';
import Invoice from '../models/Invoice';
import User from '../models/User';
import Package from '../models/Package';
import { validateVoucher, calculateDiscount } from '../utils/voucherUtils';
import WithdrawRequest from '../models/WithdrawRequest';
import { addTokenPurchaseCommission } from '../utils/affiliateUtils';

export const xenditPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, packageId, voucherCode, referralCode } = req.body;

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
      referralCode: referralCode || null,
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
      success_redirect_url: `${xenditConfig.successRedirectUrl}?invoiceId=${invoice.id}&status=success`,
      failure_redirect_url: `${xenditConfig.failureRedirectUrl}?invoiceId=${invoice.id}&status=failure`,
      callback_url: `${xenditConfig.callbackUrl}?invoiceId=${invoice.id}`
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


    console.log("CALLBACK HITTED :", req.body)

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

    await User.update(
      {packageId : invoice.packageId},
      {where : {id : invoice.userId}}
    )

    // Tambahkan komisi referral jika ada
    try {
      const user = await User.findByPk(invoice.userId);
      if (user && user.parentId) {
        // Ambil data package untuk mendapatkan total amount
const packageData = await Package.findByPk(invoice.packageId || undefined);
        const totalAmount = packageData ? packageData.price : 0;
        
        if (totalAmount > 0) {
          await addTokenPurchaseCommission(
            invoice.id, // tokenPurchaseId (menggunakan invoice ID)
            user.parentId, // referrerId
            invoice.userId, // userId
            totalAmount // totalAmount dari package price
          );
          
          console.log(`Komisi referral ditambahkan untuk referrer ID: ${user.parentId}, amount: ${totalAmount}`);
        }
      }
    } catch (commissionError: any) {
      // Log error tapi jangan gagalkan proses pembayaran
      console.error('Error menambahkan komisi referral:', commissionError.message);
    }

    console.log("Callback Sukses")

    res.status(200).json({ message: 'Pembayaran berhasil & token ditambahkan ke user' });
  } catch (error: any) {
    console.error('handlePaymentCallback error:', error);
    res.status(500).json({ message: 'Gagal memproses callback pembayaran', error: error.message });
  }
};

// Fungsi untuk melakukan payout otomatis menggunakan Xendit
export const processAutomaticPayout = async (withdrawRequestId: string): Promise<{ success: boolean; message: string; payoutId?: string }> => {
  try {
    // Ambil data withdraw request dengan data affiliate
    const withdrawRequest = await WithdrawRequest.findByPk(withdrawRequestId, {
      include: [{
        model: User,
        as: 'affiliate',
        attributes: ['id', 'fullname', 'email', 'phoneNumber', 'bankName', 'bankAccountNumber', 'bankAccountName']
      }]
    });
    if (!withdrawRequest) {
      return { success: false, message: 'Withdraw request tidak ditemukan' };
    }

    if (withdrawRequest.status !== 'approved') {
      return { success: false, message: 'Withdraw request belum disetujui' };
    }

    const affiliate = withdrawRequest.affiliate;
    if (!affiliate) {
      return { success: false, message: 'Data affiliate tidak ditemukan' };
    }

    // Validasi data bank affiliate
    if (!affiliate.bankName || !affiliate.bankAccountNumber || !affiliate.bankAccountName) {
      return { success: false, message: 'Data bank affiliate tidak lengkap. Harap lengkapi data bank terlebih dahulu.' };
    }

    // Xendit API memerlukan autentikasi dengan API key dalam format Base64
    const authHeader = Buffer.from(`${xenditConfig.apiKey}:`).toString('base64');

    // Mapping bank code untuk Xendit (sesuaikan dengan bank yang didukung)
    const getBankCode = (bankName: string): string => {
      const bankMapping: { [key: string]: string } = {
        'BCA': 'ID_BCA',
        'BNI': 'ID_BNI',
        'BRI': 'ID_BRI',
        'MANDIRI': 'ID_MANDIRI',
        'CIMB': 'ID_CIMB',
        'PERMATA': 'ID_PERMATA',
        'BTN': 'ID_BTN',
        'DANAMON': 'ID_DANAMON',
        'MAYBANK': 'ID_MAYBANK'
      };
      return bankMapping[bankName.toUpperCase()] || 'ID_BCA'; // Default ke BCA jika tidak ditemukan
    };

    // Payload untuk Xendit Payout API
    const payload = {
      reference_id: `WITHDRAW-${withdrawRequestId}-${Date.now()}`,
      channel_code: getBankCode(affiliate.bankName),
      channel_properties: {
        account_number: affiliate.bankAccountNumber,
        account_holder_name: affiliate.bankAccountName
      },
      amount: withdrawRequest.amount,
      description: `Penarikan komisi affiliate - ${affiliate.fullname}`,
      currency: 'IDR',
      receipt_notification: {
        email_to: [affiliate.email]
      },
      metadata: {
        withdraw_request_id: withdrawRequestId,
        affiliate_id: affiliate.id
      }
    };

    console.log('Xendit Payout Payload:', JSON.stringify(payload, null, 2));

    // Kirim request ke Xendit Payout API
    const response = await axios.post(
      `${xenditConfig.baseUrl}/v2/payouts`,
      payload,
      {
        headers: {
          'Authorization': `Basic ${authHeader}`,
          'Content-Type': 'application/json',
          'Idempotency-key': `withdraw-${withdrawRequestId}-${Date.now()}`
        },
      }
    );

    console.log('Xendit Payout Response:', response.data);

    if (response.data && response.data.id) {
      // Update withdraw request dengan payout ID dan status
      await withdrawRequest.update({
        status: 'processing',
        processedAt: new Date(),
        payoutId: response.data.id,
        payoutStatus: response.data.status
      });

      return {
        success: true,
        message: `Payout berhasil diproses. ID: ${response.data.id}`,
        payoutId: response.data.id
      };
    } else {
      return { success: false, message: 'Gagal mendapatkan response dari Xendit' };
    }
  } catch (error: any) {
    console.error('processAutomaticPayout error:', error.response?.data || error.message);
    return {
      success: false,
      message: `Gagal memproses payout: ${error.response?.data?.message || error.message}`
    };
  }
};

// Webhook handler untuk status payout dari Xendit
export const handlePayoutCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      id: payoutId,
      status,
      reference_id,
      failure_code,
      updated
    } = req.body;

    console.log('Payout Callback received:', req.body);

    // Cari withdraw request berdasarkan payout ID
    const withdrawRequest = await WithdrawRequest.findOne({
      where: { payoutId }
    });

    if (!withdrawRequest) {
      console.log(`Withdraw request tidak ditemukan untuk payout ID: ${payoutId}`);
      res.status(404).json({ message: 'Withdraw request tidak ditemukan' });
      return;
    }

    // Update status berdasarkan callback dari Xendit
    let newStatus = withdrawRequest.status;
    
    switch (status) {
      case 'ACCEPTED':
        newStatus = 'processing';
        break;
      case 'REQUESTED':
        newStatus = 'processing';
        break;
      case 'COMPLETED':
        newStatus = 'completed';
        break;
      case 'FAILED':
        newStatus = 'failed';
        break;
      default:
        newStatus = 'processing';
    }

    await withdrawRequest.update({
      status: newStatus,
      payoutStatus: status,
      failureReason: failure_code || null,
      updatedAt: updated ? new Date(updated) : new Date()
    });

    console.log(`Withdraw request ${withdrawRequest.id} status updated to: ${newStatus}`);
    res.status(200).json({ message: 'Payout callback berhasil diproses' });
  } catch (error: any) {
    console.error('handlePayoutCallback error:', error);
    res.status(500).json({ message: 'Gagal memproses payout callback', error: error.message });
  }
};