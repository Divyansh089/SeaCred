import { Router } from 'express';
import {
  // ... other handlers
  getUsersHandler,
  createUserHandler,
  updateUserHandler,
  deleteUserHandler,
  getUserStatsHandler,
} from '../controllers/user.controller';
import { authMiddleware, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authMiddleware);

// Routes for the current user's profile
// ... /me and /me/change-password routes

// --- ADMIN ONLY ROUTES ---
router.use(authorize('admin')); // Apply admin authorization to all routes below

// GET /api/v1/users/stats - Get user counts
router.get('/stats', getUserStatsHandler);

// GET /api/v1/users/ - List all users
// POST /api/v1/users/ - Create a new user
router.route('/')
  .get(getUsersHandler)
  .post(createUserHandler);

// PATCH /api/v1/users/:id - Update a user
// DELETE /api/v1/users/:id - Delete a user
router.route('/:id')
  .patch(updateUserHandler)
  .delete(deleteUserHandler);

export default router;