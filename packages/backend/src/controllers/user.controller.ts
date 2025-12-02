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
      res.status(400).json({ error: 'Invalid amount' });
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
      res.status(400).json({ error: 'Invalid amount' });
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
      res.status(400).json({ error: 'Invalid amount' });
      return;
    }

    const result = await userService.reinvestProfit(userId, amountUSD);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
