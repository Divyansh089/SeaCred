import { Router } from 'express';
import { getCreditStatsHandler } from '../controllers/credit.controller';
// import { authMiddleware } from '../middlewares/auth.middleware'; // Assumed to exist

const router = Router();

// GET /api/v1/credits/stats
// You need an authMiddleware to protect this route and identify the user
router.get('/stats', /* authMiddleware, */ getCreditStatsHandler);

export default router;