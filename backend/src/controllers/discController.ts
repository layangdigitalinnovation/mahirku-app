import { Request, Response } from 'express';
import DiscQuestion from '../models/DiscQuestion';
import DiscOption from '../models/DiscOption';
import DiscResult from '../models/DiscResult';
import User from '../models/User';
import Role from '../models/Role';
import { AuthRequest } from '../middlewares/authMiddleware';

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
        });

        // Logic Mitra: Jika user punya parent (Mitra) dan masih role 'user', upgrade ke 'affiliator'
        const user = await User.findByPk(userId);
        if (user && user.parentId) {
            const userRole = await Role.findOne({ where: { name: 'user' } });
            const affiliatorRole = await Role.findOne({ where: { name: 'affiliator' } });
            
            if (userRole && affiliatorRole && user.roleId === userRole.id) {
                user.roleId = affiliatorRole.id;
                await user.save();
                console.log(`User ${user.id} upgraded to affiliator (parent: ${user.parentId})`);
            }
        }

        res.status(201).json({
            message: 'Test submitted successfully',
            result: {
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
