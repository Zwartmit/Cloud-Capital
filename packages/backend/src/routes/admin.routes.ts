import { Router } from 'express';
import * as adminController from '../controllers/admin.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';
import { upload } from '../config/multer.js';

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
router.put('/tasks/:id/approve', upload.single('proof'), adminController.approveTask);

// PUT /api/admin/tasks/:id/reject
router.put('/tasks/:id/reject', adminController.rejectTask);

// PUT /api/admin/tasks/:id/verify-collaborator
router.put('/tasks/:id/verify-collaborator', adminController.toggleCollaboratorVerification);

// DELETE /api/admin/users/:id
router.delete('/users/:id', adminController.deleteUser);

// PUT /api/admin/users/:id/reset-password
router.put('/users/:id/reset-password', adminController.resetUserPassword);

// PUT /api/admin/users/:id/unblock
router.put('/users/:id/unblock', adminController.unblockUser);

// PUT /api/admin/users/:id/block
router.put('/users/:id/block', adminController.blockUser);

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

// FASE 1: New routes for commission management
// POST /api/admin/charge-commissions
router.post('/charge-commissions', adminController.chargeAllCommissions);

// POST /api/admin/charge-commission/:userId
router.post('/charge-commission/:userId', adminController.chargeUserCommission);

// System Configuration routes
// GET /api/admin/system-config/:key
router.get('/system-config/:key', adminController.getSystemConfig);

// PUT /api/admin/system-config/:key
router.put('/system-config/:key', adminController.updateSystemConfig);

export default router;
