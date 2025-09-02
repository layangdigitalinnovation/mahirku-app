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

app.use(cors());
app.use(express.json());
app.use(cookieParser());

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


export default app;