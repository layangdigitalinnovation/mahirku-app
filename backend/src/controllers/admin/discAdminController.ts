import { Request, Response } from 'express';
import DiscQuestion from '../../models/DiscQuestion';
import DiscOption from '../../models/DiscOption';
import { AuthRequest } from '../../middlewares/authMiddleware';

// Get all questions with pagination
export const getAllQuestions = async (req: AuthRequest, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = (page - 1) * limit;

        const { count, rows: questions } = await DiscQuestion.findAndCountAll({
            include: [
                {
                    model: DiscOption,
                    as: 'options',
                    attributes: ['id', 'text', 'value'],
                },
            ],
            order: [
                ['question_order', 'ASC'],
                [{ model: DiscOption, as: 'options' }, 'value', 'ASC'],
            ],
            limit,
            offset,
        });

        res.json({
            questions,
            pagination: {
                total: count,
                page,
                limit,
                totalPages: Math.ceil(count / limit),
            },
        });
    } catch (error) {
        console.error('Error fetching admin DISC questions:', error);
        res.status(500).json({ message: 'Failed to fetch questions' });
    }
};

// Create new question with 4 options
export const createQuestion = async (req: AuthRequest, res: Response) => {
    try {
        const { question_order, options } = req.body;

        // Validate options
        if (!options || !Array.isArray(options) || options.length !== 4) {
            res.status(400).json({ message: 'Each question must have exactly 4 options' });
            return;
        }

        // Check if all DISC types are present
        const values = options.map((opt: any) => opt.value);
        const requiredValues = ['D', 'I', 'S', 'C'];
        const hasAllTypes = requiredValues.every(val => values.includes(val));

        if (!hasAllTypes) {
            res.status(400).json({ message: 'Options must include one each of D, I, S, C' });
            return;
        }

        // Check for duplicate order
        const existingQuestion = await DiscQuestion.findOne({ where: { question_order } });
        if (existingQuestion) {
            res.status(400).json({ message: 'Question order already exists' });
            return;
        }

        // Create question
        const question = await DiscQuestion.create({ question_order });

        // Create options
        const optionsData = options.map((opt: any) => ({
            question_id: question.id,
            text: opt.text,
            value: opt.value,
        }));

        await DiscOption.bulkCreate(optionsData);

        // Fetch created question with options
        const createdQuestion = await DiscQuestion.findByPk(question.id, {
            include: [{ model: DiscOption, as: 'options' }],
        });

        res.status(201).json({
            message: 'Question created successfully',
            question: createdQuestion,
        });
    } catch (error) {
        console.error('Error creating DISC question:', error);
        res.status(500).json({ message: 'Failed to create question' });
    }
};

// Update question
export const updateQuestion = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const { question_order, options } = req.body;

        const question = await DiscQuestion.findByPk(id);
        if (!question) {
            res.status(404).json({ message: 'Question not found' });
            return;
        }

        // Validate options if provided
        if (options) {
            if (!Array.isArray(options) || options.length !== 4) {
                res.status(400).json({ message: 'Each question must have exactly 4 options' });
                return;
            }

            const values = options.map((opt: any) => opt.value);
            const requiredValues = ['D', 'I', 'S', 'C'];
            const hasAllTypes = requiredValues.every(val => values.includes(val));

            if (!hasAllTypes) {
                res.status(400).json({ message: 'Options must include one each of D, I, S, C' });
                return;
            }
        }

        // Update question order if provided
        if (question_order !== undefined) {
            // Check if new order conflicts with existing
            const existingQuestion = await DiscQuestion.findOne({
                where: { question_order, id: { [require('sequelize').Op.ne]: id } },
            });

            if (existingQuestion) {
                res.status(400).json({ message: 'Question order already exists' });
                return;
            }

            await question.update({ question_order });
        }

        // Update options if provided
        if (options) {
            // Delete old options and create new ones
            await DiscOption.destroy({ where: { question_id: id } });

            const optionsData = options.map((opt: any) => ({
                question_id: parseInt(id),
                text: opt.text,
                value: opt.value,
            }));

            await DiscOption.bulkCreate(optionsData);
        }

        // Fetch updated question
        const updatedQuestion = await DiscQuestion.findByPk(id, {
            include: [{ model: DiscOption, as: 'options' }],
        });

        res.json({
            message: 'Question updated successfully',
            question: updatedQuestion,
        });
    } catch (error) {
        console.error('Error updating DISC question:', error);
        res.status(500).json({ message: 'Failed to update question' });
    }
};

// Delete question
export const deleteQuestion = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;

        const question = await DiscQuestion.findByPk(id);
        if (!question) {
            res.status(404).json({ message: 'Question not found' });
            return;
        }

        // Delete question (options will be cascade deleted)
        await question.destroy();

        res.json({ message: 'Question deleted successfully' });
    } catch (error) {
        console.error('Error deleting DISC question:', error);
        res.status(500).json({ message: 'Failed to delete question' });
    }
};

// Reorder questions
export const reorderQuestions = async (req: AuthRequest, res: Response) => {
    try {
        const { orders } = req.body; // Array of { id, question_order }

        if (!orders || !Array.isArray(orders)) {
            res.status(400).json({ message: 'Invalid orders format' });
            return;
        }

        // Update each question's order
        for (const item of orders) {
            await DiscQuestion.update(
                { question_order: item.question_order },
                { where: { id: item.id } }
            );
        }

        res.json({ message: 'Questions reordered successfully' });
    } catch (error) {
        console.error('Error reordering DISC questions:', error);
        res.status(500).json({ message: 'Failed to reorder questions' });
    }
};
