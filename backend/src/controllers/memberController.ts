import { Request, Response } from 'express';
import User from '../models/User';

export const getMemberReports = async (req: Request, res: Response): Promise<void> => {
  try {
    const parentId = (req as any).user?.userId;
    if (!parentId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Ambil semua member
    const members = await User.findAll({
      where: { parentId },
      attributes: ['id', 'fullname', 'email', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    if (members.length === 0) {
      res.status(200).json({ data: [] });
      return;
    }

    const memberIds = members.map(m => m.id);

    // Ambil Thinking Style (CST)
    const { default: ThinkingStyleResult } = await import('../models/ThinkingStyleResult');
    const { default: ThinkingStyle } = await import('../models/ThinkingStyle');
    const cstResults = await ThinkingStyleResult.findAll({
      where: { userId: memberIds },
      include: [{ model: ThinkingStyle, as: 'thinkingStyle' }],
      order: [['createdAt', 'DESC']]
    });

    // Ambil DISC
    const { default: DiscResult } = await import('../models/DiscResult');
    const discResults = await DiscResult.findAll({
      where: { user_id: memberIds },
      order: [['created_at', 'DESC']]
    });

    // Ambil Graphology
    const { default: GraphologyTest } = await import('../models/GraphologyTest');
    const graphologyResults = await GraphologyTest.findAll({
      where: { userId: memberIds, status: 'completed' },
      order: [['createdAt', 'DESC']]
    });

    // Susun data per member
    const reports = members.map(member => {
      const tests: any[] = [];

      // Filter CST
      cstResults.filter(c => c.userId === member.id).forEach(c => {
        tests.push({
          id: c.id,
          testType: 'CST',
          date: c.createdAt,
          result: (c as any).thinkingStyle ? {
            type: (c as any).thinkingStyle.type,
            code: (c as any).thinkingStyle.code
          } : null,
          rawResult: c
        });
      });

      // Filter DISC
      discResults.filter(d => d.user_id === member.id).forEach(d => {
        tests.push({
          id: d.id,
          testType: 'DISC',
          date: d.created_at,
          result: {
            type: d.dominant_type
          },
          rawResult: d
        });
      });

      // Filter Graphology
      graphologyResults.filter(g => g.userId === member.id).forEach(g => {
        tests.push({
          id: g.id,
          testType: 'Graphology',
          date: g.createdAt,
          result: {
            type: g.aiResult?.title || g.aiResult?.personality_type || 'Graphology'
          },
          rawResult: g
        });
      });

      // Sort tes berdasarkan tanggal terbaru
      tests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      return {
        member: member.toJSON(),
        tests
      };
    });

    res.status(200).json({ data: reports });
  } catch (error) {
    console.error('getMemberReports error:', error);
    res.status(500).json({ error: 'Gagal mengambil data laporan member' });
  }
};
