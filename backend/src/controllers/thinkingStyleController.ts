import { Request, Response } from "express";
import ThinkingStyleResult from "../models/ThinkingStyleResult";
import ThinkingStyle from "../models/ThinkingStyle";
import DiscResult from "../models/DiscResult";
import GraphologyTest from "../models/GraphologyTest";
import User from "../models/User";
import Role from "../models/Role";
import QRCode from "qrcode";
import PDFDocument from "pdfkit";
import { GroqService } from "../services/groqService";
import { sequelize } from "../config/database";

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
      const { fullname, birthdate, fingerprintId, referrerId, questionnaire } = req.body;

      const { userId } = req.user;

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

      const pickStyleByQuestionnaire = async () => {
        const q = questionnaire || {};
        const tipeUtama = String(q.tipeUtama || '').trim();
        const eiType = String(q.eiType || '').trim();
        const finalType = String(q.finalType || '').trim();

        if (finalType === 'Navigator' || tipeUtama === 'Navigator') {
          return await ThinkingStyle.findOne({ where: { code: 'Navigator', isActive: true } });
        }

        const base = tipeUtama || finalType.split(' ')[0] || '';
        const suffix = eiType === 'Ekstrovert' || finalType.toLowerCase().includes('ekstrovert') ? 'E' : 'I';
        const code = base ? `${base}-${suffix}` : '';
        if (!code) return null;
        return await ThinkingStyle.findOne({ where: { code, isActive: true } });
      };

      const pickStyleByBirthdateDigit = async () => {
        const digits: number[] = String(birthdate).replace(/\D/g, "").split("").map(Number);
        const total: number = digits.reduce((acc: number, cur: number) => acc + cur, 0);
        const resultDigit: number = reduceToSingleDigit(total);
        return await ThinkingStyle.findByDigit(resultDigit);
      };

      const style = (questionnaire ? await pickStyleByQuestionnaire() : null) || await pickStyleByBirthdateDigit();
      if (!style) {
        res
          .status(400)
          .json({
            message: "Gaya berpikir tidak ditemukan untuk digit tersebut",
          });
        return;
      }

      const qPercent = questionnaire && typeof questionnaire.percent === 'number'
        ? Math.max(0, Math.min(100, Math.round(Number(questionnaire.percent))))
        : null;

      const groqService = new GroqService();

      const { created, aiInput } = await sequelize.transaction(async (t) => {
        const lockedUser = await User.findByPk(userId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!lockedUser) {
          throw Object.assign(new Error("User tidak ditemukan"), { statusCode: 404 });
        }
        if (lockedUser.tokens <= 0) {
          throw Object.assign(new Error("Token tidak mencukupi"), { statusCode: 403 });
        }

        const created = await ThinkingStyleResult.create({
          userId,
          fullname,
          birthdate,
          resultDigit: style.digit,
          thinkingStyleId: style.id,
          fingerprintId,
          referrerId,
          questionnaire: questionnaire || null,
          questionnairePercent: qPercent,
          aiReportStatus: 'processing',
        } as any, { transaction: t });

        await lockedUser.decrement('tokens', { by: 1, transaction: t });

        // (Auto-upgrade role to affiliator has been removed to preserve user UX)

        await lockedUser.save({ transaction: t });

        const age = (() => {
          const d = new Date(birthdate);
          if (Number.isNaN(d.getTime())) return undefined;
          const now = new Date();
          let a = now.getFullYear() - d.getFullYear();
          const m = now.getMonth() - d.getMonth();
          if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a -= 1;
          return a;
        })();

        const dims = (() => {
          const ds = questionnaire?.domainScores || {};
          const max = 30;
          const toPct = (v: any) => Math.max(0, Math.min(100, Math.round((Number(v || 0) / max) * 100)));
          const list: { label: string; percent: number }[] = [];
          if (typeof ds.Observer !== 'undefined') list.push({ label: 'Observation', percent: toPct(ds.Observer) });
          if (typeof ds.Navigator !== 'undefined') list.push({ label: 'Action Thinking', percent: toPct(ds.Navigator) });
          if (typeof ds.Analyzer !== 'undefined') list.push({ label: 'Analytical', percent: toPct(ds.Analyzer) });
          if (typeof ds.Visionary !== 'undefined') list.push({ label: 'Intuitive', percent: toPct(ds.Visionary) });
          if (typeof ds.Empath !== 'undefined') list.push({ label: 'Empathy', percent: toPct(ds.Empath) });
          if (typeof ds.Social !== 'undefined') list.push({ label: 'Social', percent: toPct(ds.Social) });
          return list;
        })();

        const styleName = questionnaire?.finalType || style.code || style.type;
        const aiInput = {
          cognitive_style: String(styleName),
          score: qPercent ?? 0,
          dimensions: dims.length ? dims : undefined,
          user_age: age,
          secondary_style: questionnaire?.tipeUtama && questionnaire?.finalType && questionnaire?.tipeUtama !== questionnaire?.finalType ? String(questionnaire.tipeUtama) : undefined,
          extra: {
            ei_type: questionnaire?.eiType || undefined,
          },
        };

        return { created, aiInput };
      });

      void groqService.generateCognitiveStyleReport(aiInput).then(async (report) => {
        await ThinkingStyleResult.update(
          { aiReport: report, aiReportStatus: 'completed', aiReportError: null, aiReportGeneratedAt: new Date() } as any,
          { where: { id: created.id, userId } }
        );
      }).catch(async (e: any) => {
        await ThinkingStyleResult.update(
          { aiReportStatus: 'failed', aiReportError: e?.message || 'AI generation failed' } as any,
          { where: { id: created.id, userId } }
        );
      });

      res.status(201).json({
        message: "Tes gaya berpikir berhasil",
        data: {
          ...created.toJSON(),
          thinkingStyle: {
            id: style.id,
            type: style.type,
            code: style.code,
            description: style.description,
            theory: style.theory,
            detailPage: style.detailPage
          },
        },
      });
    } catch (err: any) {
      console.error("submitThinkingStyleTest error:", err);
      if (err?.statusCode === 403) {
        res.status(403).json({ message: "Token tidak mencukupi" });
        return;
      }
      if (err?.statusCode === 404) {
        res.status(404).json({ message: "User tidak ditemukan" });
        return;
      }
      res.status(500).json({ message: "Terjadi kesalahan", error: err.message });
    }
  };

