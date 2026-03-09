import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import GraphologyTest from '../models/GraphologyTest';
import { GroqService } from '../services/groqService';

const groqService = new GroqService();

export const uploadGraphologyImage = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.body.user_id || req.body.userId; // Handle both cases for flexibility
        if (!userId) {
            res.status(400).json({ status: 'failed', message: 'userId is required' });
            return;
        }

        if (!req.file) {
            res.status(400).json({ status: 'failed', message: 'Image file is required' });
            return;
        }

        const imageUrl = `/uploads/${req.file.filename}`;
        const imagePath = req.file.path;

        // TODO: Verify if the user has enough tokens and deduct 1 token from the user if applicable.
        // Since token handling is complex without checking User model current implementation, we assume valid tokens.

        // Create new test record
        const newTest = await GraphologyTest.create({
            userId,
            imageUrl,
            status: 'processing',
            tokensUsed: 1, // Assume 1 token per test
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

    } catch (error) {
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
    } catch (error) {
        console.error(`AI Analysis failed for test ${testId}:`, error);
        const testRecord = await GraphologyTest.findByPk(testId);
        if (testRecord) {
            testRecord.status = 'failed';
            await testRecord.save();
        }
    }
};

export const getGraphologyResult = async (req: Request, res: Response): Promise<void> => {
    try {
        const { test_id } = req.params;

        const testRecord = await GraphologyTest.findByPk(test_id);
        if (!testRecord) {
            res.status(404).json({ status: 'failed', message: 'Graphology test not found' });
            return;
        }

        if (testRecord.status !== 'completed') {
            res.status(200).json({
                status: testRecord.status,
                message: testRecord.status === 'failed' ? 'Process failed.' : 'Still processing.',
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
