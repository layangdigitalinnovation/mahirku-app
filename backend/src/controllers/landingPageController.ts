import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import axios from 'axios';
import LandingPage from '../models/LandingPage';
import LandingPageSubmission from '../models/LandingPageSubmission';
import User from '../models/User';
import Package from '../models/Package';
import Invoice from '../models/Invoice';
import Voucher from '../models/Voucher';
import TokenPurchase from '../models/TokenPurchase';
import { xenditConfig } from '../config/xenditConfig';
import { validateVoucher, calculateDiscount } from '../utils/voucherUtils';
import {
  getWetonKayaTemplate,
  getDiscTemplate,
  getBlankTemplate,
} from '../utils/landingPageTemplates';

// Helper to generate unique slug
const generateUniqueSlug = async (baseSlug: string, currentId?: number): Promise<string> => {
  let cleanSlug = baseSlug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (!cleanSlug) cleanSlug = 'lp-mahirku';

  let uniqueSlug = cleanSlug;
  let counter = 1;

  while (true) {
    const existing = await LandingPage.findOne({
      where: { slug: uniqueSlug },
    });

    if (!existing || (currentId && existing.id === currentId)) {
      return uniqueSlug;
    }

    uniqueSlug = `${cleanSlug}-${counter}`;
    counter++;
  }
};

/**
 * GET /api/landing-pages
 * Ambil daftar semua landing page (Admin)
 */
export const getAllLandingPages = async (req: Request, res: Response): Promise<void> => {
  try {
    const pages = await LandingPage.findAll({
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: LandingPageSubmission,
          as: 'submissions',
          attributes: ['id', 'status', 'amount', 'createdAt'],
        },
      ],
    });

    // Hitung ringkasan stats
    const formatted = pages.map((page: any) => {
      const submissions = page.submissions || [];
      const totalLeads = submissions.length;
      const totalPaid = submissions.filter((s: any) => s.status === 'paid').length;
      const totalRevenue = submissions
        .filter((s: any) => s.status === 'paid')
        .reduce((sum: number, s: any) => sum + (s.amount || 0), 0);

      const convRate =
        page.viewsCount > 0 ? ((totalPaid / page.viewsCount) * 100).toFixed(1) : '0';

      return {
        id: page.id,
        slug: page.slug,
        title: page.title,
        description: page.description,
        category: page.category,
        isPublished: page.isPublished,
        viewsCount: page.viewsCount,
        conversionsCount: page.conversionsCount,
        totalLeads,
        totalPaid,
        totalRevenue,
        conversionRate: `${convRate}%`,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      };
    });

    res.status(200).json({ data: formatted });
  } catch (err: any) {
    console.error('getAllLandingPages error:', err);
    res.status(500).json({ message: 'Gagal mengambil data landing page', error: err.message });
  }
};

/**
 * GET /api/landing-pages/:id
 * Ambil detail landing page untuk builder
 */
export const getLandingPageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = await LandingPage.findByPk(id);

    if (!page) {
      res.status(404).json({ message: 'Landing page tidak ditemukan' });
      return;
    }

    const dbPackages = await Package.findAll({ order: [['price', 'ASC']] });
    const dbVouchers = await Voucher.findAll({
      where: { isActive: true },
      order: [['id', 'DESC']],
      attributes: ['id', 'code', 'type', 'value'],
    });

    res.status(200).json({
      data: page,
      availablePackages: dbPackages,
      availableVouchers: dbVouchers,
    });
  } catch (err: any) {
    console.error('getLandingPageById error:', err);
    res.status(500).json({ message: 'Gagal mengambil detail landing page', error: err.message });
  }
};

/**
 * POST /api/landing-pages
 * Buat landing page baru (dengan opsi template)
 */
