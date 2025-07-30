// routes/packageRoutes.ts
import { Router } from 'express';
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from '../controllers/packageController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   GET /api/packages
 * @desc    Ambil semua paket yang tersedia
 * @access  Public
 */
router.get('/', getAllPackages);

/**
 * @route   GET /api/packages/:id
 * @desc    Ambil detail paket berdasarkan ID
 * @access  Public
 */
router.get('/:id', getPackageById);

/**
 * @route   POST /api/packages
 * @desc    Tambah paket baru
 * @access  Protected (Admin Only, bisa tambahkan middleware role jika perlu)
 */
router.post('/', authMiddleware, createPackage);

/**
 * @route   PUT /api/packages/:id
 * @desc    Update data paket
 * @access  Protected (Admin Only)
 */
router.put('/:id', authMiddleware, updatePackage);

/**
 * @route   DELETE /api/packages/:id
 * @desc    Hapus paket
 * @access  Protected (Admin Only)
 */
router.delete('/:id', authMiddleware, deletePackage);

export default router;
