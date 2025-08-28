import { Router } from 'express';
import creditRoutes from './credit.route';
import distributionRoutes from './distribution.route';
import dashboardRoutes from './dashboard.route'; // <-- Import new route
import authRoutes from './auth.route';
import projectRoutes from './project.route';
import userRoutes from './user.route';
import verificationRoutes from './verification.route';


const router = Router();

router.use('/projects', projectRoutes);
router.use('/credits', creditRoutes);
router.use('/distributions', distributionRoutes);
router.use('/dashboard', dashboardRoutes); // <-- Add new route
router.use('/auth', authRoutes)
router.use('/users', userRoutes);
router.use('/verifications', verificationRoutes);
export default router;