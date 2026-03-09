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
import mitraRoutes from './routes/mitraRoutes';
import graphologyRoutes from './routes/graphology.routes';

const app = express();

// Middleware
// Middleware
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    console.log(`[HEADERS] Origin: ${req.headers.origin || 'No Origin'}`);
    next();
});

app.use(cors({
    origin: true, // Reflects the request origin, allowing any origin to access
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With']
}));

// Handle preflight requests explicitly
app.options(/.*/, cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept', 'X-Requested-With']
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
app.use('/api/mitra', mitraRoutes);
app.use('/api/graphology', graphologyRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

export default app;
