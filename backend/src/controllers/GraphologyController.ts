import { Response } from 'express';
import fs from 'fs';
import GraphologyTest from '../models/GraphologyTest';
import { GroqService } from '../services/groqService';
import User from '../models/User';
import { sequelize } from '../config/database';
import { AuthRequest } from '../middlewares/authMiddleware';

const groqService = new GroqService();

export const uploadGraphologyImage = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const authUserId = req.user?.userId;
        if (!authUserId) {
            if (req.file?.path) {
                fs.promises.unlink(req.file.path).catch(() => { });
            }
            res.status(401).json({ status: 'failed', message: 'Unauthorized' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ status: 'failed', message: 'Image file is required' });
            return;
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const imagePath = req.file.path;

        const newTest = await sequelize.transaction(async (t) => {
            const user = await User.findByPk(authUserId, { transaction: t, lock: t.LOCK.UPDATE });
            if (!user) {
                throw Object.assign(new Error('User tidak ditemukan'), { statusCode: 404 });
            }
            if ((user.tokens ?? 0) <= 0) {
                throw Object.assign(new Error('Token tidak mencukupi'), { statusCode: 403 });
            }
            await user.decrement('tokens', { by: 1, transaction: t });

            return GraphologyTest.create(
                {
                    userId: authUserId,
                    imageUrl,
                    status: 'processing',
                    tokensUsed: 1,
                },
                { transaction: t }
            );
        });

        res.status(202).json({
            status: 'processing',
            test_id: newTest.id,
            message: 'Image uploaded and is being processed by AI.',
        });

        // Run AI processing asynchronously
        processGraphologyAI(newTest.id, imagePath).catch(err => {
            console.error('Background AI processing failed:', err);
        });

    } catch (error: any) {
        if (req.file?.path) {
            fs.promises.unlink(req.file.path).catch(() => { });
        }
        const statusCode = error?.statusCode;
        if (statusCode === 403) {
            res.status(403).json({ status: 'failed', message: 'Token tidak mencukupi' });
            return;
        }
        if (statusCode === 404) {
            res.status(404).json({ status: 'failed', message: 'User tidak ditemukan' });
            return;
        }
        console.error('Error uploading graphology image:', error);
        res.status(500).json({ status: 'failed', message: 'Internal server error' });
    }
};

const processGraphologyAI = async (testId: string, imagePath: string) => {
    try {
        const testRecord = await GraphologyTest.findByPk(testId);
        if (!testRecord) return;

        // Send to Groq AI
        const result = await groqService.analyzeGraphology(imagePath);

        // AI gives us extracted_text + personality analysis
        const extractedText = result.extracted_text || '';

        // Delete extracted_text from result so aiResult only contains the rest
        delete result.extracted_text;

        testRecord.status = 'completed';
        testRecord.extractedText = extractedText;
        testRecord.aiResult = result;

        await testRecord.save();
    } catch (error: any) {
        console.error(`AI Analysis failed for test ${testId}:`, error);
        const testRecord = await GraphologyTest.findByPk(testId);
        if (testRecord) {
            testRecord.status = 'failed';
            // Save error message to aiResult for debugging
            testRecord.aiResult = { error: error?.message || 'Unknown AI processing error' };
            await testRecord.save();
        }
    }
};

export const getGraphologyResult = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { test_id } = req.params;
        const authUserId = req.user?.userId;
        if (!authUserId) {
            res.status(401).json({ status: 'failed', message: 'Unauthorized' });
            return;
        }

        const testRecord = await GraphologyTest.findByPk(test_id);
        if (!testRecord) {
            res.status(404).json({ status: 'failed', message: 'Graphology test not found' });
            return;
        }
        if (testRecord.userId !== authUserId) {
            res.status(403).json({ status: 'failed', message: 'Forbidden' });
            return;
        }

        if (testRecord.status !== 'completed') {
            const errorDetails = testRecord.status === 'failed' && testRecord.aiResult?.error
                ? ` Alasan: ${testRecord.aiResult.error}`
                : '';
            res.status(200).json({
                status: testRecord.status,
                message: testRecord.status === 'failed'
                    ? `Proses gagal.${errorDetails}`
                    : 'Sedang diproses.',
            });
            return;
        }

        // Wrap the inner fields
        res.status(200).json({
            status: 'completed',
            ...testRecord.aiResult,
            extracted_text: testRecord.extractedText,
        });
    } catch (error) {
        console.error('Error getting graphology result:', error);
        res.status(500).json({ status: 'failed', message: 'Internal server error' });
    }
};
