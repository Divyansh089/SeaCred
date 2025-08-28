import { Router } from 'express';
import { registerHandler, loginHandler } from '../controllers/auth.controller';

const router = Router();

// POST /api/v1/auth/register
router.post('/register', registerHandler);

// POST /api/v1/auth/login
router.post('/login', loginHandler);

export default router;