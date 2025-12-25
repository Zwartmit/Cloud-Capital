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

// All routes require authentication
router.use(authenticateToken);

// GET routes (open to all authenticated users, controller handles permissions)
router.get('/', controller.getBankAccounts);

// Write routes require ADMIN or SUBADMIN role
router.use(requireAdminOrSubadmin);

// CRUD routes for writing
router.post('/', controller.createBankAccount);
router.put('/:id', controller.updateBankAccount);
router.delete('/:id', controller.deleteBankAccount);

export default router;
