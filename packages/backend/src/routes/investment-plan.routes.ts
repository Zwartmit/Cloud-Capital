import { Router } from 'express';
import * as investmentPlanController from '../controllers/investment-plan.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// Public routes
router.get('/', investmentPlanController.getPlans);
router.get('/:id', investmentPlanController.getPlanById);

// Protected routes (Admin only)
router.post('/', authenticateToken, requireAdmin, investmentPlanController.createPlan);
router.put('/:id', authenticateToken, requireAdmin, investmentPlanController.updatePlan);
router.delete('/:id', authenticateToken, requireAdmin, investmentPlanController.deletePlan);

export default router;
