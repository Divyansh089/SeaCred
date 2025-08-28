import { Router } from 'express';
import { getDistributionsHandler } from '../controllers/distribution.controller';
// import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// GET /api/v1/distributions
router.get('/', /* authMiddleware, */ getDistributionsHandler);

export default router;