import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import path from 'path';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import thinkingStyleRoutes from './routes/thinkingStyleRoutes';
import dashboardRoutes from './routes/dashboardRoutes';
import paymentRoutes from './routes/paymentRoutes';
import packageRoutes from './routes/packageRoutes';
import invoiceRoutes from './routes/invoiceRoutes';
import voucherRoutes from './routes/voucherRoutes';
import affiliateRoutes from './routes/affiliateRoutes';
import withdrawRoutes from './routes/withdrawRoutes';
import tokenRoutes from './routes/tokenRoutes';
import adminThinkingStyleRoutes from './routes/adminThinkingStyleRoutes';
import biometricRoutes from './routes/biometricRoutes';
import discRoutes from './routes/discRoutes';
import discAdminRoutes from './routes/admin/discAdminRoutes';
import certificateRoutes from './routes/certificateRoutes';

const app = express();

// Middleware
app.use(cors({
    origin: true, // Allow all origins for now, or specify your frontend URL
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/thinking-style', thinkingStyleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/affiliate', affiliateRoutes);
app.use('/api/withdraw', withdrawRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/admin/thinking-style', adminThinkingStyleRoutes);
app.use('/api/biometrics', biometricRoutes);
app.use('/api/disc', discRoutes);
app.use('/api/admin/disc', discAdminRoutes);
app.use('/api/certificates', certificateRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

export default app;
