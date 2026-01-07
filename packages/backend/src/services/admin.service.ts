import { TaskStatus } from '@prisma/client';
import prisma from '../config/database.js';
import bcrypt from 'bcrypt';
import {
  calculateTotalCommissions,
  calculateTotalProfit
} from '../utils/contract-calculations';

// User Management
export const getAllUsers = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [allUsers, total] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'USER' },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        capitalUSDT: true,
        currentBalanceUSDT: true,
        investmentClass: true,
        referralCode: true,
        isBlocked: true,
        blockedReason: true,
        hasFirstDeposit: true,
        createdAt: true,
        _count: {
          select: { referrals: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.user.count({ where: { role: 'USER' } })
  ]);

  const userIds = allUsers.map(u => u.id);

  // 1. Find the last "New cycle" reset date for each user
  const resetDates = await prisma.transaction.groupBy({
    by: ['userId'],
    where: {
      userId: { in: userIds },
      reference: 'Reinversión - Nuevo ciclo iniciado'
    },
    _max: { createdAt: true }
  });

  // 2. Fetch all manual transactions for these users
  const manualTransactions = await prisma.transaction.findMany({
    where: {
      userId: { in: userIds },
      OR: [
        { reference: 'Adicionada por el admin/sistema' }, // Manual Profit
        { reference: 'Ajuste manual de capital por admin/sistema' } // Manual Capital
      ]
    },
    select: {
      userId: true,
      type: true,
      amountUSDT: true,
      reference: true,
      createdAt: true
    }
  });

  // 3. Process in memory
  const users = allUsers.map(user => {
    // Determine cutoff date (last reset or epoch 0)
    const resetRecord = resetDates.find(r => r.userId === user.id);
    const cutoffDate = resetRecord?._max.createdAt ? new Date(resetRecord._max.createdAt) : new Date(0);

    // Filter transactions after cutoff
    const userTxs = manualTransactions.filter(t => t.userId === user.id && new Date(t.createdAt) > cutoffDate);

    // Calculate Manual Profit
    const manualProfit = userTxs
      .filter(t => t.type === 'PROFIT' && t.reference === 'Adicionada por el admin/sistema')
      .reduce((sum, t) => sum + t.amountUSDT, 0);

    // Calculate Manual Capital
    const capDeposits = userTxs
      .filter(t => t.type === 'DEPOSIT' && t.reference === 'Ajuste manual de capital por admin/sistema')
      .reduce((sum, t) => sum + t.amountUSDT, 0);

    const capWithdrawals = userTxs
      .filter(t => t.type === 'WITHDRAWAL' && t.reference === 'Ajuste manual de capital por admin/sistema')
      .reduce((sum, t) => sum + t.amountUSDT, 0);

    const manualCapital = capDeposits - capWithdrawals;

    return {
      ...user,
      referralsCount: user._count.referrals,
      manualProfit,
      manualCapital,
      _count: undefined
    };
  });

  return {
    users,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

export const getUserById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      capitalUSDT: true,
      currentBalanceUSDT: true,
      investmentClass: true,
      referralCode: true,
      referrerId: true,
      hasFirstDeposit: true,
      btcDepositAddress: true,
      btcWithdrawAddress: true,
      whatsappNumber: true,
      collaboratorConfig: true,
      isBlocked: true,
      blockedReason: true,
      blockedAt: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: { referrals: true }
      }
    }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
  }

  // Get referrer info if exists
  let referredBy = null;
  if (user.referrerId) {
    const referrer = await prisma.user.findUnique({
      where: { id: user.referrerId },
      select: { name: true, username: true }
    });
    referredBy = referrer;
  }

  // 1. Find last reset date
  const lastReset = await prisma.transaction.findFirst({
    where: {
      userId: id,
      reference: 'Reinversión - Nuevo ciclo iniciado'
    },
    orderBy: { createdAt: 'desc' }
  });

  const cutoffDate = lastReset ? lastReset.createdAt : new Date(0);

  // 2. Calculate Manual Stats after cutoff
  const manualStats = await prisma.transaction.findMany({
    where: {
      userId: id,
      createdAt: { gt: cutoffDate },
      OR: [
        { reference: 'Adicionada por el admin/sistema' },
        { reference: 'Ajuste manual de capital por admin/sistema' }
      ]
    },
    select: {
      type: true,
      amountUSDT: true,
      reference: true
    }
  });

  const manualProfit = manualStats
    .filter(t => t.type === 'PROFIT' && t.reference === 'Adicionada por el admin/sistema')
    .reduce((sum, t) => sum + t.amountUSDT, 0);

  const capDeposits = manualStats
    .filter(t => t.type === 'DEPOSIT' && t.reference === 'Ajuste manual de capital por admin/sistema')
    .reduce((sum, t) => sum + t.amountUSDT, 0);

  const capWithdrawals = manualStats
    .filter(t => t.type === 'WITHDRAWAL' && t.reference === 'Ajuste manual de capital por admin/sistema')
    .reduce((sum, t) => sum + t.amountUSDT, 0);

  const manualCapital = capDeposits - capWithdrawals;

  return {
    ...user,
    referralsCount: user._count.referrals,
    manualProfit,
    manualCapital,
    referredBy,
    _count: undefined,
    referrerId: undefined
  };
};

