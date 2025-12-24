import { Router } from 'express';
import * as blockchainController from '../controllers/blockchain.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);
router.use(requireAdmin); // Only admins can verify blockchain data

// GET /api/blockchain/address/:address
router.get('/address/:address', blockchainController.getAddressInfo);

// GET /api/blockchain/transaction/:txid
router.get('/transaction/:txid', blockchainController.getTransactionDetails);

// POST /api/blockchain/verify-deposit
router.post('/verify-deposit', blockchainController.verifyDeposit);

// GET /api/blockchain/explorer-link/:address
router.get('/explorer-link/:address', blockchainController.getExplorerLink);

export default router;
