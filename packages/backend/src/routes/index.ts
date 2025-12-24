import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import adminRoutes from './admin.routes.js';
import investmentPlanRoutes from './investment-plan.routes.js';
import profitRoutes from './profit.routes.js';
import contactRoutes from './contact.routes.js';
import btcPoolRoutes from './btc-address-pool.routes.js';
import blockchainRoutes from './blockchain.routes.js';
import auditRoutes from './audit.routes.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);
router.use('/investment-plans', investmentPlanRoutes);
router.use('/profit', profitRoutes);
router.use('/contact', contactRoutes);
router.use('/admin/btc-pool', btcPoolRoutes);
router.use('/blockchain', blockchainRoutes);
router.use('/admin/audit', auditRoutes);

export default router;