export const searchUsers = async (query: string) => {
  const users = await prisma.user.findMany({
    where: {
      role: 'USER',
      OR: [
        { email: { contains: query } },
        { name: { contains: query } },
        { username: { contains: query } }
      ]
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      capitalUSDT: true,
      currentBalanceUSDT: true,
      investmentClass: true,
      referralCode: true,
      isBlocked: true,
      blockedReason: true,
      createdAt: true,
      _count: {
        select: { referrals: true }
      }
    },
    take: 20
  });

  // Map _count to referralsCount for DTO compatibility
  // Note: For search, we might not need advanced manual stats aggregation yet as it's just a dropdown list
  // But if needed, we'd replicate the logic from getAllUsers. 
  // For now, keeping it simple as search usually just shows basic info.
  return users.map(user => ({
    ...user,
    referralsCount: user._count.referrals,
    _count: undefined
  }));
};

export const updateUserBalance = async (id: string, capitalUSDT: number, currentBalanceUSDT: number) => {
  // 0. Pre-validation: Check if adding profit exceeds cycle target (200%)
  const currentUser = await prisma.user.findUnique({
    where: { id },
    select: { currentBalanceUSDT: true, capitalUSDT: true }
  });

  if (!currentUser) throw new Error('Usuario no encontrado');

  const oldBalance = currentUser.currentBalanceUSDT || 0;
  const oldCapital = currentUser.capitalUSDT || 0;
  const oldProfit = oldBalance - oldCapital;

  const newProfitVal = currentBalanceUSDT - capitalUSDT;
  const profitDiff = newProfitVal - oldProfit;

  // Only validate if we are ADDING profit
  if (profitDiff > 0.001) {
    const totalCommissions = await calculateTotalCommissions(id);
    const baseCapital = capitalUSDT + totalCommissions;
    const targetProfit = baseCapital * 2;

    const currentCycleProfit = await calculateTotalProfit(id);
    const projectedTotalProfit = currentCycleProfit + profitDiff;

    if (projectedTotalProfit > targetProfit + 0.01) {
      const remainingProfit = Math.max(0, targetProfit - currentCycleProfit);
      throw new Error(`No se puede agregar esa cantidad. Excede la meta del ciclo (200%).
Meta: $${targetProfit.toFixed(2)}
Generado: $${currentCycleProfit.toFixed(2)}
Restante permitido: $${remainingProfit.toFixed(2)}`);
    }
  }

  return prisma.$transaction(async (tx) => {
    // 1. Get current user state to calculate difference
    const user = await tx.user.findUnique({
      where: { id },
      select: {
        currentBalanceUSDT: true,
        capitalUSDT: true
      }
    });

    if (!user) {
      throw new Error('User not found in updateUserBalance');
    }

    // 2. Calculate difference: New Profit - Old Profit
    const oldBalance = user.currentBalanceUSDT || 0;
    const oldCapital = user.capitalUSDT || 0;
    const oldProfit = oldBalance - oldCapital;

    const newProfit = currentBalanceUSDT - capitalUSDT;
    const profitDiff = newProfit - oldProfit;
    const capitalDiff = capitalUSDT - oldCapital;

    // 3a. If capital changed, create transaction
    if (Math.abs(capitalDiff) > 0.001) {
      await tx.transaction.create({
        data: {
          userId: id,
          type: capitalDiff > 0 ? 'DEPOSIT' : 'WITHDRAWAL',
          amountUSDT: Math.abs(capitalDiff),
          amountBTC: 0,
          status: 'COMPLETED',
          reference: 'Ajuste manual de capital por admin/sistema'
        }
      });
    }

    // 3b. If profit increased, create a transaction record
    if (profitDiff > 0.001) {
      await tx.transaction.create({
        data: {
          userId: id,
          type: 'PROFIT',
          amountUSDT: profitDiff,
          amountBTC: 0,
          status: 'COMPLETED',
          reference: 'Adicionada por el admin/sistema'
        }
      });
    }

    // 4. Update the user
    const updatedUser = await tx.user.update({
      where: { id },
      data: {
        capitalUSDT,
        currentBalanceUSDT
      },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        capitalUSDT: true,
        currentBalanceUSDT: true,
        investmentClass: true,
        referralCode: true,
        isBlocked: true,
        blockedReason: true,
        createdAt: true,
        _count: {
          select: { referrals: true }
        }
      }
    });

    // 5. Calculate Manual Stats (Reset Logic aware)
    // Find last reset within transaction
    const lastReset = await tx.transaction.findFirst({
      where: {
        userId: id,
        reference: 'Reinversión - Nuevo ciclo iniciado'
      },
      orderBy: { createdAt: 'desc' }
    });

    const cutoffDate = lastReset ? lastReset.createdAt : new Date(0);

    // Calculate stats after cutoff
    const manualStats = await tx.transaction.findMany({
      where: {
        userId: id,
        createdAt: { gt: cutoffDate },
        OR: [
          { reference: 'Adicionada por el admin/sistema' },
          { reference: 'Ajuste manual de capital por admin/sistema' }
        ]
      },
      select: {
        type: true,
        amountUSDT: true,
        reference: true
      }
    });

    const manualProfit = manualStats
      .filter(t => t.type === 'PROFIT' && t.reference === 'Adicionada por el admin/sistema')
      .reduce((sum, t) => sum + t.amountUSDT, 0);

    const capDeposits = manualStats
      .filter(t => t.type === 'DEPOSIT' && t.reference === 'Ajuste manual de capital por admin/sistema')
      .reduce((sum, t) => sum + t.amountUSDT, 0);

    const capWithdrawals = manualStats
      .filter(t => t.type === 'WITHDRAWAL' && t.reference === 'Ajuste manual de capital por admin/sistema')
      .reduce((sum, t) => sum + t.amountUSDT, 0);

    const manualCapital = capDeposits - capWithdrawals;

    return {
      ...updatedUser,
      referralsCount: updatedUser._count?.referrals || 0,
      manualProfit,
      manualCapital,
      _count: undefined
    };
  });
};

