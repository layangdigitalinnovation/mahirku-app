// controllers/packageController.ts
import { Request, Response } from 'express';
import Package from '../models/Package';

export const createPackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description, defaultTokenAmount, price, commissionRate, mitraCommissionRate } = req.body;

    const existing = await Package.findOne({ where: { name } });
    if (existing) {
      res.status(400).json({ message: 'Nama paket sudah digunakan.' });
      return;
    }

    const newPackage = await Package.create({ 
      name, 
      description, 
      defaultTokenAmount, 
      price, 
      commissionRate: commissionRate || 0,
      mitraCommissionRate: mitraCommissionRate || 0
    });
    res.status(201).json({ message: 'Paket berhasil dibuat.', data: newPackage });
  } catch (err: any) {
    console.error('CreatePackage error:', err);
    res.status(500).json({ message: 'Gagal membuat paket.', error: err.message });
  }
};

export const getAllPackages = async (_req: Request, res: Response): Promise<void> => {
  try {
    const packages = await Package.findAll({ order: [['price', 'ASC']] });
    res.status(200).json({ data: packages });
  } catch (err: any) {
    console.error('GetAllPackages error:', err);
    res.status(500).json({ message: 'Gagal mengambil daftar paket.', error: err.message });
  }
};

export const getPackageById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByPk(id);

    if (!pkg) {
      res.status(404).json({ message: 'Paket tidak ditemukan.' });
      return;
    }

    res.status(200).json({ data: pkg });
  } catch (err: any) {
    console.error('GetPackageById error:', err);
    res.status(500).json({ message: 'Gagal mengambil paket.', error: err.message });
  }
};

export const updatePackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, defaultTokenAmount, price, commissionRate, mitraCommissionRate } = req.body;

    const pkg = await Package.findByPk(id);
    if (!pkg) {
      res.status(404).json({ message: 'Paket tidak ditemukan.' });
      return;
    }

    const updateData: any = { name, description, defaultTokenAmount, price };
    if (commissionRate !== undefined) {
      updateData.commissionRate = commissionRate;
    }
    if (mitraCommissionRate !== undefined) {
      updateData.mitraCommissionRate = mitraCommissionRate;
    }

    await pkg.update(updateData);
    res.status(200).json({ message: 'Paket berhasil diperbarui.', data: pkg });
  } catch (err: any) {
    console.error('UpdatePackage error:', err);
    res.status(500).json({ message: 'Gagal memperbarui paket.', error: err.message });
  }
};

export const deletePackage = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const pkg = await Package.findByPk(id);
    if (!pkg) {
      res.status(404).json({ message: 'Paket tidak ditemukan.' });
      return;
    }

    await pkg.destroy();
    res.status(200).json({ message: 'Paket berhasil dihapus.' });
  } catch (err: any) {
    console.error('DeletePackage error:', err);
    res.status(500).json({ message: 'Gagal menghapus paket.', error: err.message });
  }
};
