import { Request, Response } from 'express';
import * as adminService from '../services/admin.service.js';

export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await adminService.getAllUsers(page, limit);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = await adminService.getUserById(id);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      res.status(400).json({ error: 'El término de búsqueda es requerido' });
      return;
    }

    const users = await adminService.searchUsers(q);
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { capitalUSDT, currentBalanceUSDT } = req.body;

    if (capitalUSDT === undefined || currentBalanceUSDT === undefined) {
      res.status(400).json({ error: 'Capital y Balance actual son requeridos' });
      return;
    }

    const user = await adminService.updateUserBalance(id, capitalUSDT, currentBalanceUSDT);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    const user = req.user as any;
    const tasks = await adminService.getAllTasks({ id: user.userId, role: user.role }, status as string);
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const task = await adminService.getTaskById(id);
    res.status(200).json(task);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const approveTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { receivedAmount, reference } = req.body;
    const user = req.user as any;
    const adminEmail = user.email;
    const adminRole = user.role;
    const adminId = user.userId;

    let collaboratorProof: string | undefined;

    if (req.file) {
      // If file was uploaded, use its path relative to server root
      collaboratorProof = `/uploads/proofs/${req.file.filename}`;
    }

    const task = await adminService.approveTask(id, adminEmail, adminRole, adminId, receivedAmount, collaboratorProof, reference);
    res.status(200).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = req.user as any;
    const adminEmail = user.email;
    const adminRole = user.role;
    const adminId = user.userId;
    const { rejectionReason } = req.body;

    const task = await adminService.rejectTask(id, adminEmail, adminRole, rejectionReason, adminId);
    res.status(200).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const toggleCollaboratorVerification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { verified } = req.body; // Expecting { verified: true/false }

    const task = await adminService.toggleCollaboratorVerification(id, verified);
    res.status(200).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await adminService.deleteUser(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserReferrals = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const referrals = await adminService.getUserReferrals(id);
    res.status(200).json(referrals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const resetUserPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      res.status(400).json({ error: 'La nueva contraseña es requerida' });
      return;
    }

    const result = await adminService.resetUserPassword(id, newPassword);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const stats = await adminService.getStats();
    res.status(200).json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const transactions = await adminService.getRecentTransactions(limit);
    res.status(200).json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCollaboratorConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { commission, processingTime, minAmount, maxAmount, isActive, walletAddress, whatsappNumber } = req.body;

    if (commission === undefined || !processingTime) {
      res.status(400).json({ error: 'Comisión y Tiempo de procesamiento son requeridos' });
      return;
    }

    const config = {
      commission: parseFloat(commission),
      processingTime,
      minAmount: parseFloat(minAmount || 0),
      maxAmount: parseFloat(maxAmount || 0),
      isActive: isActive !== undefined ? isActive : true,
      walletAddress,
      whatsappNumber // Passed to service to update root user field if needed, or kept in config
    };

    const user = await adminService.updateCollaboratorConfig(id, config);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createCollaborator = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, username, whatsappNumber } = req.body;

    if (!email || !password || !name || !username) {
      res.status(400).json({ error: 'Todos los campos son obligatorios' });
      return;
    }

    const user = await adminService.createCollaborator({
      email,
      password,
      name,
      username,
      whatsappNumber
    });

    res.status(201).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getStaff = async (_req: Request, res: Response): Promise<void> => {
  try {
    const staff = await adminService.getAllStaff();
    res.status(200).json(staff);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const unblockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await adminService.unblockUser(id);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const blockUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await adminService.blockUser(id, reason || 'BLOCKED_BY_ADMIN');
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// FASE 1: New endpoints for commission management

/**
 * POST /api/admin/charge-commissions
 * Charges commissions for all users with active plans
 */
export const chargeAllCommissions = async (_req: Request, res: Response): Promise<void> => {
  try {
    const { chargeAllPlanCommissions } = await import('../services/plan-commission.service.js');
    const result = await chargeAllPlanCommissions();
    res.status(200).json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * POST /api/admin/charge-commission/:userId
 * Charges commission for a specific user
 */
export const chargeUserCommission = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { chargePlanCommission } = await import('../services/plan-commission.service.js');
    const result = await chargePlanCommission(userId);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
