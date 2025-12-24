import { Router } from 'express';
import * as auditController from '../controllers/audit.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// GET /api/admin/audit/logs
router.get('/logs', auditController.getAuditLogs);

// GET /api/admin/audit/task/:taskId
router.get('/task/:taskId', auditController.getTaskAuditTrail);

// GET /api/admin/audit/stats
router.get('/stats', auditController.getAuditStats);

export default router;
