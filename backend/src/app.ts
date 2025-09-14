import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { referralMiddleware } from './middlewares/referralMiddleware';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import tokenRoutes from './routes/tokenRoutes';
import paymentRoutes from './routes/paymentRoutes';
import packageRoutes from './routes/packageRoutes';
import voucherRoutes from './routes/voucherRoutes';
import thinkingStyleRoutes from './routes/thinkingStyleRoutes';
import adminThinkingStyleRoutes from './routes/adminThinkingStyleRoutes';
import affiliateRoutes from './routes/affiliateRoutes';
import withdrawRoutes from './routes/withdrawRoutes';

const app = express();

app.use(cors({
  origin: true, // atau specify domain tertentu seperti 'http://localhost:3000'
  credentials: true // Penting untuk mengizinkan cookies
}));
app.use(express.json());
app.use(cookieParser());

// Global request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Headers:', req.headers);
  next();
});

// Middleware untuk menangani referral links
app.use(referralMiddleware);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/package', packageRoutes);
app.use('/api/voucher', voucherRoutes);
app.use('/api/thinking-style', thinkingStyleRoutes);
app.use('/api/admin/thinking-styles', adminThinkingStyleRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/withdraw', withdrawRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  console.error('Error stack:', err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

export default app;