export const getThinkingStyleAiReport = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.user;
    const { resultId } = req.params as any;

    const result = await ThinkingStyleResult.findOne({ where: { id: resultId, userId } });
    if (!result) {
      res.status(404).json({ message: "Hasil tes tidak ditemukan" });
      return;
    }

    res.status(200).json({
      message: "OK",
      data: {
        status: (result as any).aiReportStatus || 'pending',
        report: (result as any).aiReport || null,
        error: (result as any).aiReportError || null,
        generatedAt: (result as any).aiReportGeneratedAt || null,
      },
    });
  } catch (err: any) {
    console.error("getThinkingStyleAiReport error:", err);
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

    // Fetch Thinking Style Results
    const thinkingStyleHistory = await ThinkingStyleResult.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
      include: [{
        model: ThinkingStyle,
        as: 'thinkingStyle',
        attributes: ['id', 'type', 'code', 'description', 'theory', 'detailPage']
      }]
    });

    // Fetch DISC Results
    const discHistory = await DiscResult.findAll({
      where: { user_id: userId },
      order: [["created_at", "DESC"]]
    });

    // Fetch Graphology Results
    const graphologyHistory = await GraphologyTest.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]]
    });

    // Attempt to find a birthdate from existing Thinking Style results
    // Since DISC doesn't store it and User doesn't have it.
    const derivedBirthdate = thinkingStyleHistory.length > 0 ? thinkingStyleHistory[0].birthdate : null;

    // Map and Combine
    const mappedThinkingStyle = thinkingStyleHistory.map((item: any) => ({
      ...item.toJSON(),
      // Ensure fullname is available, falling back to current user name if empty, 
      // or strictly using user.fullname if we want exact parity with DISC behavior (which uses current profile)
      fullname: item.fullname || user.fullname,
      testType: 'THINKING_STYLE',
      sortDate: new Date(item.createdAt)
    }));

    const mappedDisc = discHistory.map((item: any) => {
      const json = item.toJSON();
      return {
        ...json,
        id: item.id, // Ensure ID is preserved
        fullname: user.fullname, // Use current user fullname as fallback since DISC doesn't store snapshot
        birthdate: derivedBirthdate, // Use derived birthdate or null
        createdAt: item.created_at, // Normalize field name
        testType: 'DISC',
        // Map snake_case to camelCase for frontend compatibility
        dScore: json.d_score,
        iScore: json.i_score,
        sScore: json.s_score,
        cScore: json.c_score,
        dominantType: json.dominant_type,

        thinkingStyle: { // Mock structure for frontend compatibility (or distinct handling)
          id: item.id,
          type: item.dominant_type, // e.g., "Dominance (D)"
          description: "DISC Personality Assessment Result",
          theory: "William Moulton Marston's DISC Theory",
          code: item.dominant_type?.split(' ')[0] || 'DISC'
        },
        sortDate: new Date(item.created_at)
      };
    });

    const mappedGraphology = graphologyHistory.map((item: any) => {
      const json = item.toJSON();
      return {
        ...json,
        fullname: user.fullname,
        birthdate: derivedBirthdate,
        testType: 'Graphology',
        thinkingStyle: {
          id: item.id,
          type: item.aiResult?.title || 'Graphology',
          code: item.aiResult?.type_id || 'GRP',
          description: 'Graphology & Talent Mapping Assessment',
        },
        sortDate: new Date(item.createdAt)
      };
    });

    const combinedHistory = [...mappedThinkingStyle, ...mappedDisc, ...mappedGraphology].sort(
      (a, b) => b.sortDate.getTime() - a.sortDate.getTime()
    );

    res.status(200).json({
      message: "Histori tes berhasil diambil",
      data: combinedHistory,
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
        as: 'thinkingStyle',
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