export const deleteUser = async (id: string) => {
  await prisma.user.delete({
    where: { id }
  });

  return { message: 'Usuario eliminado exitosamente' };
};

export const getUserReferrals = async (id: string) => {
  const referrals = await prisma.user.findMany({
    where: { referrerId: id },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      capitalUSDT: true,
      currentBalanceUSDT: true,
      investmentClass: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return referrals;
};

export const resetUserPassword = async (id: string, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id },
    data: { password: hashedPassword }
  });

  return { message: 'Contraseña restablecida exitosamente' };
};

export const unblockUser = async (id: string) => {
  await prisma.user.update({
    where: { id },
    data: {
      isBlocked: false,
      blockedAt: null,
      blockedReason: null
    }
  });

  return { message: 'Usuario desbloqueado exitosamente' };
};

export const blockUser = async (id: string, reason: string = 'BLOCKED_BY_ADMIN') => {
  await prisma.user.update({
    where: { id },
    data: {
      isBlocked: true,
      blockedAt: new Date(),
      blockedReason: reason
    }
  });

  return { message: 'Usuario bloqueado exitosamente' };
};

// Task Management
export const getAllTasks = async (adminUser: { id: string, role: string }, status?: string) => {
  let where: any = status ? { status: status as TaskStatus } : {};

  // Role-based visibility logic
  if (adminUser.role === 'SUBADMIN') {
    // SUBADMIN sees:
    // 1. Direct tasks (collaboratorId is null) -> To Pre-approve
    // 2. Tasks assigned explicitly to them -> To Complete
    where = {
      ...where,
      OR: [
        {
          AND: [
            { collaboratorId: null },
            { destinationUserId: null }
          ]
        }, // Direct tasks (No collaborator assigned on either side)
        { collaboratorId: adminUser.id }, // Assigned as depositor collaborator
        { destinationUserId: adminUser.id } // Assigned as withdrawal collaborator
      ]
    };
  }
  // SUPERADMIN sees everything (no additional filter needed)

  const tasks = await prisma.task.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          username: true
        }
      },
      collaborator: {
        select: {
          id: true,
          name: true,
          whatsappNumber: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return tasks;
};

export const getTaskById = async (id: string) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          capitalUSDT: true,
          currentBalanceUSDT: true
        }
      },
      collaborator: {
        select: {
          id: true,
          name: true,
          whatsappNumber: true,
          collaboratorConfig: true
        }
      }
    }
  });

  if (!task) {
    throw new Error('Tarea no encontrada');
  }

  return task;
};

