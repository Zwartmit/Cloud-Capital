import { Router } from 'express';
import * as btcPoolController from '../controllers/btc-address-pool.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/role.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Super Admin only routes
router.post('/upload', requireSuperAdmin, btcPoolController.bulkUpload);
router.patch('/:id/release', requireSuperAdmin, btcPoolController.releaseAddress);
router.delete('/:id', requireSuperAdmin, btcPoolController.deleteAddress);

// Admin routes (SUBADMIN and SUPERADMIN)
router.get('/stats', requireAdmin, btcPoolController.getStats);
router.get('/addresses', requireAdmin, btcPoolController.getAddresses);

export default router;
