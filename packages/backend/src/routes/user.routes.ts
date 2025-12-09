import { Router } from 'express';
import * as userController from '../controllers/user.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { upload } from '../config/multer.js';

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

// GET /api/user/balance-history
router.get('/balance-history', userController.getBalanceHistory);

// PUT /api/user/change-password
router.put('/change-password', userController.changePassword);

// GET /api/user/referrals
router.get('/referrals', userController.getReferrals);

// GET /api/user/referral-commissions
router.get('/referral-commissions', userController.getReferralCommissions);

// Enhanced deposit/withdrawal routes
// POST /api/user/deposit/auto
router.post('/deposit/auto', upload.single('proof'), userController.requestAutoDeposit);

// POST /api/user/deposit/manual
router.post('/deposit/manual', userController.requestManualDepositOrder);

// POST /api/user/withdraw/enhanced
router.post('/withdraw/enhanced', userController.requestWithdrawalEnhanced);

// GET /api/user/collaborators
router.get('/collaborators', userController.getCollaborators);

export default router;
