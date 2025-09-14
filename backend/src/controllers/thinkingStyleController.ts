import { Request, Response } from "express";
import ThinkingStyleResult from "../models/ThinkingStyleResult";
import ThinkingStyle from "../models/ThinkingStyle";
import User from "../models/User";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Helper: Reduce digit (e.g., 38 -> 3+8 = 11 -> 1+1 = 2)
const reduceToSingleDigit = (n: number): number => {
  while (n > 9) {
    n = n
      .toString()
      .split("")
      .reduce((acc: number, d: string) => acc + parseInt(d), 0);
  }
  return n;
};

export const 
submitThinkingStyleTest = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { fullname, birthdate, fingerprintId, referrerId } = req.body;

    const { userId } = req.user;

    console.log(birthdate);

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    // Cek token
    if (user.tokens <= 0) {
      res.status(403).json({ message: "Token tidak mencukupi" });
      return;
    }

    // Hitung digit dari tanggal lahir
    const digits: number[] = birthdate.replace(/\D/g, "").split("").map(Number);
    const total: number = digits.reduce(
      (acc: number, cur: number) => acc + cur,
      0
    );
    const resultDigit: number = reduceToSingleDigit(total);

    const style = await ThinkingStyle.findByDigit(resultDigit);
    if (!style) {
      res
        .status(400)
        .json({
          message: "Gaya berpikir tidak ditemukan untuk digit tersebut",
        });
      return;
    }

    const result = await ThinkingStyleResult.create({
      userId,
      fullname,
      birthdate,
      resultDigit,
      thinkingStyleId: style.id,
      fingerprintId,
      referrerId,
    });

    // Kurangi token
    user.tokens -= 1;
    await user.save();

    res.status(201).json({
      message: "Tes gaya berpikir berhasil",
      data: {
        ...result.toJSON(),
        thinkingStyle: {
          id: style.id,
          type: style.type,
          code: style.code,
          description: style.description,
          theory: style.theory,
          detailPage : style.detailPage
        },
      },
    });
  } catch (err: any) {
    console.error("submitThinkingStyleTest error:", err);
    res.status(500).json({ message: "Terjadi kesalahan", error: err.message });
  }
};

export const getThinkingStyleHistory = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.user;

    const user = await User.findByPk(userId);
    if (!user) {
      res.status(404).json({ message: "User tidak ditemukan" });
      return;
    }

    const history = await ThinkingStyleResult.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [{
        model: ThinkingStyle,
        as : 'thinkingStyle',
        attributes: ['id', 'type', 'code', 'description', 'theory', 'detailPage']
      }]
    });

    res.status(200).json({
      message: "Histori tes berhasil diambil",
      data: history,
    });
  } catch (err: any) {
    console.error("getThinkingStyleHistory error:", err);
    res.status(500).json({ message: "Terjadi kesalahan", error: err.message });
  }
};

export const downloadThinkingStylePDF = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { resultId } = req.params;

    const result = await ThinkingStyleResult.findByPk(resultId, {
      include: [{
        model: ThinkingStyle,
        as : 'thinkingStyle',
      }],
    });
    if (!result) {
      res.status(404).json({ message: "Hasil tes tidak ditemukan" });
      return;
    }

    const style = result.get('thinkingStyle') as ThinkingStyle;

    const accessUrl = `https://localhost:5173/thinking-style/${resultId}`;
    const qrDataUrl = await QRCode.toDataURL(accessUrl);

    // Set header supaya browser langsung download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="Hasil_Tes_${result.fullname}.pdf"`
    );
    res.setHeader("Content-Type", "application/pdf");

    // Buat PDF dan streaming langsung ke response
    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(res);

    // Judul
    doc
      .fontSize(20)
      .text("Hasil Tes Gaya Berpikir", { align: "center" })
      .moveDown(2);

    // Data peserta
    doc.fontSize(12).text(`Nama: ${result.fullname}`);
    doc.text(`Tanggal Lahir: ${result.birthdate}`);
    doc
      .text(`Gaya Berpikir: ${style.type} (${style.code})`)
      .moveDown();

    // Deskripsi & teori
    doc.fontSize(12).text("Deskripsi:", { underline: true });
    doc.text(style.description, { align: "justify" }).moveDown();

    doc.text("Landasan Teori:", { underline: true });
    doc.text(style.theory, { align: "justify" }).moveDown(2);

    // QR Code
    const qrImageBuffer = Buffer.from(qrDataUrl.split(",")[1], "base64");
    doc.image(qrImageBuffer, { fit: [100, 100], align: "center" });

    doc.end(); // selesai
  } catch (err: any) {
    console.error("downloadThinkingStylePDF error:", err);
    res.status(500).json({ message: "Terjadi kesalahan", error: err.message });
  }
};
