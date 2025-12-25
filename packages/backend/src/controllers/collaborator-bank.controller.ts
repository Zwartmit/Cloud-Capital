import { Request, Response } from 'express';
import * as collaboratorBankService from '../services/collaborator-bank.service.js';

/**
 * Create a new bank account
 * POST /api/admin/collaborator-banks
 */
export const createBankAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { bankName, accountType, accountNumber, accountHolder, documentType, documentNumber } = req.body;

        if (!bankName || !accountType || !accountNumber || !accountHolder || !documentType || !documentNumber) {
            res.status(400).json({ error: 'Todos los campos son requeridos' });
            return;
        }

        const account = await collaboratorBankService.createCollaboratorBankAccount(userId, {
            bankName,
            accountType,
            accountNumber,
            accountHolder,
            documentType,
            documentNumber,
        });

        res.status(201).json(account);
    } catch (error: any) {
        console.error('[Create Bank Account Error]:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get bank accounts
 * GET /api/admin/collaborator-banks
 * - SUBADMIN: gets only their accounts
 * - ADMIN: gets all accounts with optional filters
 */
export const getBankAccounts = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const userRole = req.user!.role;
        const { collaboratorId, search } = req.query;

        let accounts;

        if (userRole === 'ADMIN' || userRole === 'SUPERADMIN') {
            // Superadmin/Admin can see all accounts with filters
            accounts = await collaboratorBankService.getAllCollaboratorBankAccounts({
                userId: collaboratorId as string | undefined,
                search: search as string | undefined,
            });
        } else {
            // Non-admin users
            if (collaboratorId) {
                // If asking for a specific collaborator (e.g. withdrawal modal), ONLY return ACTIVE accounts
                accounts = await collaboratorBankService.getActiveCollaboratorBankAccounts(collaboratorId as string);
            } else {
                // SUBADMIN only sees their own accounts (or USER sees empty list)
                accounts = await collaboratorBankService.getCollaboratorBankAccounts(userId);
            }
        }

        res.status(200).json(accounts);
    } catch (error: any) {
        console.error('[Get Bank Accounts Error]:', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * Update a bank account
 * PUT /api/admin/collaborator-banks/:id
 */
export const updateBankAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;
        const { bankName, accountType, accountNumber, accountHolder, documentType, documentNumber, isActive } = req.body;

        const account = await collaboratorBankService.updateCollaboratorBankAccount(id, userId, {
            bankName,
            accountType,
            accountNumber,
            accountHolder,
            documentType,
            documentNumber,
            isActive,
        });

        res.status(200).json(account);
    } catch (error: any) {
        console.error('[Update Bank Account Error]:', error);
        res.status(400).json({ error: error.message });
    }
};

/**
 * Delete a bank account
 * DELETE /api/admin/collaborator-banks/:id
 */
export const deleteBankAccount = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user!.userId;
        const { id } = req.params;

        await collaboratorBankService.deleteCollaboratorBankAccount(id, userId);

        res.status(200).json({ message: 'Cuenta bancaria eliminada exitosamente' });
    } catch (error: any) {
        console.error('[Delete Bank Account Error]:', error);
        res.status(400).json({ error: error.message });
    }
};
