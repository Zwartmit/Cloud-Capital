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
    const tasks = await adminService.getAllTasks(status as string);
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
    const adminEmail = req.user!.email;
    const adminRole = req.user!.role;

    const task = await adminService.approveTask(id, adminEmail, adminRole);
    res.status(200).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const adminEmail = req.user!.email;

    const task = await adminService.rejectTask(id, adminEmail);
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
