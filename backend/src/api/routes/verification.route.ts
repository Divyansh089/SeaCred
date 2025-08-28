import { Router } from 'express';
import { getStatsHandler, getProjectsHandler } from '../controllers/verification.controller';
import { authMiddleware, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware, authorize('admin', 'officer'));

// GET /api/v1/verifications/stats
router.get('/stats', getStatsHandler);

// GET /api/v1/verifications/projects
router.get('/projects', getProjectsHandler);

export default router;