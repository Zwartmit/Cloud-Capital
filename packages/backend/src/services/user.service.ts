import { User, Transaction } from '@prisma/client';
import prisma from '../config/database.js';

export const getUserProfile = async (userId: string): Promise<Omit<User, 'password'> & { referralsCount: number }> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { referrals: true }
      }
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const { password: _, _count, ...userWithoutPassword } = user;
  return {
    ...userWithoutPassword,
    referralsCount: _count.referrals
  };
};

export const getUserBalance = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      capitalUSDT: true,
      currentBalanceUSDT: true,
      investmentClass: true,
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  return user;
};

export const getUserTransactions = async (userId: string): Promise<Transaction[]> => {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50, // Limit to last 50 transactions
  });

  return transactions;
};

export const getBalanceHistory = async (userId: string, days: number = 30) => {
  // Get user's current balance and capital
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      capitalUSDT: true,
      currentBalanceUSDT: true,
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Get all transactions for the user, ordered by date
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  // Calculate balance history day by day
  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - days);

  const balanceHistory = [];
  let runningBalance = 0;

  // Initialize with capital from first deposit
  const firstDeposit = transactions.find(t => t.type === 'DEPOSIT');
  if (firstDeposit) {
    runningBalance = firstDeposit.amountUSDT;
  }

  // Generate daily balance points
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(currentDate.getDate() + i);

    // Get all transactions up to this date
    const transactionsUpToDate = transactions.filter(t =>
      new Date(t.createdAt) <= currentDate
    );

    // Calculate balance based on transaction types
    let balance = 0;
    transactionsUpToDate.forEach(t => {
      if (t.type === 'DEPOSIT' || t.type === 'PROFIT') {
        balance += t.amountUSDT;
      } else if (t.type === 'WITHDRAWAL') {
        balance -= t.amountUSDT;
      }
      // REINVEST doesn't change total balance, just moves from profit to capital
    });

    balanceHistory.push({
      date: currentDate.toISOString().split('T')[0],
      balance: balance || runningBalance,
    });
  }

  // Ensure the last point matches current balance
  if (balanceHistory.length > 0) {
    balanceHistory[balanceHistory.length - 1].balance = user.currentBalanceUSDT || 0;
  }

  return balanceHistory;
};

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<Omit<User, 'password'>> => {
  // Don't allow updating sensitive fields
  const { password, role, capitalUSDT, currentBalanceUSDT, referrerId, collaboratorConfig, ...allowedData } = data;

  const user = await prisma.user.update({
    where: { id: userId },
    data: allowedData,
  });

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const createDepositRequest = async (userId: string, amountUSD: number, reference?: string, proof?: string) => {
  const task = await prisma.task.create({
    data: {
      userId,
      type: 'DEPOSIT_MANUAL',
      amountUSD,
      reference,
      proof,
      status: 'PENDING',
    }
  });

  return task;
};

export const createWithdrawalRequest = async (userId: string, amountUSD: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Check if user has enough balance
  const currentBalance = user.currentBalanceUSDT || 0;
  const capital = user.capitalUSDT || 0;
  const availableProfit = currentBalance - capital;

  if (availableProfit < amountUSD) {
    throw new Error('Saldo insuficiente');
  }

  const task = await prisma.task.create({
    data: {
      userId,
      type: 'WITHDRAWAL',
      amountUSD,
      status: 'PENDING',
    }
  });

  return task;
};

export const reinvestProfit = async (userId: string, amountUSD: number) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Check if user has enough profit
  const currentBalance = user.currentBalanceUSDT || 0;
  const capital = user.capitalUSDT || 0;
  const availableProfit = currentBalance - capital;

  if (availableProfit < amountUSD) {
    throw new Error('Saldo insuficiente para reinvertir');
  }

  if (amountUSD < 50) {
    throw new Error('El monto mínimo de reinversión es $50 USDT');
  }

  // SPEC 5: Reinversión = Contrato Cero
  // Reset EVERYTHING except history
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      // Reset capital to ONLY the reinvested amount (not add to existing)
      capitalUSDT: amountUSD,
      // Reset balance to match capital
      currentBalanceUSDT: amountUSD,
      // Clear investment plan - user must select new one
      investmentClass: null,
      // Reset contract status
      contractStatus: 'PENDING_PLAN_SELECTION',
      cycleCompleted: false,
      cycleCompletedAt: null,
      // Clear plan tracking
      currentPlanStartDate: null,
      currentPlanExpiryDate: null,
      lastCommissionChargeDate: null
    }
  });

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: 'REINVEST',
      amountUSDT: amountUSD,
      reference: 'Reinversión - Nuevo ciclo iniciado',
      status: 'COMPLETED',
    }
  });

  return { user: updatedUser, transaction };
};

