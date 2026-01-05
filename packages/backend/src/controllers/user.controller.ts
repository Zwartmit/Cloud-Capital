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

    // Validate BTC address format if provided
    if (req.body.btcDepositAddress) {
      // Bitcoin address validation regex (supports Legacy, SegWit, and Bech32 formats)
      const btcAddressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
      if (!btcAddressRegex.test(req.body.btcDepositAddress)) {
        res.status(400).json({ error: 'Formato de dirección BTC de depósito inválido' });
        return;
      }
    }

    if (req.body.btcWithdrawAddress) {
      const btcAddressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
      if (!btcAddressRegex.test(req.body.btcWithdrawAddress)) {
        res.status(400).json({ error: 'Formato de dirección BTC de retiro inválido' });
        return;
      }
    }

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

export const getReferralCommissions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const commissions = await userService.getUserReferralCommissions(userId);
    res.status(200).json(commissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Enhanced deposit endpoints
export const requestAutoDeposit = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { amountUSDT, txid, reservedAddressId } = req.body; // Changed from existingTaskId
    let proof = req.body.proof;

    if (req.file) {
      // If file was uploaded, use its path relative to server root
      // In production, you'd likely use a full URL or cloud storage URL
      proof = `/uploads/proofs/${req.file.filename}`;
    }

    if (!amountUSDT || parseFloat(amountUSDT) <= 0) {
      res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
      return;
    }

    const task = await userService.createAutoDepositRequest(
      userId,
      parseFloat(amountUSDT),
      txid,
      proof,
      reservedAddressId // Pass reserved address ID if provided
    );
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// NEW: Reserve BTC address without creating task
export const reserveBtcAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { amountUSDT } = req.body;

    if (!amountUSDT || parseFloat(amountUSDT) <= 0) {
      res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
      return;
    }

    const result = await userService.reserveBtcAddress(userId, parseFloat(amountUSDT));
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// NEW: Check if user has reserved address
export const getReservedAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const reservation = await userService.getReservedAddress(userId);
    res.status(200).json(reservation);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Release reserved address (when user closes modal)
export const releaseReservedAddress = async (req: Request, res: Response): Promise<void> => {
  try {
    const { addressId } = req.body;

    if (!addressId) {
      res.status(400).json({ error: 'addressId es requerido' });
      return;
    }

    await userService.releaseAddressReservation(addressId);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Update reserved address amount (when user changes amount after requesting)
export const updateReservedAddressAmount = async (req: Request, res: Response): Promise<void> => {
  try {
    const { addressId } = req.params;
    const { amountUSDT } = req.body;

    if (!amountUSDT || amountUSDT <= 0) {
      res.status(400).json({ error: 'Monto inválido' });
      return;
    }

    await userService.updateReservedAddressAmount(addressId, amountUSDT);
    res.status(200).json({ message: 'Monto actualizado exitosamente' });
  } catch (error: any) {
    console.error('[Update Address Amount Error]:', error);
    res.status(500).json({ error: error.message });
  }
};

export const requestManualDepositOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { amountUSDT, txid, collaboratorName, collaboratorId, notes } = req.body;

    if (!amountUSDT || amountUSDT <= 0) {
      res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
      return;
    }

    if (!collaboratorName) {
      res.status(400).json({ error: 'Nombre del colaborador es requerido' });
      return;
    }

    const task = await userService.createManualDepositOrder(userId, amountUSDT, txid, collaboratorName, notes, undefined, collaboratorId);
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Enhanced withdrawal endpoint
export const requestWithdrawalEnhanced = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { amountUSDT, btcAddress, destinationType, destinationUserId, bankDetails } = req.body;

    if (!amountUSDT || amountUSDT <= 0) {
      res.status(400).json({ error: 'La cantidad debe ser mayor a 0' });
      return;
    }

    if (!btcAddress) {
      res.status(400).json({ error: 'Dirección BTC es requerida' });
      return;
    }

    if (!destinationType || !['PERSONAL', 'COLLABORATOR'].includes(destinationType)) {
      res.status(400).json({ error: 'Tipo de destino inválido' });
      return;
    }

    const task = await userService.createWithdrawalRequestEnhanced(
      userId,
      amountUSDT,
      btcAddress,
      destinationType,
      destinationUserId,
      bankDetails
    );
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const requestEarlyLiquidation = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { btcAddress } = req.body;

    if (!btcAddress) {
      res.status(400).json({ error: 'Dirección BTC es requerida' });
      return;
    }

    const task = await userService.createEarlyLiquidationRequest(userId, btcAddress);
    res.status(201).json(task);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

// Get collaborators list
export const getCollaborators = async (_req: Request, res: Response): Promise<void> => {
  try {
    const collaborators = await userService.getCollaborators();
    res.status(200).json(collaborators);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const tasks = await userService.getUserTasks(userId);
    res.status(200).json(tasks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const changeInvestmentPlan = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { planName } = req.body;

    if (!planName) {
      res.status(400).json({ error: 'El nombre del plan es requerido' });
      return;
    }

    const result = await userService.changeInvestmentPlan(userId, planName);
    res.status(200).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getRecentActivity = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    // Import admin service to use getRecentTransactions
    const adminService = await import('../services/admin.service.js');
    const transactions = await adminService.getRecentTransactions(limit);
    res.status(200).json(transactions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get public contact information for landing page (no auth required)
export const getPublicContactInfo = async (_req: Request, res: Response): Promise<void> => {
  try {
    const contactInfo = await userService.getPublicContactInfo();
    res.status(200).json(contactInfo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// FASE 1: New endpoints for cycle management and contract status

/**
 * GET /api/user/cycle-progress
 * Returns user's progress towards 200% goal
 */
export const getCycleProgress = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { getCycleProgress } = await import('../utils/contract-calculations.js');
    const progress = await getCycleProgress(userId);
    res.status(200).json(progress);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * GET /api/user/contract-status
 * Returns user's contract status and related information
 */
export const getContractStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const { default: prisma } = await import('../config/database.js');

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        contractStatus: true,
        cycleCompleted: true,
        cycleCompletedAt: true,
        investmentClass: true,
        currentPlanStartDate: true,
        currentPlanExpiryDate: true,
        capitalUSDT: true,
        currentBalanceUSDT: true,
        passiveIncomeRate: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    // Calculate days remaining for plan
    let daysRemaining = 0;
    if (user.currentPlanExpiryDate) {
      const now = new Date();
      const expiry = new Date(user.currentPlanExpiryDate);
      daysRemaining = Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    }

    // Calculate available profit and total profit
    const capital = user.capitalUSDT || 0;
    const balance = user.currentBalanceUSDT || 0;
    const availableProfit = Math.max(0, balance - capital);

    // Calculate total profit generated (sum of all PROFIT transactions)
    // This represents the historical total profit generated across all time
    const totalProfitResult = await prisma.transaction.aggregate({
      where: {
        userId,
        type: 'PROFIT'
      },
      _sum: {
        amountUSDT: true
      }
    });
    const totalProfit = totalProfitResult._sum.amountUSDT || 0;

    // Get withdrawal history for display in modal
    const withdrawalHistory = await prisma.transaction.findMany({
      where: {
        userId,
        type: 'WITHDRAWAL',
        status: 'COMPLETED'
      },
      select: {
        amountUSDT: true,
        createdAt: true,
        reference: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      ...user,
      daysRemaining,
      availableProfit,
      totalProfit,
      withdrawalHistory
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Passive Income Controllers
export const markWelcomeModalSeen = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    await userService.markWelcomeModalSeen(userId);
    res.status(200).json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPassiveIncomeInfo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const info = await userService.getPassiveIncomeInfo(userId);
    res.status(200).json(info);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
