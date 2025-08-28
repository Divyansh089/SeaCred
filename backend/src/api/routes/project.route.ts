import { Router } from 'express';
import {
  createProjectHandler,
  getProjectsHandler,
  getProjectHandler,
  updateProjectHandler,
  deleteProjectHandler,
  assignProjectHandler,
  submitReportHandler,
} from '../controllers/project.controller';
import { authMiddleware, authorize } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

router.use(authMiddleware); // Apply authentication to all project routes

router.route('/')
  .post(authorize('admin', 'project_authority'), createProjectHandler) // Only admins and authorities can create
  .get(getProjectsHandler); // All authenticated users can view projects

router.route('/:id')
  .get(getProjectHandler) // All authenticated users can view a single project
  .patch(authorize('admin', 'project_authority'), updateProjectHandler) // Only admins and authorities can update
  .delete(authorize('admin', 'project_authority'), deleteProjectHandler); // Only admins and authorities can delete

const projectUploads = upload.fields([
  { name: 'documents', maxCount: 10 },
  { name: 'landImages', maxCount: 10 }
]);

router.route('/')
  .post(
    authorize('admin', 'project_authority'), 
    projectUploads, // Use the upload middleware here
    createProjectHandler
  )
  .get(getProjectsHandler);
// Assign project to officer
// PATCH /api/v1/projects/:id/assign
router.patch('/:id/assign', authMiddleware, authorize('officer'), assignProjectHandler);

// Submit verification report
// POST /api/v1/projects/:id/report
router.post('/:id/report', authMiddleware, authorize('officer'), submitReportHandler);

export default router;