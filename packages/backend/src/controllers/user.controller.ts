import { Request, Response } from 'express';
import * as userService from '../services/user.service.js';

export const getProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await userService.getUserProfile(userId);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const user = await userService.updateUserProfile(userId, req.body);
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getBalance = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const balance = await userService.getUserBalance(userId);
    res.status(200).json(balance);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
};

export const getTransactions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const transactions = await userService.getUserTransactions(userId);
    res.status(200).json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const requestDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { amountUSD, reference, proof } = req.body;

    if (!amountUSD || amountUSD <= 0) {
      res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
      return;
    }

    const task = await userService.createDepositRequest(userId, amountUSD, reference, proof);
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const requestWithdrawal = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { amountUSD } = req.body;

    if (!amountUSD || amountUSD <= 0) {
      res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
      return;
    }

    const task = await userService.createWithdrawalRequest(userId, amountUSD);
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const reinvest = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { amountUSD } = req.body;

    if (!amountUSD || amountUSD <= 0) {
      res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
      return;
    }

    const result = await userService.reinvestProfit(userId, amountUSD);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getBalanceHistory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const days = parseInt(req.query.days as string) || 30;
    const history = await userService.getBalanceHistory(userId, days);
    res.status(200).json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const changePassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: 'La contraseña actual y la nueva contraseña son requeridas' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      return;
    }

    await userService.changePassword(userId, currentPassword, newPassword);
    res.status(200).json({ message: 'Contraseña cambiada exitosamente' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getReferrals = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const referrals = await userService.getUserReferrals(userId);
    res.status(200).json(referrals);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
