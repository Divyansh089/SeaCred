import { Router } from 'express';
import { getDashboardDataHandler } from '../controllers/dashboard.controller';
// import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/v1/dashboard
// Remember to protect this route with authentication middleware
router.get('/', /* authMiddleware, */ getDashboardDataHandler);

export default router;