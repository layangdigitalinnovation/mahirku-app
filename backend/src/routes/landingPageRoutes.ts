import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import {
  getAllLandingPages,
  getLandingPageById,
  createLandingPage,
  updateLandingPage,
  deleteLandingPage,
  duplicateLandingPage,
  getPublicLandingPage,
  handlePublicCheckout,
  getLandingPageSubmissions,
  uploadLandingPageMedia,
} from '../controllers/landingPageController';
import { authMiddleware } from '../middlewares/authMiddleware';

const lpUploadDir = path.join(__dirname, '../../uploads/landing-pages');
if (!fs.existsSync(lpUploadDir)) {
  fs.mkdirSync(lpUploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, lpUploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `lp-${unique}${ext}`);
  },
});

const uploadLpMedia = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/svg+xml',
      'video/mp4',
      'video/webm',
      'video/quicktime',
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, WEBP, GIF, SVG, atau MP4/WEBM.'));
    }
  },
});

const handleUploadMiddleware = (req: Request, res: Response, next: NextFunction) => {
  uploadLpMedia.single('file')(req, res, (err: any) => {
    if (err) {
      res.status(400).json({ message: err.message || 'Gagal mengupload file.' });
      return;
    }
    next();
  });
};

const router = Router();

// ========================
// Public Routes (Untuk Pengunjung Iklan / LP)
// ========================
router.get('/public/:slug', getPublicLandingPage);
router.post('/public/:slug/checkout', handlePublicCheckout);

// ========================
// Admin Protected Routes (Web Builder & Management)
// ========================
router.post('/upload', authMiddleware, handleUploadMiddleware, uploadLandingPageMedia);
router.get('/', authMiddleware, getAllLandingPages);
router.get('/:id', authMiddleware, getLandingPageById);
router.post('/', authMiddleware, createLandingPage);
router.put('/:id', authMiddleware, updateLandingPage);
router.delete('/:id', authMiddleware, deleteLandingPage);
router.post('/:id/duplicate', authMiddleware, duplicateLandingPage);
router.get('/:id/submissions', authMiddleware, getLandingPageSubmissions);

export default router;

