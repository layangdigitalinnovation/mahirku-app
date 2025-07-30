import { Request, Response } from 'express';
import Voucher from '../models/Voucher';

export const createVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code, type, value, isActive } = req.body;

    const existing = await Voucher.findOne({ where: { code } });
    if (existing) {
      res.status(400).json({ message: 'Kode voucher sudah digunakan.' });
      return;
    }

    const voucher = await Voucher.create({ code, type, value, isActive });
    res.status(201).json({ message: 'Voucher berhasil dibuat.', data: voucher });
  } catch (err: any) {
    console.error('CreateVoucher error:', err);
    res.status(500).json({ message: 'Gagal membuat voucher.', error: err.message });
  }
};

export const getAllVouchers = async (_req: Request, res: Response): Promise<void> => {
  try {
    const vouchers = await Voucher.findAll({ order: [['createdAt', 'DESC']] });
    res.status(200).json({ data: vouchers });
  } catch (err: any) {
    console.error('GetAllVouchers error:', err);
    res.status(500).json({ message: 'Gagal mengambil daftar voucher.', error: err.message });
  }
};

export const validateVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;

    const voucher = await Voucher.findOne({ where: { code, isActive: true } });
    if (!voucher) {
      res.status(404).json({ message: 'Voucher tidak ditemukan atau tidak aktif.' });
      return;
    }

    res.status(200).json({ message: 'Voucher valid.', data: voucher });
  } catch (err: any) {
    console.error('ValidateVoucher error:', err);
    res.status(500).json({ message: 'Gagal validasi voucher.', error: err.message });
  }
};

export const deleteVoucher = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const voucher = await Voucher.findByPk(id);

    if (!voucher) {
      res.status(404).json({ message: 'Voucher tidak ditemukan.' });
      return;
    }

    await voucher.destroy();
    res.status(200).json({ message: 'Voucher berhasil dihapus.' });
  } catch (err: any) {
    console.error('DeleteVoucher error:', err);
    res.status(500).json({ message: 'Gagal menghapus voucher.', error: err.message });
  }
};
