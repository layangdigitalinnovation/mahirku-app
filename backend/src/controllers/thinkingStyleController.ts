import { Request, Response } from 'express';
import ThinkingStyleResult from '../models/ThinkingStyleResult';
import User from '../models/User';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';

// Define a type for thinking style mapping
type ThinkingStyle = {
  type: string;
  code: string;
  description: string;
  theory: string;
};

const STYLE_MAP: Record<number, ThinkingStyle> = {
  1: {
    type: 'Deep Analyzer',
    code: 'Analyzer-I',
    description: 'Sangat logis, berpikir mendalam sebelum bertindak, suka sistem yang tertata.',
    theory: 'Prefrontal cortex dominan, sistematika logis',
  },
  2: {
    type: 'Social Empath',
    code: 'Empath-E',
    description: 'Ramah, peduli, hangat. Cepat membaca suasana hati orang lain dan suka menyenangkan orang lain.',
    theory: 'Ekstrovert emosional, afiliasi tinggi',
  },
  3: {
    type: 'Quiet Observer',
    code: 'Observer-I',
    description: 'Pendiam tapi teliti. Menyerap banyak informasi melalui pengamatan diam-diam, suka bekerja di belakang layar.',
    theory: 'Jungian introverted sensing',
  },
  4: {
    type: 'Active Observer',
    code: 'Observer-E',
    description: 'Detail dan cepat tanggap. Suka bergerak, langsung terjun ke lapangan, fokus pada realitas nyata.',
    theory: 'Teori fungsi sensorik ekstrovert (Carl Jung)',
  },
  5: {
    type: 'Quiet Empath',
    code: 'Empath-I',
    description: 'Emosional dalam, sangat menjaga perasaan diri & orang lain, cenderung menghindari konflik dan sensitif.',
    theory: 'Teori kecerdasan emosional intrapersonal',
  },
  6: {
    type: 'Bold Visionary',
    code: 'Visionary-E',
    description: 'Penuh ide, antusias, suka eksplorasi dan mencoba hal baru. Mudah menangkap peluang dari sekitar.',
    theory: 'Intuisi terbuka, koneksi cepat antar konsep',
  },
  7: {
    type: 'Inner Visionary',
    code: 'Visionary-I',
    description: 'Imajinatif, banyak ide, tapi lebih suka menyendiri. Berpikir jauh ke depan, cenderung filosofis.',
    theory: 'Intuisi internal, pemikiran non-linear',
  },
  8: {
    type: 'Strategic Analyzer',
    code: 'Analyzer-E',
    description: 'Cepat mengambil keputusan berdasarkan logika. Tegas, objektif, dan sangat fokus pada efisiensi.',
    theory: 'Ekstroversi logis, berpikir cepat dan sistemik',
  },
  9: {
    type: 'Dynamic Navigator',
    code: 'Navigator',
    description: 'Tipe cepat ambil keputusan. Mengandalkan feeling dan gerak refleks, biasanya kuat di lapangan atau situasi darurat.',
    theory: 'Sistem limbik dominan, insting bertahan hidup',
  },
};

// Helper: Reduce digit (e.g., 38 -> 3+8 = 11 -> 1+1 = 2)
const reduceToSingleDigit = (n: number): number => {
  while (n > 9) {
    n = n
      .toString()
      .split('')
      .reduce((acc: number, d: string) => acc + parseInt(d), 0);
  }
  return n;
};

export const submitThinkingStyleTest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, fullname, birthdate, fingerprintId, referrerId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User tidak ditemukan' });
      return;
    }

    // Cek token
    if (user.tokens <= 0) {
      res.status(403).json({ message: 'Token tidak mencukupi' });
      return;
    }

    // Hitung digit dari tanggal lahir
    const digits: number[] = birthdate.replace(/-/g, '').split('').map(Number);
    const total: number = digits.reduce((acc: number, cur: number) => acc + cur, 0);
    const resultDigit: number = reduceToSingleDigit(total);

    const style = STYLE_MAP[resultDigit];
    if (!style) {
      res.status(400).json({ message: 'Gagal menentukan gaya berpikir' });
      return;
    }

    const result = await ThinkingStyleResult.create({
      userId,
      fullname,
      birthdate,
      resultDigit,
      resultType: style.type,
      resultCode: style.code,
      description: style.description,
      theory: style.theory,
      fingerprintId,
      referrerId,
    });

    // Kurangi token
    user.tokens -= 1;
    await user.save();

    res.status(201).json({
      message: 'Tes gaya berpikir berhasil',
      data: result,
    });
  } catch (err: any) {
    console.error('submitThinkingStyleTest error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};

export const getThinkingStyleHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: 'User tidak ditemukan' });
      return;
    }

    const history = await ThinkingStyleResult.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      message: 'Histori tes berhasil diambil',
      data: history,
    });
  } catch (err: any) {
    console.error('getThinkingStyleHistory error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};

export const downloadThinkingStylePDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { resultId } = req.params;

    const result = await ThinkingStyleResult.findByPk(resultId);
    if (!result) {
      res.status(404).json({ message: 'Hasil tes tidak ditemukan' });
      return;
    }

    const accessUrl = `https://mahirku.com/thinking-style/${resultId}`;
    const qrDataUrl = await QRCode.toDataURL(accessUrl);

    // Set header supaya browser langsung download
    res.setHeader('Content-Disposition', `attachment; filename="Hasil_Tes_${result.fullname}.pdf"`);
    res.setHeader('Content-Type', 'application/pdf');

    // Buat PDF dan streaming langsung ke response
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Judul
    doc.fontSize(20).text('Hasil Tes Gaya Berpikir', { align: 'center' }).moveDown(2);

    // Data peserta
    doc.fontSize(12).text(`Nama: ${result.fullname}`);
    doc.text(`Tanggal Lahir: ${result.birthdate}`);
    doc.text(`Gaya Berpikir: ${result.resultType} (${result.resultCode})`).moveDown();

    // Deskripsi & teori
    doc.fontSize(12).text('Deskripsi:', { underline: true });
    doc.text(result.description, { align: 'justify' }).moveDown();

    doc.text('Landasan Teori:', { underline: true });
    doc.text(result.theory, { align: 'justify' }).moveDown(2);

    // QR Code
    const qrImageBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
    doc.image(qrImageBuffer, { fit: [100, 100], align: 'center' });

    doc.end(); // selesai
  } catch (err: any) {
    console.error('downloadThinkingStylePDF error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};