export const approveTask = async (id: string, adminEmail: string, adminRole: string, adminId?: string, receivedAmount?: number, collaboratorProof?: string, reference?: string) => {
  const task = await prisma.task.findUnique({
    where: { id },
    include: {
      user: true
    }
  });

  if (!task) {
    throw new Error('Tarea no encontrada');
  }

  if (task.status === 'COMPLETED') {
    throw new Error('La tarea ya está aprobada');
  }

  // --- Logic for Review/Approval ---

  // 1. Collaborator Tasks (Assigned to a specific subadmin)
  // Logic: Only the Assigned Collaborator (or Superadmin) can approve.
  // Approval is DIRECT (goes to COMPLETED).
  if (task.collaboratorId || task.destinationUserId) {
    const isAssignedCollaborator = (task.collaboratorId === adminId) || (task.destinationUserId === adminId);

    // Check permissions: Must be Superadmin OR the Assigned Collaborator
    if (adminRole !== 'SUPERADMIN' && !isAssignedCollaborator) {
      throw new Error('No tienes permiso para aprobar esta tarea de colaborador.');
    }

    // Proceed to COMPLETED logic below...
  }

  // 2. Direct Tasks (No collaborator assigned)
  // Logic: Double filter.
  // Subadmin -> PRE_APPROVED
  // Superadmin -> COMPLETED
  else {
    if (adminRole === 'SUBADMIN') {
      // Subadmin Action: Pre-approve
      if (task.status !== 'PENDING') {
        throw new Error('Solo se pueden pre-aprobar tareas pendientes.');
      }

      return await prisma.task.update({
        where: { id },
        data: {
          status: 'PRE_APPROVED', // Custom status or handle via existing enum if modified? 
          // Assuming PRE_APPROVED is in TaskStatus enum, if not need to add it or use intermediate state. 
          // Valid statuses: PENDING, PRE_APPROVED, PRE_REJECTED, COMPLETED, REJECTED
          approvedByAdmin: adminEmail // Track who pre-approved
        },
        include: { user: { select: { id: true, name: true, username: true } } }
      });
    }

    // Superadmin Action: Complete (Final Approval)
    // Can approve from PENDING or PRE_APPROVED
  }


  // --- Final Completion Logic (Update Balances) ---
  // Reached if:
  // - Collaborator approves their task
  // - Superadmin approves any task

  let updatedTask;

  if (task.type === 'DEPOSIT_AUTO' || task.type === 'DEPOSIT_MANUAL') {
    // Use receivedAmount if provided, otherwise use adjustedAmount or amountUSD
    const amountToAdd = receivedAmount || task.adjustedAmount || task.amountUSD;
    const newCapital = (task.user.capitalUSDT || 0) + amountToAdd;
    const newBalance = (task.user.currentBalanceUSDT || 0) + amountToAdd;

    await prisma.$transaction(async (tx) => {
      // Check if this is the first deposit
      const isFirstDeposit = !task.user.hasFirstDeposit;

      // Update user balance
      await tx.user.update({
        where: { id: task.userId },
        data: {
          capitalUSDT: newCapital,
          currentBalanceUSDT: newBalance,
          hasFirstDeposit: true,
          // Set passive income rate to 3% (or 6% if referrer) if this is first deposit OR user has no active plan (new cycle)
          ...((isFirstDeposit || !task.user.investmentClass) && {
            passiveIncomeRate: task.user.hasSuccessfulReferral ? 0.06 : 0.03,
            lastDailyProfitDate: new Date()
          })
        }
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: task.userId,
          type: 'DEPOSIT',
          amountUSDT: amountToAdd,
          reference: reference || task.txid || task.reference,
          status: 'COMPLETED'
        }
      });

      // Update task status
      updatedTask = await tx.task.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          approvedByAdmin: adminEmail,
          collaboratorProof: collaboratorProof || undefined,
          reference: reference || undefined,
          // Store original requested amount if admin approves with different amount
          adjustedAmount: (receivedAmount && receivedAmount !== task.amountUSD) ? task.amountUSD : undefined,
          // Update amountUSD to the approved amount if different
          amountUSD: receivedAmount || task.amountUSD,
          // Si el monto aprobado es diferente al solicitado (y se proporcionó receivedAmount), agregar nota
          adminNotes: (receivedAmount && receivedAmount !== task.amountUSD)
            ? `La solicitud se aprobó con un monto de $${receivedAmount}, ya que fue lo que se recibió en la wallet`
            : undefined
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              username: true,
              capitalUSDT: true,
              currentBalanceUSDT: true
            }
          }
        }
      });

      // Mark BTC address as USED if it was assigned from pool
      if (task.assignedAddress) {
        await tx.btcAddressPool.update({
          where: { address: task.assignedAddress },
          data: {
            status: 'USED',
            usedAt: new Date(),
            usedByUserId: task.userId,
            receivedAmount: receivedAmount || task.amountUSD, // Store the received amount
          },
        });
      }

      // Handle referral commission if this is first deposit
      if (isFirstDeposit && task.user.referrerId) {
        // Get commission rate from system config (dynamic)
        const { getSystemConfig } = await import('./config.service.js');
        const referralCommissionRate = parseFloat(
          await getSystemConfig('REFERRAL_COMMISSION_RATE')
        );
        const commissionAmount = amountToAdd * referralCommissionRate;

        // Get referrer info
        const referrer = await tx.user.findUnique({
          where: { id: task.user.referrerId }
        });

        if (referrer) {
          // Determine where to add the bonus
          // If referrer has capital, bonus goes to profit (currentBalance only)
          // If referrer has no capital, bonus goes to capital (both capital and balance)
          const hasCapital = (referrer.capitalUSDT || 0) > 0;

          await tx.user.update({
            where: { id: task.user.referrerId },
            data: {
              // If no capital, add to capital. Otherwise just to balance
              capitalUSDT: hasCapital ? undefined : { increment: commissionAmount },
              currentBalanceUSDT: { increment: commissionAmount },
              // Upgrade referrer to 6% passive income rate
              passiveIncomeRate: 0.06,
              hasSuccessfulReferral: true
            }
          });

          // Create commission record
          await tx.referralCommission.create({
            data: {
              referrerId: task.user.referrerId,
              referredUserId: task.userId,
              depositAmount: amountToAdd,
              commissionRate: referralCommissionRate,
              commissionAmount,
              depositTaskId: id
            }
          });

          // Create transaction for referrer
          await tx.transaction.create({
            data: {
              userId: task.user.referrerId,
              type: 'PROFIT',
              amountUSDT: commissionAmount,
              reference: `Bono por referido: ${task.user.name} (${(referralCommissionRate * 100).toFixed(0)}%)`,
              status: 'COMPLETED'
            }
          });
        }
      }
    });
  } else if (task.type === 'WITHDRAWAL' || task.type === 'LIQUIDATION') {
    const amountToDeduct = task.amountUSD;
    const newBalance = (task.user.currentBalanceUSDT || 0) - amountToDeduct;

    await prisma.$transaction(async (tx) => {
      // Update user balance
      const updateData: any = {
        currentBalanceUSDT: newBalance
      };

      // If it's a liquidation, also reset capital AND block account
      if (task.type === 'LIQUIDATION') {
        const currentBalance = task.user.currentBalanceUSDT || 0;
        const currentCapital = task.user.capitalUSDT || 0;
        const profit = Math.max(0, currentBalance - currentCapital);

        updateData.capitalUSDT = 0;
        updateData.currentBalanceUSDT = 0; // Reset balance to 0 (forfeit profit)
        updateData.isBlocked = true;
        updateData.blockedAt = new Date();
        updateData.blockedReason = `Liquidación Aprobada. Profit retenido: $${profit.toFixed(2)}`;
      }

      // SPEC 4: Check if this is a full withdrawal after cycle completion
      if (task.type === 'WITHDRAWAL') {
        const capital = task.user.capitalUSDT || 0;
        const currentBalance = task.user.currentBalanceUSDT || 0;
        const availableProfit = currentBalance - capital;
        const isFullWithdrawal = (availableProfit - amountToDeduct) <= 0.01; // Allow small rounding errors

        // Import cycle completion check
        const { hasCycleCompleted } = await import('../utils/contract-calculations.js');
        const cycleCompleted = await hasCycleCompleted(task.userId);

        if (isFullWithdrawal && cycleCompleted) {
          // Reset contract - user withdrew all profit after completing cycle
          updateData.capitalUSDT = 0;
          updateData.currentBalanceUSDT = 0;
          updateData.investmentClass = null;
          updateData.contractStatus = 'PENDING_PLAN_SELECTION';
          updateData.cycleCompleted = false;
          updateData.cycleCompletedAt = null;
          updateData.currentPlanStartDate = null;
          updateData.currentPlanExpiryDate = null;
          updateData.lastCommissionChargeDate = null;
        }
      }

      await tx.user.update({
        where: { id: task.userId },
        data: updateData
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: task.userId,
          type: task.type === 'LIQUIDATION' ? 'WITHDRAWAL' : 'WITHDRAWAL',
          amountUSDT: amountToDeduct,
          reference: (task.liquidationDetails as any)?.type === 'PROFIT_LIQUIDATION' && task.user.contractStatus === 'COMPLETED'
            ? 'Liquidación al completar meta del 200%'
            : (task.txid || task.reference || 'Retiro parcial de profit'),
          status: 'COMPLETED'
        }
      });

      // Update task status
      updatedTask = await tx.task.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          approvedByAdmin: adminEmail
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              username: true,
              capitalUSDT: true,
              currentBalanceUSDT: true
            }
          }
        }
      });
    });
  }

  return updatedTask;
};

