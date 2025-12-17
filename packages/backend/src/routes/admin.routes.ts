import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import * as bankController from '../controllers/bank.controller.js';
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

// PUT /api/admin/tasks/:id/verify-collaborator
router.put('/tasks/:id/verify-collaborator', adminController.toggleCollaboratorVerification);

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminController.deleteUser);

// PUT /api/admin/users/:id/reset-password
router.put('/users/:id/reset-password', adminController.resetUserPassword);

// GET /api/admin/stats
router.get('/stats', adminController.getStats);

// GET /api/admin/recent-activity
router.get('/recent-activity', adminController.getRecentActivity);

// GET /api/admin/staff
router.get('/staff', adminController.getStaff);

// POST /api/admin/staff
router.post('/staff', adminController.createCollaborator);

// PUT /api/admin/staff/:id/config
router.put('/staff/:id/config', adminController.updateCollaboratorConfig);

// Bank Management Routes
// GET /api/admin/banks
router.get('/banks', bankController.getBanks);

// POST /api/admin/banks
router.post('/banks', bankController.createBank);

// PUT /api/admin/banks/:id
router.put('/banks/:id', bankController.updateBank);

// DELETE /api/admin/banks/:id
router.delete('/banks/:id', bankController.deleteBank);

export default router;