export const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<void> => {
  const bcrypt = await import('bcrypt');

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error('Contraseña actual incorrecta');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });
};

export const getUserReferrals = async (userId: string) => {
  const referrals = await prisma.user.findMany({
    where: { referrerId: userId },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      createdAt: true,
      investmentClass: true,
      currentBalanceUSDT: true,
    },
    orderBy: { createdAt: 'desc' }
  });

  return referrals;
};

export const getUserReferralCommissions = async (userId: string) => {
  const commissions = await prisma.referralCommission.findMany({
    where: { referrerId: userId },
    include: {
      referredUser: {
        select: {
          name: true,
          email: true,
          username: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return commissions;
};

// Enhanced deposit functions for hybrid system
export const createAutoDepositRequest = async (
  userId: string,
  amountUSDT: number,
  txid?: string,
  proof?: string,
  reservedAddressId?: string // NEW: use pre-reserved address
) => {
  // Validate minimum amount
  if (amountUSDT < 50) {
    throw new Error('El monto mínimo de aporte es $50 USDT');
  }

  let assignedAddress: string | null = null;

  // If we have a pre-reserved address, use it
  if (reservedAddressId) {
    const address = await prisma.btcAddressPool.findUnique({
      where: { id: reservedAddressId },
    });

    if (!address || address.status !== 'RESERVED') {
      throw new Error('La dirección reservada ya no está disponible');
    }

    assignedAddress = address.address;
  }

  // Create task
  const task = await prisma.task.create({
    data: {
      userId,
      type: 'DEPOSIT_AUTO',
      amountUSD: amountUSDT,
      txid,
      proof,
      assignedAddress,
      depositMethod: 'AUTO',
      status: 'PENDING',
    }
  });

  // Link the reserved address to this task and accumulate amount
  if (reservedAddressId) {
    await prisma.btcAddressPool.update({
      where: { id: reservedAddressId },
      data: {
        reservedForTaskId: task.id,
        requestedAmount: { increment: amountUSDT }
      },
    });
  }

  return task;
};

/**
 * Reserve BTC address for user (NEW FLOW)
 * Does NOT create task - only reserves address temporarily
 */
export const reserveBtcAddress = async (
  userId: string,
  amountUSDT: number
) => {
  const { reserveAddressTemporarily } = await import('./btc-address-pool.service.js');

  const { address, reservationId } = await reserveAddressTemporarily(userId, amountUSDT);

  return {
    address,
    reservationId,
  };
};

/**
 * Check if user has an existing active reservation
 */
export const getReservedAddress = async (userId: string) => {
  const { getActiveReservation } = await import('./btc-address-pool.service.js');
  return getActiveReservation(userId);
};

/**
 * Release a reserved address (when user closes modal without submitting)
 */
export const releaseAddressReservation = async (addressId: string) => {
  const address = await prisma.btcAddressPool.findUnique({
    where: { id: addressId },
  });

  if (!address) {
    return; // Already gone, nothing to do
  }

  // Only release if it's RESERVED and has NO task associated yet
  if (address.status === 'RESERVED' && !address.reservedForTaskId) {
    await prisma.btcAddressPool.update({
      where: { id: addressId },
      data: {
        status: 'AVAILABLE',
        reservedAt: null,
        requestedAmount: null, // Clear amount when releasing
      },
    });
  }
};

/**
 * Update reserved address amount (when user changes amount after requesting)
 */
export const updateReservedAddressAmount = async (addressId: string, amountUSDT: number) => {
  await prisma.btcAddressPool.update({
    where: { id: addressId },
    data: {
      requestedAmount: amountUSDT,
    },
  });
};

export const createManualDepositOrder = async (
  userId: string,
  amountUSDT: number,
  txid: string,
  collaboratorName: string,
  notes?: string,
  bankName?: string,
  collaboratorId?: string
) => {
  const task = await prisma.task.create({
    data: {
      userId,
      type: 'DEPOSIT_MANUAL',
      amountUSD: amountUSDT,
      txid,
      collaboratorName,
      collaboratorId,
      reference: notes,
      depositMethod: 'MANUAL',
      bankDetails: bankName ? { bankName } : undefined,
      status: 'PENDING',
    }
  });

  return task;
};

export const createWithdrawalRequestEnhanced = async (
  userId: string,
  amountUSDT: number,
  btcAddress: string,
  destinationType: 'PERSONAL' | 'COLLABORATOR',
  destinationUserId?: string,
  bankDetails?: any
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Check if user has enough balance
  const currentBalance = user.currentBalanceUSDT || 0;
  const capital = user.capitalUSDT || 0;
  const availableProfit = currentBalance - capital;

  if (availableProfit < amountUSDT) {
    throw new Error('Saldo insuficiente');
  }

  if (amountUSDT < 50) {
    throw new Error('El monto mínimo de retiro es $50 USDT');
  }

  const feeRate = 0.045; // 4.5%
  const feeAmount = amountUSDT * feeRate;
  const netAmount = amountUSDT - feeAmount;

  const task = await prisma.task.create({
    data: {
      userId,
      type: 'WITHDRAWAL',
      amountUSD: amountUSDT,
      btcAddress,
      destinationType,
      destinationUserId,
      liquidationDetails: {
        feeRate,
        feeAmount,
        netAmount,
        type: 'PROFIT_LIQUIDATION'
      },
      bankDetails,
      status: 'PENDING',
    }
  });

  return task;
};

export const createEarlyLiquidationRequest = async (
  userId: string,
  btcAddress: string,
  reason?: string
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const capital = user.capitalUSDT || 0;

  if (capital <= 0) {
    throw new Error('No tienes capital activo para liquidar');
  }

  if (capital < 50) {
    throw new Error('El monto mínimo de liquidación es $50 USDT');
  }

  // 38% Penalty Calculation
  const penaltyRate = 0.38;
  const penaltyAmount = capital * penaltyRate;
  const netAmount = capital - penaltyAmount;

  const task = await prisma.task.create({
    data: {
      userId,
      type: 'LIQUIDATION',
      amountUSD: capital, // The full capital amount is what is being liquidated
      btcAddress,
      destinationType: 'PERSONAL', // Always personal for capital liquidation? Or debatable. For now assume personal.
      reference: reason || 'Liquidación Anticipada de Capital',
      liquidationDetails: {
        penaltyRate,
        penaltyAmount,
        netAmount,
        originalCapital: capital,
        type: 'CAPITAL_LIQUIDATION'
      },
      status: 'PENDING',
    }
  });

  return task;
};

// Get list of collaborators (admins and subadmins)
export const getCollaborators = async () => {
  const collaborators = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'SUPERADMIN' },
        { role: 'SUBADMIN' }
      ]
    },
    select: {
      id: true,
      name: true,
      whatsappNumber: true,
      role: true,
      btcDepositAddress: true,
      collaboratorConfig: true,
    }
  });

  // Filter active collaborators in memory since config is Json
  return collaborators.filter(collab => {
    const config = collab.collaboratorConfig as any;
    // active if no config (default) or isActive is explicitly true or undefined (default true)
    // Only strictly false makes it inactive
    return config?.isActive !== false;
  });
};