export const rejectTask = async (id: string, adminEmail: string, adminRole: string, rejectionReason?: string, adminId?: string) => {
  const task = await prisma.task.findUnique({ where: { id } });

  if (!task) throw new Error('Tarea no encontrada');

  // --- Logic for Review/Rejection ---

  // 1. Collaborator Tasks
  if (task.collaboratorId || task.destinationUserId) {
    const isAssignedCollaborator = (task.collaboratorId === adminId) || (task.destinationUserId === adminId);
    if (adminRole !== 'SUPERADMIN' && !isAssignedCollaborator) {
      throw new Error('No tienes permiso para rechazar esta tarea.');
    }
    // Rejection is FINAL (REJECTED)
  }
  // 2. Direct Tasks
  else {
    if (adminRole === 'SUBADMIN') {
      // Subadmin Action: Pre-reject
      return await prisma.task.update({
        where: { id },
        data: {
          status: 'PRE_REJECTED',
          approvedByAdmin: adminEmail,
          rejectionReason
        },
        include: { user: true } // Simplified include
      });
    }
    // Superadmin Action: Final Reject (REJECTED)
  }

  // Final Rejection Logic (REJECTED status)
  const rejectedTask = await prisma.task.update({
    where: { id },
    data: {
      status: 'REJECTED',
      approvedByAdmin: adminEmail,
      rejectionReason
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          username: true
        }
      }
    }
  });

  // Si la tarea tiene una dirección BTC asignada, liberarla automáticamente
  // Si la tarea tiene una dirección BTC asignada, verificar si se debe liberar
  if (task.assignedAddress) {
    // 1. Verificar si hay OTRAS tareas pendientes para esta misma dirección
    const otherPendingTasksCount = await prisma.task.count({
      where: {
        assignedAddress: task.assignedAddress,
        status: { in: ['PENDING', 'PRE_APPROVED'] },
        id: { not: id } // Excluir la tarea actual que se está rechazando
      }
    });

    if (otherPendingTasksCount === 0) {
      // Si no hay más tareas pendientes, liberar la dirección completamente
      await prisma.btcAddressPool.updateMany({
        where: {
          address: task.assignedAddress,
          status: 'RESERVED',
        },
        data: {
          status: 'AVAILABLE',
          reservedAt: null,
          reservedForTaskId: null,
          reservedByUserId: null,
          requestedAmount: null, // Clear amount
        },
      });
    } else {
      // Si hay otras tareas, MANTENER reservada pero DESCONTAR el monto de esta tarea rechazadada
      // Aseguramos no bajar de 0
      // Nota: updateMany no soporta decremento directo seguro si no es unique, pero address es unique en el pool
      // Usamos update con findUnique o updateMany cauto.
      // Como 'address' es campo único en btcAddressPool (o debería serlo), usamos update con where unique si es posible,
      // pero btcAddressPool key es ID. Podemos buscar el pool por address primero o usar updateMany.
      // Usaremos updateMany con decremento, asumiendo que el monto no es null.

      const poolEntry = await prisma.btcAddressPool.findUnique({ where: { address: task.assignedAddress } });
      if (poolEntry && poolEntry.requestedAmount !== null) {
        const newAmount = Math.max(0, Number(poolEntry.requestedAmount) - Number(task.amountUSD));
        await prisma.btcAddressPool.update({
          where: { id: poolEntry.id },
          data: { requestedAmount: newAmount }
        });
      }
    }
  }

  return rejectedTask;
};

