import express from 'express';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import tokenRoutes from './routes/tokenRoutes';
import paymentRoutes from './routes/paymentRoutes';
import packageRoutes from './routes/packageRoutes';
import voucherRoutes from './routes/voucherRoutes';
import thinkingStyleRoutes from './routes/thinkingStyleRoutes';
import affiliateRoutes from './routes/affiliateRoutes';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/token', tokenRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/package', packageRoutes);
app.use('/api/voucher', voucherRoutes);
app.use('/api/thinking-style', thinkingStyleRoutes);
app.use('/api/affiliate', affiliateRoutes);


export default app;