import express from 'express';
import { authenticateToken } from '../middleware/auth.middleware.js';
import * as controller from '../controllers/collaborator-bank.controller.js';

const router = express.Router();

// Middleware to check if user is ADMIN or SUBADMIN
const requireAdminOrSubadmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUBADMIN' && req.user.role !== 'SUPERADMIN') {
        return res.status(403).json({ error: 'Acceso denegado. Solo administradores y colaboradores.' });
    }
    next();
};

// All routes require authentication and ADMIN or SUBADMIN role
router.use(authenticateToken);
router.use(requireAdminOrSubadmin);

// CRUD routes
router.post('/', controller.createBankAccount);
router.get('/', controller.getBankAccounts);
router.put('/:id', controller.updateBankAccount);
router.delete('/:id', controller.deleteBankAccount);

export default router;