export const createLandingPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, slug, templateType = 'wetonkaya', description } = req.body;

    let baseData: any;
    if (templateType === 'wetonkaya') {
      baseData = getWetonKayaTemplate();
    } else if (templateType === 'disc') {
      baseData = getDiscTemplate();
    } else {
      baseData = getBlankTemplate();
    }

    const finalSlug = await generateUniqueSlug(slug || baseData.slug);

    const newPage = await LandingPage.create({
      title: title || baseData.title,
      slug: finalSlug,
      description: description || baseData.description,
      category: baseData.category,
      themeConfig: baseData.themeConfig,
      pixelConfig: baseData.pixelConfig,
      sections: baseData.sections,
      formConfig: baseData.formConfig,
      isPublished: true,
      viewsCount: 0,
      conversionsCount: 0,
      userId: (req as any).user?.userId || null,
    });

    res.status(201).json({
      message: 'Landing page berhasil dibuat',
      data: newPage,
    });
  } catch (err: any) {
    console.error('createLandingPage error:', err);
    res.status(500).json({ message: 'Gagal membuat landing page', error: err.message });
  }
};

/**
 * PUT /api/landing-pages/:id
 * Simpan perubahan dari Web Builder
 */
export const updateLandingPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      description,
      category,
      themeConfig,
      pixelConfig,
      sections,
      formConfig,
      isPublished,
    } = req.body;

    const page = await LandingPage.findByPk(id);
    if (!page) {
      res.status(404).json({ message: 'Landing page tidak ditemukan' });
      return;
    }

    let updatedSlug = page.slug;
    if (slug && slug !== page.slug) {
      updatedSlug = await generateUniqueSlug(slug, page.id);
    }

    await page.update({
      title: title !== undefined ? title : page.title,
      slug: updatedSlug,
      description: description !== undefined ? description : page.description,
      category: category !== undefined ? category : page.category,
      themeConfig: themeConfig !== undefined ? themeConfig : page.themeConfig,
      pixelConfig: pixelConfig !== undefined ? pixelConfig : page.pixelConfig,
      sections: sections !== undefined ? sections : page.sections,
      formConfig: formConfig !== undefined ? formConfig : page.formConfig,
      isPublished: isPublished !== undefined ? isPublished : page.isPublished,
    });

    res.status(200).json({
      message: 'Landing page berhasil diperbarui',
      data: page,
    });
  } catch (err: any) {
    console.error('updateLandingPage error:', err);
    res.status(500).json({ message: 'Gagal memperbarui landing page', error: err.message });
  }
};

/**
 * DELETE /api/landing-pages/:id
 * Hapus landing page
 */
export const deleteLandingPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = await LandingPage.findByPk(id);

    if (!page) {
      res.status(404).json({ message: 'Landing page tidak ditemukan' });
      return;
    }

    await page.destroy();
    res.status(200).json({ message: 'Landing page berhasil dihapus' });
  } catch (err: any) {
    console.error('deleteLandingPage error:', err);
    res.status(500).json({ message: 'Gagal menghapus landing page', error: err.message });
  }
};

/**
 * POST /api/landing-pages/:id/duplicate
 * Duplikasi landing page
 */
export const duplicateLandingPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const page = await LandingPage.findByPk(id);

    if (!page) {
      res.status(404).json({ message: 'Landing page tidak ditemukan' });
      return;
    }

    const newSlug = await generateUniqueSlug(`${page.slug}-salinan`);

    const duplicated = await LandingPage.create({
      title: `${page.title} (Salinan)`,
      slug: newSlug,
      description: page.description,
      category: page.category,
      themeConfig: page.themeConfig,
      pixelConfig: page.pixelConfig,
      sections: page.sections,
      formConfig: page.formConfig,
      isPublished: false,
      viewsCount: 0,
      conversionsCount: 0,
      userId: (req as any).user?.userId || null,
    });

    res.status(201).json({
      message: 'Landing page berhasil diduplikasi',
      data: duplicated,
    });
  } catch (err: any) {
    console.error('duplicateLandingPage error:', err);
    res.status(500).json({ message: 'Gagal menduplikasi landing page', error: err.message });
  }
};

/**
 * GET /api/landing-pages/public/:slug
 * Akses publik untuk pengunjung iklan
 */