export const getUserTasks = async (userId: string) => {
  const tasks = await prisma.task.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20, // Limit to last 20 tasks
  });

  return tasks;
};

export const changeInvestmentPlan = async (userId: string, planName: string) => {
  // Get user with referral count
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { referrals: true }
      }
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Get the target plan
  const plan = await prisma.investmentPlan.findFirst({
    where: { name: planName }
  });

  if (!plan) {
    throw new Error('Plan de inversión no encontrado');
  }

  // Check if user already has this plan
  if (user.investmentClass === planName) {
    throw new Error('Ya tienes este plan de inversión');
  }

  // SPEC 9: Validate minimum capital requirement
  const currentBalance = user.currentBalanceUSDT || 0;
  if (currentBalance < 50) {
    throw new Error('Se requiere un capital mínimo de $50 USD para seleccionar un plan');
  }

  // Validate capital requirement for specific plan
  if (currentBalance < plan.minCapital) {
    throw new Error(`Capital insuficiente. Se requieren $${plan.minCapital} USDT`);
  }

  // Validate referral requirement for Platinum and Diamond
  const upperName = planName.toUpperCase();
  if (upperName.includes('PLATINUM') || upperName.includes('DIAMOND')) {
    const referralsCount = user._count.referrals;
    if (referralsCount < 1) {
      throw new Error('Se requiere al menos 1 referido activo para este plan');
    }
  }

  // COMMISSION LOGIC ---
  // Calculate monthly cost
  const monthlyCostPercentage = plan.monthlyCommission;
  const monthlyCostUSD = (monthlyCostPercentage / 100) * currentBalance;

  // Calculate available profit
  const userCapital = user.capitalUSDT || 0;
  const availableProfit = Math.max(0, currentBalance - userCapital);

  // Determine deduction source
  let deductedFromProfit = 0;
  let deductedFromCapital = 0;

  if (availableProfit >= monthlyCostUSD) {
    // Deduct entirely from profit
    deductedFromProfit = monthlyCostUSD;
  } else {
    // Deduct what we can from profit, rest from capital
    deductedFromProfit = availableProfit;
    deductedFromCapital = monthlyCostUSD - availableProfit;
  }

  // Ensure balance is sufficient (sanity check, though currentBalance >= monthlyCostUSD check might be implicitly covered, let's be explicit)
  if (currentBalance < monthlyCostUSD) {
    // This should technically not happen if balance >= minCapital ($50) and commission is small percentage, 
    // but good to have as fail-safe or if balance was just barely enough.
    throw new Error(`Saldo insuficiente para cubrir la comisión mensual de $${monthlyCostUSD.toFixed(2)}`);
  }

  const newBalance = currentBalance - monthlyCostUSD;
  const newCapital = userCapital - deductedFromCapital;

  // SPEC 1: Set plan subscription dates
  const now = new Date();
  const expiryDate = new Date(now);
  expiryDate.setDate(expiryDate.getDate() + 30); // 30 days from now

  // Update user's investment class and plan tracking
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      investmentClass: planName as any,
      currentBalanceUSDT: newBalance,
      capitalUSDT: newCapital,
      // Set plan subscription tracking
      currentPlanStartDate: now,
      currentPlanExpiryDate: expiryDate,
      // Activate contract if it was pending plan selection
      contractStatus: user.contractStatus === 'PENDING_PLAN_SELECTION' ? 'ACTIVE' : user.contractStatus,
    },
    include: {
      _count: {
        select: { referrals: true }
      }
    }
  });

  // Create a transaction record for the plan change (REINVEST) - keeping this for audit/history
  // Actually, wait, do we need two transactions? usually plan change didn't cost anything.
  // Now it costs commission.
  // Let's create the commission transaction specifically.

  await prisma.transaction.create({
    data: {
      userId,
      type: 'COMMISSION',
      amountUSDT: -monthlyCostUSD,
      reference: `Comisión mensual - Plan ${planName} (${monthlyCostPercentage}%)`,
      status: 'COMPLETED',
    }
  });

  /* 
  // Should we keep the 'REINVEST' record? The prompt implementation plan said "Create commission transaction".
  // The original code had a REINVEST transaction for 0 amount.
  // Generally cleaner to just have the commission transaction now if that's the only financial event.
  // But maybe the system relies on REINVEST type for some other logic? 
  // Checking original code... 
  // It was: type: 'REINVEST', amountUSDT: 0, reference: 'Cambio de plan a...'
  // I will keep the original transaction logic if it helps tracking "Plan Changed" event, but maybe 0 amount is confusing if we also charge.
  // Let's assume the COMMISSION transaction is enough to record the financial impact, but maybe a 'PLAN_CHANGE' or just log is enough.
  // However, removing the REINVEST transaction might break some "history" view if it filters by that.
  // I'll keep it but maybe it's redundant. Let's just create the COMMISSION one as requested.
  // Actually, I'll comment out the zero-amount REINVEST one to avoid clutter, unless specifically needed.
  // Implementation plan didn't explicitly say "remove old transaction", but implied "Create commission transaction".
  // I will stick to creating the commission transaction.
  */

  const { password: _, _count, ...userWithoutPassword } = updatedUser;
  return {
    user: {
      ...userWithoutPassword,
      referralsCount: _count.referrals
    },
    chargeDetails: {
      totalCharged: monthlyCostUSD,
      deductedFromProfit,
      deductedFromCapital,
      originalBalance: currentBalance,
      newBalance,
      newCapital
    }
  };
};

