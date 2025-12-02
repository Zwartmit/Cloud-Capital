import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// GET /api/user/profile
router.get('/profile', userController.getProfile);

// PUT /api/user/profile
router.put('/profile', userController.updateProfile);

// GET /api/user/balance
router.get('/balance', userController.getBalance);

// GET /api/user/transactions
router.get('/transactions', userController.getTransactions);

// POST /api/user/deposit
router.post('/deposit', userController.requestDeposit);

// POST /api/user/withdraw
router.post('/withdraw', userController.requestWithdrawal);

// POST /api/user/reinvest
router.post('/reinvest', userController.reinvest);

export default router;