export const getPublicLandingPage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    let page = await LandingPage.findOne({
      where: { slug },
    });

    if (!page && (slug === 'lp-karakter' || slug === 'karakter-kaya' || slug === 'wetonkaya')) {
      page = await LandingPage.findOne({
        where: {
          slug: ['karakter-kaya', 'lp-karakter', 'wetonkaya'],
        },
      });
    }

    if (!page) {
      // Jika belum ada halaman dengan slug ini, otomatis inisialisasi default wetonkaya jika slug 'lp-karakter'
      if (slug === 'lp-karakter' || slug === 'karakter-kaya' || slug === 'wetonkaya') {
        const template = getWetonKayaTemplate();
        page = await LandingPage.create({
          title: template.title,
          slug: slug,
          description: template.description,
          category: template.category,
          themeConfig: template.themeConfig,
          pixelConfig: template.pixelConfig,
          sections: template.sections,
          formConfig: template.formConfig,
          isPublished: true,
          viewsCount: 1,
          conversionsCount: 0,
        });
      } else {
        res.status(404).json({ message: 'Halaman penawaran tidak ditemukan atau belum dipublikasikan.' });
        return;
      }
    }

    if (!page.isPublished) {
      res.status(403).json({ message: 'Halaman ini sedang tidak aktif.' });
      return;
    }

    // Naikkan viewsCount secara asynchronous
    page.increment('viewsCount');

    // Ambil paket yang tersedia di database
    const dbPackages = await Package.findAll({ order: [['price', 'ASC']] });

    // Ambil voucher aktif yang tersedia di database
    const dbVouchers = await Voucher.findAll({
      where: { isActive: true },
      order: [['id', 'DESC']],
      attributes: ['id', 'code', 'type', 'value'],
    });

    // Ambil data pesanan terbaru untuk Live Social Proof Loop
    const dbSubmissions = await LandingPageSubmission.findAll({
      order: [['createdAt', 'DESC']],
      limit: 15,
      attributes: ['fullName', 'amount', 'createdAt', 'paymentMethod'],
      include: [
        {
          model: Package,
          as: 'package',
          attributes: ['name', 'defaultTokenAmount'],
        },
      ],
    });

    res.status(200).json({
      data: page,
      availablePackages: dbPackages,
      availableVouchers: dbVouchers,
      recentOrders: dbSubmissions,
    });
  } catch (err: any) {
    console.error('getPublicLandingPage error:', err);
    res.status(500).json({ message: 'Gagal memuat landing page', error: err.message });
  }
};

/**
 * POST /api/landing-pages/public/:slug/checkout
 * Formulir Pemesanan & Checkout Token terintegrasi untuk Iklan
 */