// Get public contact information for landing page
export const getPublicContactInfo = async () => {
  const admin = await prisma.user.findFirst({
    where: {
      OR: [
        { role: 'SUPERADMIN' },
        { role: 'SUBADMIN' }
      ]
    },
    select: {
      contactEmail: true,
      contactTelegram: true,
    },
    orderBy: { createdAt: 'asc' } // Get the first admin created
  });

  return {
    email: admin?.contactEmail || null,
    telegram: admin?.contactTelegram || null,
  };
};

/**
 * Mark welcome modal as seen for user
 */
export const markWelcomeModalSeen = async (userId: string) => {
  await prisma.user.update({
    where: { id: userId },
    data: { hasSeenWelcomeModal: true }
  });
};

/**
 * Get passive income information for user
 */
export const getPassiveIncomeInfo = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      passiveIncomeRate: true,
      hasFirstDeposit: true,
      hasSuccessfulReferral: true,
      capitalUSDT: true,
      investmentClass: true,
      lastDailyProfitDate: true
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  const dailyRate = user.passiveIncomeRate / 30;
  const isEligible = (user.capitalUSDT || 0) > 0 && !user.investmentClass;

  return {
    currentRate: user.passiveIncomeRate,
    dailyRate,
    hasFirstDeposit: user.hasFirstDeposit,
    hasSuccessfulReferral: user.hasSuccessfulReferral,
    isEligible,
    lastProfitDate: user.lastDailyProfitDate
  };
};
