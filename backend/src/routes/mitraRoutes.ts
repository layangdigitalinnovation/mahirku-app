import { Router } from 'express';
import { 
  addMember, 
  getMembers, 
  getDashboardStats 
} from '../controllers/mitraController';
import { authMiddleware } from '../middlewares/authMiddleware';
import { isMitra } from '../middlewares/roleMiddleware';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Apply role middleware to ensure only 'mitra' can access
router.use(isMitra); 

router.post('/members', addMember);
router.get('/members', getMembers);
router.get('/dashboard', getDashboardStats);

export default router;
