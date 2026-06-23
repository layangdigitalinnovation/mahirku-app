import { Request, Response } from 'express';
import DiscQuestion from '../models/DiscQuestion';
import DiscOption from '../models/DiscOption';
import DiscResult from '../models/DiscResult';
import User from '../models/User';
import Role from '../models/Role';
import { AuthRequest } from '../middlewares/authMiddleware';
import { GroqService } from '../services/groqService';

export const getQuestions = async (req: Request, res: Response) => {
    try {
        const questions = await DiscQuestion.findAll({
            include: [
                {
                    model: DiscOption,
                    as: 'options',
                    attributes: ['id', 'text', 'value'],
                },
            ],
            order: [
                ['question_order', 'ASC'],
                [{ model: DiscOption, as: 'options' }, 'id', 'ASC'],
            ],
        });

        res.json(questions);
    } catch (error) {
        console.error('Error fetching DISC questions:', error);
        res.status(500).json({ message: 'Failed to fetch questions' });
    }
};

export const submitTest = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.userId;
        const { answers } = req.body; // Array of selected option IDs or values

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (!answers || !Array.isArray(answers)) {
            res.status(400).json({ message: 'Invalid answers format' });
            return;
        }

        // Calculate scores
        let dScore = 0;
        let iScore = 0;
        let sScore = 0;
        let cScore = 0;

        // Fetch all options to verify and calculate
        // Assuming answers is an array of selected option IDs
        const selectedOptions = await DiscOption.findAll({
            where: {
                id: answers
            }
        });

        selectedOptions.forEach(option => {
            switch (option.value) {
                case 'D': dScore++; break;
                case 'I': iScore++; break;
                case 'S': sScore++; break;
                case 'C': cScore++; break;
            }
        });

        // Determine dominant type
        const scores = { D: dScore, I: iScore, S: sScore, C: cScore };
        const dominantType = Object.keys(scores).reduce((a, b) => scores[a as keyof typeof scores] > scores[b as keyof typeof scores] ? a : b);

        // Save result
        const result = await DiscResult.create({
            user_id: userId,
            d_score: dScore,
            i_score: iScore,
            s_score: sScore,
            c_score: cScore,
            dominant_type: dominantType,
            ai_report_status: 'processing',
        } as any);

        const groqService = new GroqService();
        void groqService.generateDiscReport({
            dominant_type: dominantType,
            d_score: dScore,
            i_score: iScore,
            s_score: sScore,
            c_score: cScore,
        }).then(async (report) => {
            await DiscResult.update(
                { ai_report: report, ai_report_status: 'completed', ai_report_error: null, ai_report_generated_at: new Date() } as any,
                { where: { id: result.id, user_id: userId } }
            );
        }).catch(async (e: any) => {
            await DiscResult.update(
                { ai_report_status: 'failed', ai_report_error: e?.message || 'AI generation failed' } as any,
                { where: { id: result.id, user_id: userId } }
            );
        });

        // Logic Mitra: (Auto-upgrade role to affiliator has been removed to preserve user UX)
        // const user = await User.findByPk(userId);
        // ...

        res.status(201).json({
            message: 'Test submitted successfully',
            result: {
                id: result.id,
                dScore,
                iScore,
                sScore,
                cScore,
                dominantType
            }
        });

    } catch (error) {
        console.error('Error submitting DISC test:', error);
        res.status(500).json({ message: 'Failed to submit test' });
    }
};

export const getDiscAiReport = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.userId;
        const { resultId } = req.params as any;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        const result = await DiscResult.findOne({ where: { id: resultId, user_id: userId } });
        if (!result) {
            res.status(404).json({ message: 'Hasil tes tidak ditemukan' });
            return;
        }

        res.status(200).json({
            message: 'OK',
            data: {
                status: (result as any).ai_report_status || 'pending',
                report: (result as any).ai_report || null,
                error: (result as any).ai_report_error || null,
                generatedAt: (result as any).ai_report_generated_at || null,
            },
        });
    } catch (err: any) {
        console.error('getDiscAiReport error:', err);
        res.status(500).json({ message: 'Terjadi kesalahan', error: err.message });
    }
};
