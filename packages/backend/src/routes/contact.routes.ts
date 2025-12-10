import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';

const router = Router();

// GET /api/contact - Public endpoint, no authentication required
router.get('/', userController.getPublicContactInfo);

export default router;
