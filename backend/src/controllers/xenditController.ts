import { Request, Response } from 'express';
import axios from 'axios';
import { xenditConfig } from '../config/xenditConfig';
import Invoice from '../models/Invoice';
import User from '../models/User';
import Package from '../models/Package';
import TokenPurchase from '../models/TokenPurchase';
import { validateVoucher, calculateDiscount } from '../utils/voucherUtils';
import WithdrawRequest from '../models/WithdrawRequest';
import { calculateTokenCommission, addTokenPurchaseCommission, updateAffiliateBalance } from '../utils/affiliateUtils';

import { PayoutRequest, PayoutResponse } from '../types/xendit';
import AffiliateBalance from '../models/AffiliateBalance';
import { sequelize } from '../models';

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
    console.log('DEBUG XENDIT PAYMENT:', {
      packageId,
      packageName: selectedPackage.name,
      originalPrice: selectedPackage.price,
      discountAmount,
      finalAmount: totalAmount,
      paymentAmount: paymentAmount
    });

    // JIKA PEMBAYARAN GRATIS (<= 0)
    if (paymentAmount <= 0) {
      // 1. Update invoice jadi PAID
      invoice.status = 'PAID';
      invoice.paymentDate = new Date();
      await invoice.save();

      // 2. Buat TokenPurchase record
      await TokenPurchase.create({
        userId: invoice.userId,
        voucherId: invoice.voucherId,
        packageId: invoice.packageId,
        totalToken: invoice.tokenAmount,
        pricePerToken: 0,
        totalAmount: 0,
        discountAmount: discountAmount,
        paymentStatus: 'paid',
        paymentMethod: 'FREE_VOUCHER',
      });

      // 3. Tambah token ke user
      await User.increment(
        { tokens: invoice.tokenAmount },
        { where: { id: invoice.userId } }
      );

      await User.update(
        { packageId: invoice.packageId },
        { where: { id: invoice.userId } }
      );

      // 4. Return success response (tanpa paymentUrl)
      res.status(200).json({
        message: 'Pembayaran berhasil (Gratis). Token telah ditambahkan.',
        paymentUrl: null, // Frontend harus handle jika null -> langsung sukses
        invoiceId: invoice.id,
        isFree: true
      });
      return;
    }

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
      paid_at,
      payment_method
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

    // Buat record TokenPurchase untuk tracking dan analytics
    let tokenPurchase;
    try {
      // Ambil data package untuk menghitung harga
      const packageData = invoice.packageId ? await Package.findByPk(invoice.packageId) : null;

      // Hitung pricePerToken dan totalAmount
      const pricePerToken = packageData ? Math.floor(packageData.price / packageData.defaultTokenAmount) : 0;
      let originalPrice = packageData ? packageData.price : 0;
      let discountAmount = 0;
      let finalAmount = originalPrice;

      // Hitung discount jika ada voucher
      if (invoice.voucherId && invoice.voucherCode) {
        try {
          const voucherValidation = await validateVoucher(invoice.voucherCode);
          if (voucherValidation) {
            discountAmount = await calculateDiscount(voucherValidation.dataValues.value, originalPrice);
            finalAmount = originalPrice - discountAmount;
          }
        } catch (voucherError) {
          console.log('Error calculating voucher discount:', voucherError);
          // Continue without discount if voucher calculation fails
        }
      }

      tokenPurchase = await TokenPurchase.create({
        userId: invoice.userId,
        voucherId: invoice.voucherId,
        packageId: invoice.packageId,
        totalToken: invoice.tokenAmount,
        pricePerToken: pricePerToken,
        totalAmount: finalAmount,
        discountAmount: discountAmount,
        paymentStatus: 'paid',
        paymentMethod: payment_method,
        // paymentGatewayResponse: req.body
      });

      console.log('TokenPurchase record created:', tokenPurchase.id);
    } catch (tokenPurchaseError) {
      console.error('Error creating TokenPurchase record:', tokenPurchaseError);
      // Continue with the process even if TokenPurchase creation fails
    }

    // Tambahkan token ke user
    await User.increment(
      { tokens: invoice.tokenAmount },
      { where: { id: invoice.userId } }
    );

    await User.update(
      { packageId: invoice.packageId },
      { where: { id: invoice.userId } }
    )

    // Tambahkan komisi referral jika ada
    try {
      // Ambil kode referral dari invoice yang sudah disimpan saat pembuatan
      const referralCode = invoice.referralCode;
      console.log('Referral code from invoice:', referralCode);

      if (referralCode && invoice.packageId) {
        // Ekstrak user ID dari referral code (format: aff{userId})
        const referrerUserId = referralCode.replace('aff', '');

        if (referrerUserId && !isNaN(Number(referrerUserId))) {
          // Cari user berdasarkan ID yang diekstrak dari referral code
          const referrer = await User.findOne({
            where: {
              id: Number(referrerUserId),
              roleId: 2 // pastikan referrer adalah affiliator
            }
          });

          if (referrer) {
            // Hitung komisi berdasarkan total tokens yang dibeli
            const commissionAmount = await calculateTokenCommission(invoice.packageId, invoice.tokenAmount);

            if (commissionAmount > 0) {
              // Buat record komisi menggunakan tokenPurchase.id yang benar
              const tokenPurchaseId = tokenPurchase ? tokenPurchase.id : invoice.id; // fallback ke invoice.id jika tokenPurchase gagal dibuat
              await addTokenPurchaseCommission(
                tokenPurchaseId, // tokenPurchaseId
                referrer.id, // referrerId
                invoice.userId, // userId
                commissionAmount, // commissionAmount yang sudah dihitung
                invoice.packageId // packageId
              );

              console.log(`Komisi referral ditambahkan untuk referrer: ${referrer.fullname} (${referralCode}), amount: ${commissionAmount}, tokens: ${invoice.tokenAmount}, packageId: ${invoice.packageId}, tokenPurchaseId: ${tokenPurchaseId}`);
            }
          } else {
            console.log(`Referrer tidak ditemukan atau bukan affiliator untuk ID: ${referrerUserId}`);
          }
        } else {
          console.log(`Format referral code tidak valid: ${referralCode}`);
        }
      } else {
        console.log('Tidak ada kode referral dalam cookie atau packageId tidak ada');
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
export const processAutomaticPayout = async (withdrawRequestId: string): Promise<PayoutResponse> => {
  try {

    console.log('Process automatic payout for withdraw request:', withdrawRequestId);
    // Ambil data withdraw request dengan data affiliate
    const withdrawRequest = await WithdrawRequest.findByPk(withdrawRequestId, {
      include: [{
        model: User,
        as: 'affiliate',
        attributes: ['id', 'fullname', 'email', 'phoneNumber', 'bankName', 'bankAccountNumber', 'bankAccountName']
      }]
    });
    if (!withdrawRequest) {
      return { success: false, message: 'Withdraw request tidak ditemukan', amount: 0 };
    }

    if (withdrawRequest.status !== 'approved') {
      return {
        success: false,
        message: 'Withdraw request belum disetujui',
        amount: 0,
        id: '',
        external_id: '',
        status: 'FAILED',
        created: new Date().toISOString(),
        metadata: {}
      };
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
    const payload: PayoutRequest = {
      reference_id: `WITHDRAW-${withdrawRequestId}-${Date.now()}`,
      channel_code: getBankCode(affiliate.bankName),
      channel_properties: {
        account_number: affiliate.bankAccountNumber,
        account_holder_name: affiliate.bankAccountName
      },
      amount: withdrawRequest.amount,
      description: `Penarikan komisi affiliate - ${affiliate.fullname}`,
      currency: 'IDR'
    };

    console.log('Xendit Payout Payload:', JSON.stringify(payload, null, 2));

    // Check if we should use mock service (development mode or API key limitations)
    // const isDevelopment = process.env.NODE_ENV === 'development' || xenditConfig.apiKey.startsWith('xnd_development_');

    let response: any;

    console.log('🚀 Using Xendit Payout API (Test Mode)');
    response = await axios.post(
      `${xenditConfig.baseUrl}/v2/payouts`,
      {
        ...payload,
        receipt_notification: {
          email_to: [affiliate.email]
        },
        metadata: {
          withdraw_request_id: withdrawRequestId,
          affiliate_id: affiliate.id
        }
      },
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
        message: `Payout berhasil dibuat, menunggu konfirmasi dari xendit`,
        id: response.data.id,
        external_id: response.data.external_id,
        amount: response.data.amount,
        status: response.data.status,
        reference_id: response.data.reference_id,
        metadata: response.data.metadata,
      };
    } else {
      return { success: false, message: 'Gagal mendapatkan response dari Xendit' };
    }
  } catch (error: any) {
    console.error('processAutomaticPayout error:', error.response?.data || error.message);
    console.error('Error stack:', error.stack);
    return {
      success: false,
      message: `Gagal memproses payout: ${error.response?.data?.message || error.message}`
    };
  }
};

// Webhook handler untuk status payout dari Xendit
export const handlePayoutCallback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Security check
    if (req.headers["x-callback-token"] !== process.env.XENDIT_CALLBACK_TOKEN) {
      res.status(403).json({ message: "Invalid callback token" });
      return;
    }

    const { data } = req.body;

    // Ambil data dari payload
    const payoutId = data.id;
    const status = data.status; // SUCCEEDED, FAILED, PENDING
    const reference_id = data.reference_id;
    const metadata = data.metadata;
    const updated = data.updated;
    const failure_code = data.failure_code;
    const failure_reason = data.failure_reason;

    console.log("Payout Callback received:", req.body);

    let withdrawRequest: WithdrawRequest | null = null;

    // 1. Cari berdasarkan metadata
    if (metadata?.withdraw_request_id) {
      withdrawRequest = await WithdrawRequest.findOne({
        where: { id: metadata.withdraw_request_id },
      });
      if (withdrawRequest && !withdrawRequest.payoutId) {
        await withdrawRequest.update({ payoutId });
      }
    }

    // 2. Fallback: reference_id
    if (!withdrawRequest && reference_id) {
      const referenceMatch = reference_id.match(/WITHDRAW-(\d+)-/);
      if (referenceMatch) {
        withdrawRequest = await WithdrawRequest.findByPk(
          parseInt(referenceMatch[1], 10)
        );
        if (withdrawRequest && !withdrawRequest.payoutId) {
          await withdrawRequest.update({ payoutId });
        }
      }
    }

    // 3. Fallback: payoutId
    if (!withdrawRequest && payoutId) {
      withdrawRequest = await WithdrawRequest.findOne({ where: { payoutId } });
    }

    if (!withdrawRequest) {
      console.log(`Withdraw request tidak ditemukan untuk payoutId: ${payoutId}`);
      res.status(404).json({ message: "Withdraw request tidak ditemukan" });
      return;
    }

    // Mapping status dari Xendit ke sistem internal
    let newStatus: typeof withdrawRequest.status;
    switch (status) {
      case "PENDING":
      case "ACCEPTED":
      case "REQUESTED":
        newStatus = "processing";
        break;
      case "SUCCEEDED":
      case "COMPLETED":
        newStatus = "completed";
        break;
      case "FAILED":
        newStatus = "failed";
        break;
      default:
        newStatus = "processing";
    }

    // Idempotency: jangan downgrade status
    if (withdrawRequest.status === "completed" && newStatus !== "completed") {
      console.log(
        `Skip update, withdraw ${withdrawRequest.id} sudah completed`
      );
      res.status(200).json({ message: "Already completed" });
      return;
    }

    // Jalankan semua dalam 1 transaksi
    await sequelize.transaction(async (t) => {
      await withdrawRequest.update(
        {
          status: newStatus,
          payoutId,
          payoutStatus: status,
          failureReason: failure_code || failure_reason || null,
          updatedAt: updated ? new Date(updated) : new Date(),
        },
        { transaction: t }
      );

      // Kurangi saldo affiliate hanya kalau berhasil
      if (newStatus === "completed" && metadata?.affiliate_id) {
        const affiliate = await AffiliateBalance.findOne({
          where: { affiliateId: Number(metadata.affiliate_id) },
          transaction: t,
          lock: t.LOCK.UPDATE,
        });

        if (affiliate) {
          const currentBalance = Number(affiliate.availableBalance) || 0;
          const withdrawAmount = Number(withdrawRequest.amount) || 0;
          console.log("Affiliate Balance (before):", currentBalance);
          if (currentBalance >= withdrawAmount) {
            affiliate.withdrawnAmount += Number(withdrawRequest.amount);
            await affiliate.save({ transaction: t });


            console.log("Withdraw Request Amount:", withdrawAmount);
            console.log("Affiliate Balance (after):", affiliate.availableBalance);
          } else {
            console.warn(
              `Saldo tidak cukup. Saldo: ${currentBalance}, Withdraw: ${withdrawAmount}`
            );
          }
        } else {
          console.warn(
            `Affiliate balance record not found for affiliateId=${metadata.affiliate_id}`
          );
        }
      }
    });

    // Query ulang setelah transaksi biar yakin ke-update
    if (metadata?.affiliate_id) {
      const freshAffiliate = await AffiliateBalance.findOne({
        where: { affiliateId: Number(metadata.affiliate_id) },
      });
      console.log(
        "Affiliate Balance (DB after commit):",
        freshAffiliate?.availableBalance
      );
    }

    console.log(`✓ Withdraw ${withdrawRequest.id} updated to: ${newStatus}`);
    res
      .status(200)
      .json({ message: "Payout callback berhasil diproses", status: newStatus });
  } catch (error: any) {
    console.error("handlePayoutCallback error:", error);
    res.status(500).json({
      message: "Gagal memproses payout callback",
      error: error.message,
    });
  }
};


