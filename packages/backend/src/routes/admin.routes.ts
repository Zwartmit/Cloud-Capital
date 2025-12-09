import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/users
router.get('/users', adminController.getUsers);

// GET /api/admin/users/search
router.get('/users/search', adminController.searchUsers);

// GET /api/admin/users/:id
router.get('/users/:id', adminController.getUserById);

// PUT /api/admin/users/:id/balance
router.put('/users/:id/balance', adminController.updateUserBalance);

// GET /api/admin/users/:id/referrals
router.get('/users/:id/referrals', adminController.getUserReferrals);

// GET /api/admin/tasks
router.get('/tasks', adminController.getTasks);

// GET /api/admin/tasks/:id
router.get('/tasks/:id', adminController.getTaskById);

// PUT /api/admin/tasks/:id/approve
router.put('/tasks/:id/approve', adminController.approveTask);

// PUT /api/admin/tasks/:id/reject
router.put('/tasks/:id/reject', adminController.rejectTask);

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminController.deleteUser);

// PUT /api/admin/users/:id/reset-password
router.put('/users/:id/reset-password', adminController.resetUserPassword);

// GET /api/admin/stats
router.get('/stats', adminController.getStats);

export default router;
