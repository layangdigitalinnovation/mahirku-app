import express from 'express';
import {
    getAllQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
} from '../../controllers/admin/discAdminController';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = express.Router();

// Middleware to check super admin role
const checkSuperAdmin = (req: any, res: express.Response, next: express.NextFunction) => {
    if (req.user?.roleId !== 1) { // Assuming roleId 1 is super admin
        res.status(403).json({ message: 'Access denied. Super admin only.' });
        return;
    }
    next();
};

// All routes protected by authentication and super admin check
router.use(authMiddleware);
router.use(checkSuperAdmin);

router.get('/questions', getAllQuestions);
router.post('/questions', createQuestion);
router.put('/questions/:id', updateQuestion);
router.delete('/questions/:id', deleteQuestion);
router.put('/questions/reorder', reorderQuestions);

export default router;