export const toggleCollaboratorVerification = async (id: string, verified: boolean) => {
  const task = await prisma.task.update({
    where: { id },
    data: {
      collaboratorVerified: verified
    }
  });

  return task;
};

// Stats
export const getStats = async () => {
  const [
    totalUsers,
    totalActiveInvestors,
    totalTasks,
    pendingTasks,
    totalDeposits,
    totalWithdrawals
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.count({
      where: {
        role: 'USER',
        capitalUSDT: { gt: 0 }
      }
    }),
    prisma.task.count(),
    prisma.task.count({ where: { status: 'PENDING' } }),
    prisma.transaction.aggregate({
      where: { type: 'DEPOSIT' },
      _sum: { amountUSDT: true }
    }),
    prisma.transaction.aggregate({
      where: { type: 'WITHDRAWAL' },
      _sum: { amountUSDT: true }
    })
  ]);

  return {
    totalUsers,
    totalActiveInvestors,
    totalTasks,
    pendingTasks,
    totalDeposits: totalDeposits._sum.amountUSDT || 0,
    totalWithdrawals: totalWithdrawals._sum.amountUSDT || 0
  };
};

export const getRecentTransactions = async (limit: number = 10) => {
  const transactions = await prisma.transaction.findMany({
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          username: true
        }
      }
    }
  });

  return transactions;
};