export const handlePublicCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const {
      fullName,
      whatsapp,
      email,
      packageId,
      customPackageData,
      voucherCode,
      referralCode,
      paymentMethod = 'gateway',
      additionalData = {},
    } = req.body;

    // Validasi data wajib
    if (!fullName || !whatsapp || !email) {
      res.status(400).json({ message: 'Nama, WhatsApp, dan Email wajib diisi.' });
      return;
    }

    // Cari Landing Page
    const page = await LandingPage.findOne({ where: { slug } });
    if (!page) {
      res.status(404).json({ message: 'Landing page tidak ditemukan.' });
      return;
    }

    // 1. Temukan atau Buat User Otomatis untuk pembeli dari iklan
    let user = await User.findOne({ where: { email } });
    let isNewUser = false;
    let temporaryPassword = '';

    if (!user) {
      isNewUser = true;
      const cleanPhone = whatsapp.replace(/[^0-9]/g, '');
      const username = `${email.split('@')[0]}_${Math.floor(1000 + Math.random() * 9000)}`;
      temporaryPassword = `Mahirku${Math.floor(1000 + Math.random() * 9000)}!`;
      const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

      user = await User.create({
        username,
        email,
        password: hashedPassword,
        fullname: fullName,
        phoneNumber: cleanPhone,
        address: '-',
        roleId: 3, // Role 'user'
        tokens: 0,
      });
    }

    // 2. Tentukan Paket dan Harga
    let selectedPackage: any = null;
    let basePrice = 49000;
    let tokenAmount = 1;
    let packageName = 'Paket 1 Token';

    if (packageId) {
      selectedPackage = await Package.findByPk(packageId);
    }

    if (selectedPackage) {
      basePrice = selectedPackage.price;
      tokenAmount = selectedPackage.defaultTokenAmount;
      packageName = selectedPackage.name;
    } else if (customPackageData) {
      basePrice = customPackageData.price || 49000;
      tokenAmount = customPackageData.tokens || 1;
      packageName = customPackageData.name || 'Paket Asesmen';
    }

    // 3. Hitung Diskon Voucher jika ada
    let totalAmount = basePrice;
    let voucherId: number | null = null;
    let discountAmount = 0;

    if (voucherCode) {
      try {
        const voucher = await validateVoucher(voucherCode);
        discountAmount = calculateDiscount(totalAmount, voucher);
        totalAmount = Math.max(0, totalAmount - discountAmount);
        voucherId = voucher.id;
      } catch (err: any) {
        console.warn('Voucher validation warning:', err.message);
      }
    }

    const finalAmount = Math.round(totalAmount);

    // 4. JIKA PILIH VIA WHATSAPP (Checkout langsung via chat WA seperti formulir.com)
    if (paymentMethod === 'whatsapp') {
      const adminPhone =
        page.formConfig?.whatsappAdminNumber || '6281234567890';
      const cleanAdminPhone = adminPhone.replace(/[^0-9]/g, '');

      // Simpan Submission
      const submission = await LandingPageSubmission.create({
        landingPageId: page.id,
        fullName,
        whatsapp,
        email,
        additionalData,
        packageId: selectedPackage ? selectedPackage.id : null,
        amount: finalAmount,
        paymentMethod: 'whatsapp',
        status: 'pending',
        referralCode: referralCode || null,
        userId: user.id,
      });

      const additionalLines = Object.entries(additionalData || {})
        .filter(([, val]) => val !== undefined && val !== null && String(val).trim() !== '')
        .map(([key, val]) => {
          const label =
            key === 'goal' ? 'Target' : key === 'birthDate' ? 'Tanggal Lahir' : key;
          return `• ${label}: ${Array.isArray(val) ? val.join(', ') : val}\n`;
        })
        .join('');

      // Format Pesan WhatsApp
      const waMessage =
        `*Halo Admin Mahirku, saya ingin konfirmasi order Token Tes:*\n\n` +
        `📝 *Data Pemesan:*\n` +
        `• Nama: ${fullName}\n` +
        `• WhatsApp: ${whatsapp}\n` +
        `• Email: ${email}\n` +
        additionalLines +
        `\n📦 *Paket Pesanan:*\n` +
        `• Paket: ${packageName} (${tokenAmount} Token)\n` +
        `• Total Tagihan: Rp ${finalAmount.toLocaleString('id-ID')}\n` +
        `• Ref Halaman: ${page.title} (${page.slug})\n\n` +
        `Mohon instruksi pembayaran dan aktivasi tokennya. Terima kasih! 🙏`;

      const whatsappUrl = `https://wa.me/${cleanAdminPhone}?text=${encodeURIComponent(
        waMessage
      )}`;

      // Update conversion
      page.increment('conversionsCount');

      res.status(200).json({
        success: true,
        paymentMethod: 'whatsapp',
        whatsappUrl,
        submissionId: submission.id,
        user: {
          id: user.id,
          email: user.email,
          isNewUser,
        },
      });
      return;
    }

    // 5. JIKA PILIH VIA PAYMENT GATEWAY (Xendit QRIS / VA / E-Wallet)
    // Buat Invoice record
    const invoice = await Invoice.create({
      userId: user.id,
      packageId: selectedPackage ? selectedPackage.id : null,
      tokenAmount,
      voucherId,
      voucherCode: voucherCode || null,
      referralCode: referralCode || null,
      status: 'PENDING',
    });

    // Simpan submission
    const submission = await LandingPageSubmission.create({
      landingPageId: page.id,
      fullName,
      whatsapp,
      email,
      additionalData,
      packageId: selectedPackage ? selectedPackage.id : null,
      amount: finalAmount,
      invoiceId: invoice.id,
      paymentMethod: 'gateway',
      status: 'pending',
      referralCode: referralCode || null,
      userId: user.id,
    });

    // Handle jika gratis / voucher 100%
    if (finalAmount <= 0) {
      invoice.status = 'PAID';
      invoice.paymentDate = new Date();
      await invoice.save();

      await TokenPurchase.create({
        userId: user.id,
        voucherId,
        packageId: selectedPackage ? selectedPackage.id : null,
        totalToken: tokenAmount,
        pricePerToken: 0,
        totalAmount: 0,
        discountAmount,
        paymentStatus: 'paid',
        paymentMethod: 'FREE_VOUCHER',
      });

      await User.increment({ tokens: tokenAmount }, { where: { id: user.id } });
      await submission.update({ status: 'paid' });
      await page.increment('conversionsCount');

      res.status(200).json({
        success: true,
        isFree: true,
        paymentUrl: null,
        invoiceId: invoice.id,
        message: 'Pendaftaran sukses! Token gratis telah ditambahkan ke akun Anda.',
        user: {
          id: user.id,
          email: user.email,
          isNewUser,
          temporaryPassword: isNewUser ? temporaryPassword : null,
        },
      });
      return;
    }

    // Buat invoice ke Xendit
    try {
      const authHeader = Buffer.from(`${xenditConfig.apiKey}:`).toString('base64');
      const payload = {
        external_id: `INV-${invoice.id}`,
        amount: finalAmount,
        description: `Token Asesmen Mahirku - ${packageName}`,
        invoice_duration: 86400,
        customer: {
          given_names: fullName,
          email: email,
          mobile_number: whatsapp,
        },
        success_redirect_url: `${xenditConfig.successRedirectUrl}?invoiceId=${invoice.id}&status=success`,
        failure_redirect_url: `${xenditConfig.failureRedirectUrl}?invoiceId=${invoice.id}&status=failure`,
        callback_url: `${xenditConfig.callbackUrl}?invoiceId=${invoice.id}`,
      };

      const xenditRes = await axios.post(
        `${xenditConfig.baseUrl}/v2/invoices`,
        payload,
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );

      if (xenditRes.data && xenditRes.data.invoice_url) {
        invoice.set({ xenditInvoiceId: xenditRes.data.id });
        await invoice.save();
        await page.increment('conversionsCount');

        res.status(200).json({
          success: true,
          paymentUrl: xenditRes.data.invoice_url,
          invoiceId: invoice.id,
          submissionId: submission.id,
          user: {
            id: user.id,
            email: user.email,
            isNewUser,
            temporaryPassword: isNewUser ? temporaryPassword : null,
          },
        });
        return;
      }
    } catch (xenditErr: any) {
      console.warn(
        'Xendit invoice creation error (using direct checkout link fallback):',
        xenditErr.response?.data || xenditErr.message
      );
    }

    // Fallback jika API key Xendit sandbox / offline di local dev:
    // Buat direct redirect yang tetap mengizinkan user lanjut simulasi atau konfirmasi manual
    const fallbackPaymentUrl = `/payment-success?invoiceId=${invoice.id}&simulated=true`;
    await page.increment('conversionsCount');

    res.status(200).json({
      success: true,
      paymentUrl: fallbackPaymentUrl,
      invoiceId: invoice.id,
      submissionId: submission.id,
      user: {
        id: user.id,
        email: user.email,
        isNewUser,
        temporaryPassword: isNewUser ? temporaryPassword : null,
      },
    });
  } catch (err: any) {
    console.error('handlePublicCheckout error:', err);
    res.status(500).json({
      message: 'Gagal memproses checkout token',
      error: err.message,
    });
  }
};

