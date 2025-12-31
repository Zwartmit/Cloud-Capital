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

// Enhanced deposit - Step 1: Reserve BTC address (NO task created yet)
router.get('/deposit/reserved-address', userController.getReservedAddress);
router.post('/deposit/reserve-address', userController.reserveBtcAddress);

// Enhanced deposit - Step 2: Submit with proof (creates task with reserved address)
router.post('/deposit/auto', upload.single('proof'), userController.requestAutoDeposit);

// Release reserved address (when user closes modal)
router.post('/deposit/release-address', userController.releaseReservedAddress);
router.put('/deposit/update-address-amount/:addressId', userController.updateReservedAddressAmount);

// POST /api/user/deposit/manual
router.post('/deposit/manual', userController.requestManualDepositOrder);

// POST /api/user/withdraw/enhanced
// POST /api/user/withdraw/enhanced
router.post('/withdraw/enhanced', userController.requestWithdrawalEnhanced);

// POST /api/user/withdraw/capital (Early Liquidation)
router.post('/withdraw/capital', userController.requestEarlyLiquidation);

// GET /api/user/collaborators
router.get('/collaborators', userController.getCollaborators);

// GET /api/user/tasks
router.get('/tasks', userController.getTasks);

// PUT /api/user/investment-plan
router.put('/investment-plan', userController.changeInvestmentPlan);

// GET /api/user/recent-activity
router.get('/recent-activity', userController.getRecentActivity);

// FASE 1: New routes for cycle management
// GET /api/user/cycle-progress
router.get('/cycle-progress', userController.getCycleProgress);

// GET /api/user/contract-status
router.get('/contract-status', userController.getContractStatus);

// Passive Income Routes
router.post('/welcome-modal-seen', userController.markWelcomeModalSeen);
router.get('/passive-income-info', userController.getPassiveIncomeInfo);

export default router;