// Collaborator Management
export const getAllStaff = async () => {
  const staff = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'SUPERADMIN' },
        { role: 'SUBADMIN' }
      ]
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      whatsappNumber: true,
      btcDepositAddress: true,
      btcWithdrawAddress: true,
      collaboratorConfig: true,
      referralCode: true,
      createdAt: true,
      _count: {
        select: { referrals: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Map _count to referralsCount for DTO compatibility
  return staff.map(user => ({
    ...user,
    referralsCount: user._count.referrals,
    _count: undefined
  }));
};

export const createCollaborator = async (data: {
  email: string;
  password: string;
  name: string;
  username: string;
  whatsappNumber?: string;
}) => {
  // Check if email or username already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email: data.email },
        { username: data.username }
      ]
    }
  });

  if (existingUser) {
    throw new Error('El email o nombre de usuario ya está en uso');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, 10);

  // Create collaborator with SUBADMIN role
  const collaborator = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      username: data.username,
      role: 'SUBADMIN',
      whatsappNumber: data.whatsappNumber,
      collaboratorConfig: {
        commission: 0.05, // Default 5%
        processingTime: '15-30 min',
        minAmount: 50,
        maxAmount: 10000,
        isActive: true
      }
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      whatsappNumber: true,
      collaboratorConfig: true,
      createdAt: true
    }
  });

  return collaborator;
};

export const updateCollaboratorConfig = async (id: string, config: any) => {
  // Extract walletAddress to save as btcWithdrawAddress
  const { walletAddress, ...collaboratorConfigData } = config;

  const user = await prisma.user.update({
    where: { id },
    data: {
      collaboratorConfig: collaboratorConfigData,
      whatsappNumber: config.whatsappNumber,
      btcWithdrawAddress: walletAddress || null
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      whatsappNumber: true,
      btcWithdrawAddress: true,
      collaboratorConfig: true
    }
  });

  return user;
};