/**
 * GET /api/landing-pages/:id/submissions
 * Ambil daftar leads / order dari landing page tertentu
 */
export const getLandingPageSubmissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const submissions = await LandingPageSubmission.findAll({
      where: { landingPageId: id },
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: Invoice,
          as: 'invoice',
          attributes: ['id', 'status', 'tokenAmount', 'paymentDate'],
        },
        {
          model: Package,
          as: 'package',
          attributes: ['id', 'name', 'price'],
        },
      ],
    });

    res.status(200).json({ data: submissions });
  } catch (err: any) {
    console.error('getLandingPageSubmissions error:', err);
    res.status(500).json({ message: 'Gagal mengambil data leads', error: err.message });
  }
};

/**
 * POST /api/landing-pages/upload
 * Upload gambar atau video pendek untuk konten landing page
 */
export const uploadLandingPageMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'Tidak ada file yang diupload.' });
      return;
    }

    const relativeUrl = `/uploads/landing-pages/${req.file.filename}`;
    const fullUrl = `${req.protocol}://${req.get('host')}${relativeUrl}`;

    res.status(200).json({
      message: 'Media berhasil diupload',
      url: fullUrl,
      relativeUrl,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });
  } catch (err: any) {
    console.error('uploadLandingPageMedia error:', err);
    res.status(500).json({ message: 'Gagal mengupload media', error: err.message });
  }
};

