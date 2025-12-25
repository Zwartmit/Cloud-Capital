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
import collaboratorBankRoutes from './collaborator-bank.routes.js';

const router = Router();

// Mount routes
router.use('/auth', authRoutes);
router.use('/user', userRoutes);
// Specific admin routes that need special permissions or are public to auth users
router.use('/admin/collaborator-banks', collaboratorBankRoutes);
router.use('/admin/btc-pool', btcPoolRoutes); // Also specific, keep before generic if needed? 
router.use('/admin/audit', auditRoutes);      // Keep specific ones before generic

// Generic admin route (catches /admin/* and applies global admin check)
router.use('/admin', adminRoutes);

router.use('/investment-plans', investmentPlanRoutes);
router.use('/profit', profitRoutes);
router.use('/contact', contactRoutes);

router.use('/blockchain', blockchainRoutes);

export default router;

