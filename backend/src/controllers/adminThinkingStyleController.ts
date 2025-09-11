import { Request, Response } from 'express';
import ThinkingStyle from '../models/ThinkingStyle';
import { Op } from 'sequelize';

// Get all thinking styles (with pagination and search)
export const getAllThinkingStyles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search = '', isActive } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Build where condition
    const whereCondition: any = {};
    
    if (search) {
      whereCondition[Op.or] = [
        { type: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    if (isActive !== undefined) {
      whereCondition.isActive = isActive === 'true';
    }

    const { count, rows } = await ThinkingStyle.findAndCountAll({
      where: whereCondition,
      limit: Number(limit),
      offset,
      order: [['digit', 'ASC']]
    });

    res.status(200).json({
      message: 'Thinking styles berhasil diambil',
      data: {
        thinkingStyles: rows,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(count / Number(limit)),
          totalItems: count,
          itemsPerPage: Number(limit)
        }
      }
    });
  } catch (err: any) {
    console.error('getAllThinkingStyles error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};

// Get thinking style by ID
export const getThinkingStyleById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const thinkingStyle = await ThinkingStyle.findByPk(id);
    if (!thinkingStyle) {
      res.status(404).json({ message: 'Thinking style tidak ditemukan' });
      return;
    }

    res.status(200).json({
      message: 'Thinking style berhasil diambil',
      data: thinkingStyle
    });
  } catch (err: any) {
    console.error('getThinkingStyleById error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};

// Create new thinking style
export const createThinkingStyle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { digit, type, code, description, theory, isActive = true, detailPage } = req.body;

    // Validasi input
    if (!digit || !type || !code || !description || !theory) {
      res.status(400).json({ message: 'Semua field wajib diisi' });
      return;
    }

    // Validasi digit range
    if (digit < 1 || digit > 9) {
      res.status(400).json({ message: 'Digit harus antara 1-9' });
      return;
    }

    // Cek apakah digit sudah ada
    const existingStyle = await ThinkingStyle.findOne({ where: { digit } });
    if (existingStyle) {
      res.status(400).json({ message: `Thinking style dengan digit ${digit} sudah ada` });
      return;
    }

    const newThinkingStyle = await ThinkingStyle.create({
      digit,
      type,
      code,
      description,
      theory,
      isActive,
      detailPage
    });

    res.status(201).json({
      message: 'Thinking style berhasil dibuat',
      data: newThinkingStyle
    });
  } catch (err: any) {
    console.error('createThinkingStyle error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};

// Update thinking style
export const updateThinkingStyle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { digit, type, code, description, theory, isActive, detailPage } = req.body;

    const thinkingStyle = await ThinkingStyle.findByPk(id);
    if (!thinkingStyle) {
      res.status(404).json({ message: 'Thinking style tidak ditemukan' });
      return;
    }

    // Jika digit diubah, cek apakah digit baru sudah ada
    if (digit && digit !== thinkingStyle.digit) {
      if (digit < 1 || digit > 9) {
        res.status(400).json({ message: 'Digit harus antara 1-9' });
        return;
      }

      const existingStyle = await ThinkingStyle.findOne({ 
        where: { 
          digit,
          id: { [Op.ne]: id } // Exclude current record
        } 
      });
      if (existingStyle) {
        res.status(400).json({ message: `Thinking style dengan digit ${digit} sudah ada` });
        return;
      }
    }

    // Update fields
    const updateData: any = {};
    if (digit !== undefined) updateData.digit = digit;
    if (type !== undefined) updateData.type = type;
    if (code !== undefined) updateData.code = code;
    if (description !== undefined) updateData.description = description;
    if (theory !== undefined) updateData.theory = theory;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (detailPage !== undefined) updateData.detailPage = detailPage;

    await thinkingStyle.update(updateData);

    res.status(200).json({
      message: 'Thinking style berhasil diperbarui',
      data: thinkingStyle
    });
  } catch (err: any) {
    console.error('updateThinkingStyle error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};

// Delete thinking style (soft delete by setting isActive to false)
export const deleteThinkingStyle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const thinkingStyle = await ThinkingStyle.findByPk(id);
    if (!thinkingStyle) {
      res.status(404).json({ message: 'Thinking style tidak ditemukan' });
      return;
    }

    // Soft delete by setting isActive to false
    await thinkingStyle.update({ isActive: false });

    res.status(200).json({
      message: 'Thinking style berhasil dihapus (dinonaktifkan)'
    });
  } catch (err: any) {
    console.error('deleteThinkingStyle error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};

// Restore thinking style (set isActive to true)
export const restoreThinkingStyle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const thinkingStyle = await ThinkingStyle.findByPk(id);
    if (!thinkingStyle) {
      res.status(404).json({ message: 'Thinking style tidak ditemukan' });
      return;
    }

    await thinkingStyle.update({ isActive: true });

    res.status(200).json({
      message: 'Thinking style berhasil diaktifkan kembali',
      data: thinkingStyle
    });
  } catch (err: any) {
    console.error('restoreThinkingStyle error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};

// Get thinking style statistics
export const getThinkingStyleStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const totalStyles = await ThinkingStyle.count();
    const activeStyles = await ThinkingStyle.count({ where: { isActive: true } });
    const inactiveStyles = await ThinkingStyle.count({ where: { isActive: false } });

    // Get usage statistics from ThinkingStyleResult
    const usageStats = await ThinkingStyle.findAll({
      attributes: [
        'digit',
        'type',
        'code'
      ],
      where: { isActive: true },
      order: [['digit', 'ASC']]
    });

    res.status(200).json({
      message: 'Statistik thinking style berhasil diambil',
      data: {
        summary: {
          total: totalStyles,
          active: activeStyles,
          inactive: inactiveStyles
        },
        styles: usageStats
      }
    });
  } catch (err: any) {
    console.error('getThinkingStyleStats error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};

// Bulk update thinking styles
export const bulkUpdateThinkingStyles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { updates } = req.body; // Array of { id, ...updateData }

    if (!Array.isArray(updates) || updates.length === 0) {
      res.status(400).json({ message: 'Data updates harus berupa array dan tidak boleh kosong' });
      return;
    }

    const results = [];
    const errors = [];

    for (const update of updates) {
      try {
        const { id, ...updateData } = update;
        
        const thinkingStyle = await ThinkingStyle.findByPk(id);
        if (!thinkingStyle) {
          errors.push({ id, error: 'Thinking style tidak ditemukan' });
          continue;
        }

        await thinkingStyle.update(updateData);
        results.push({ id, status: 'success' });
      } catch (err: any) {
        errors.push({ id: update.id, error: err.message });
      }
    }

    res.status(200).json({
      message: 'Bulk update selesai',
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: updates.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });
  } catch (err: any) {
    console.error('bulkUpdateThinkingStyles error:', err);
    res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
  }
};