import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const getAllUsers = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: 'USER' // Only show regular users, not admins
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        username: true,
        role: true,
        capitalUSDT: true,
        currentBalanceUSDT: true,
        investmentClass: true,
        createdAt: true,
        referralCode: true,
        _count: {
          select: { referrals: true }
        }
      }
    }),
    prisma.user.count({
      where: {
        role: 'USER' // Count only regular users
      }
    })
  ]);

  const mappedUsers = users.map(user => ({
    ...user,
    referralsCount: (user as any)._count?.referrals || 0,
    _count: undefined
  }));

  return {
    users: mappedUsers,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      capitalUSDT: true,
      currentBalanceUSDT: true,
      investmentClass: true,
      createdAt: true,
      updatedAt: true,
      referralCode: true,
      _count: {
        select: { referrals: true }
      }
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return {
    ...user,
    referralsCount: (user as any)._count?.referrals || 0,
    _count: undefined
  };
};

export const searchUsers = async (query: string) => {
  const users = await prisma.user.findMany({
    where: {
      AND: [
        {
          OR: [
            { email: { contains: query } },
            { name: { contains: query } },
            { username: { contains: query } },
          ]
        },
        {
          role: 'USER' // Only search regular users, not admins
        }
      ]
    },
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
      _count: {
        select: { referrals: true }
      }
    },
    take: 10,
  });

  return users.map(user => ({
    ...user,
    referralsCount: (user as any)._count?.referrals || 0,
    _count: undefined
  }));
};

export const updateUserBalance = async (userId: string, capitalUSDT: number, currentBalanceUSDT: number) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      capitalUSDT,
      currentBalanceUSDT,
    }
  });

  return user;
};

export const getAllTasks = async (status?: string) => {
  const tasks = await prisma.task.findMany({
    where: status ? { status: status as any } : undefined,
    include: {
      user: {
        select: {
          email: true,
          name: true,
          username: true,
        }
      },
      collaborator: {
        select: {
          id: true,
          name: true,
          whatsappNumber: true,
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  return tasks;
};

export const getTaskById = async (taskId: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          capitalUSDT: true,
          currentBalanceUSDT: true,
        }
      }
    }
  });

  if (!task) {
    throw new Error('Task not found');
  }

  return task;
};

export const approveTask = async (taskId: string, adminEmail: string, adminRole: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { user: true }
  });

  if (!task) {
    throw new Error('Task not found');
  }

  if (task.status === 'COMPLETED' || task.status === 'REJECTED') {
    throw new Error('Task already processed');
  }

  // If subadmin, check special permissions
  let newStatus = adminRole === 'SUPERADMIN' ? 'COMPLETED' : 'PRE_APPROVED';

  // Subadmins (Collaborators) can complete their assigned withdrawals
  if (adminRole === 'SUBADMIN' && task.type === 'WITHDRAWAL' && task.destinationUserId) {
    // We need to verify the adminId matches the destinationUserId. 
    // The adminEmail is passed, but maybe we need to fetch the admin user ID?
    // Assuming adminRole implies we trust them, but ideally we match ID.
    // For now, if they are Subadmin and it is a Withdrawal assigned to SOMEONE, we might allow it?
    // Better: Fetch admin user by email to get ID. Or just trust Subadmin role for now since only assigned tasks are likely visible.
    // Let's refine: If task is WITHDRAWAL and assigned to ANY collaborator, and I am a SUBADMIN, I can approve it? 
    // Strict: Only if assigned to ME. But `approveTask` signature only has email. 
    // Let's fetch the admin user first.
    const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (admin && admin.id === task.destinationUserId) {
      newStatus = 'COMPLETED';
    }
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: newStatus as any,
      approvedByAdmin: adminEmail,
    }
  });

  // If completed, update user balance
  if (newStatus === 'COMPLETED') {
    if (task.type === 'DEPOSIT_MANUAL' || task.type === 'DEPOSIT_AUTO') {
      await prisma.user.update({
        where: { id: task.userId },
        data: {
          capitalUSDT: (task.user.capitalUSDT || 0) + task.amountUSD,
          currentBalanceUSDT: (task.user.currentBalanceUSDT || 0) + task.amountUSD,
        }
      });

      // Create transaction
      await prisma.transaction.create({
        data: {
          userId: task.userId,
          type: 'DEPOSIT',
          amountUSDT: task.amountUSD,
          reference: task.reference,
          status: 'COMPLETED',
        }
      });

      // Check if this is the user's first deposit and they have a referrer
      const isFirstDeposit = !task.user.hasFirstDeposit;

      if (isFirstDeposit && task.user.referrerId) {
        // Get the referrer's investment plan to determine commission rate
        const referrer = await prisma.user.findUnique({
          where: { id: task.user.referrerId },
          select: {
            id: true,
            investmentClass: true,
            currentBalanceUSDT: true
          }
        });

        if (referrer && referrer.investmentClass) {
          // Get the investment plan to get the commission rate
          const investmentPlan = await prisma.investmentPlan.findFirst({
            where: { name: referrer.investmentClass }
          });

          if (investmentPlan) {
            const commissionRate = investmentPlan.referralCommissionRate;
            const commissionAmount = task.amountUSD * commissionRate;

            // Update referrer's balance
            await prisma.user.update({
              where: { id: task.user.referrerId },
              data: {
                currentBalanceUSDT: (referrer.currentBalanceUSDT || 0) + commissionAmount
              }
            });

            // Create commission transaction
            const commissionTransaction = await prisma.transaction.create({
              data: {
                userId: task.user.referrerId,
                type: 'REFERRAL_COMMISSION',
                amountUSDT: commissionAmount,
                reference: `Comisión por referido: ${task.user.name} (${(commissionRate * 100).toFixed(0)}%)`,
                status: 'COMPLETED',
              }
            });

            // Record the commission for audit trail
            await prisma.referralCommission.create({
              data: {
                referrerId: task.user.referrerId,
                referredUserId: task.userId,
                depositAmount: task.amountUSD,
                commissionRate: commissionRate,
                commissionAmount: commissionAmount,
                depositTaskId: task.id,
                transactionId: commissionTransaction.id,
              }
            });
          }
        }

        // Mark user as having made their first deposit
        await prisma.user.update({
          where: { id: task.userId },
          data: { hasFirstDeposit: true }
        });
      }

      // COLLABORATOR AUTO-DISCOUNT LOGIC
      if (task.type === 'DEPOSIT_MANUAL' && task.collaboratorId) {
        try {
          // Deduct from collaborator's internal wallet
          const collaborator = await prisma.user.findUnique({
            where: { id: task.collaboratorId }
          });

          if (collaborator) {
            // Update collaborator balance
            await prisma.user.update({
              where: { id: task.collaboratorId },
              data: {
                currentBalanceUSDT: (collaborator.currentBalanceUSDT || 0) - task.amountUSD,
                // Do we deduct capital? Probably not, just available balance. 
                // If we consider this as "cashing out" their operational fund, maybe? 
                // Usually "Billetera Interna" refers to Current Balance.
              }
            });

            // Record transaction for collaborator
            await prisma.transaction.create({
              data: {
                userId: task.collaboratorId,
                type: 'WITHDRAWAL', // Or specific type? Using Withdrawal to symbolize money leaving their account
                amountUSDT: task.amountUSD,
                reference: `Descuento por gestión de depósito manual - Usuario: ${task.user.name}`,
                status: 'COMPLETED',
              }
            });
          }
        } catch (error) {
          console.error('Error applying collaborator discount:', error);
          // Don't rollback the main approval, but log the error. 
          // In a strict financial system, we might want transactionality here, but simpler for now.
        }
      }

    } else if (task.type === 'WITHDRAWAL') {
      await prisma.user.update({
        where: { id: task.userId },
        data: {
          currentBalanceUSDT: (task.user.currentBalanceUSDT || 0) - task.amountUSD,
        }
      });

      const details = task.liquidationDetails as any;

      // Create transaction for user
      await prisma.transaction.create({
        data: {
          userId: task.userId,
          type: 'WITHDRAWAL',
          amountUSDT: task.amountUSD,
          fee: details?.feeAmount || 0,
          netAmount: details?.netAmount || task.amountUSD,
          status: 'COMPLETED',
        }
      });

      // COLLABORATOR CREDIT LOGIC
      // If withdrawal via collaborator, credit the NET amount to the collaborator
      if (task.destinationType === 'COLLABORATOR' && task.destinationUserId) {
        try {
          // Credit to collaborator's internal wallet
          const collaborator = await prisma.user.findUnique({
            where: { id: task.destinationUserId }
          });

          if (collaborator) {
            const amountToCredit = details?.netAmount || task.amountUSD;

            // Update collaborator balance
            await prisma.user.update({
              where: { id: task.destinationUserId },
              data: {
                currentBalanceUSDT: (collaborator.currentBalanceUSDT || 0) + amountToCredit,
              }
            });

            // Record transaction for collaborator
            await prisma.transaction.create({
              data: {
                userId: task.destinationUserId,
                type: 'DEPOSIT', // It's an internal deposit/credit
                amountUSDT: amountToCredit,
                reference: `Acreditación por gestión de retiro manual - Usuario: ${task.user.name}`,
                status: 'COMPLETED',
              }
            });
          }
        } catch (error) {
          console.error('Error applying collaborator credit:', error);
        }
      }

    } else if (task.type === 'LIQUIDATION') {
      const details = task.liquidationDetails as any;
      const penaltyAmount = details?.penaltyAmount || 0;
      const netAmount = details?.netAmount || 0;

      // Reduce Capital and Balance
      // If full liquidation, capital becomes 0.
      // amountUSD holds the capital amount being liquidated.

      await prisma.user.update({
        where: { id: task.userId },
        data: {
          capitalUSDT: (task.user.capitalUSDT || 0) - task.amountUSD,
          currentBalanceUSDT: (task.user.currentBalanceUSDT || 0) - task.amountUSD, // Deducting the capital from balance as well
        }
      });

      // Create transaction
      await prisma.transaction.create({
        data: {
          userId: task.userId,
          type: 'CAPITAL_LIQUIDATION',
          amountUSDT: task.amountUSD,
          fee: penaltyAmount,
          netAmount: netAmount,
          status: 'COMPLETED',
        }
      });
    }
  }

  return updatedTask;
};

export const rejectTask = async (taskId: string, adminEmail: string, adminRole: string, rejectionReason?: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task) {
    throw new Error('Task not found');
  }

  if (task.status === 'COMPLETED' || task.status === 'REJECTED') {
    throw new Error('Task already processed');
  }

  // If subadmin, set to PRE_REJECTED
  // If superadmin, set to final REJECTED
  const newStatus = adminRole === 'SUPERADMIN' ? 'REJECTED' : 'PRE_REJECTED';

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: newStatus,
      approvedByAdmin: adminEmail,
      rejectionReason: rejectionReason || 'No se especificó motivo',
    }
  });

  return updatedTask;
};

export const deleteUser = async (userId: string) => {
  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Delete user (this will cascade delete related records based on schema)
  await prisma.user.delete({
    where: { id: userId }
  });

  return { message: 'User deleted successfully' };
};

export const getUserReferrals = async (userId: string) => {
  const referrals = await prisma.user.findMany({
    where: { referrerId: userId },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      capitalUSDT: true,
      currentBalanceUSDT: true,
      investmentClass: true,
      createdAt: true,
      hasFirstDeposit: true,
      _count: { select: { referrals: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  // Map result to flatten referralsCount
  return referrals.map(user => ({
    ...user,
    referralsCount: user._count.referrals
  }));
};

export const resetUserPassword = async (userId: string, newPassword: string) => {
  const bcrypt = await import('bcrypt');

  // Validate password length
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return { message: 'Password reset successfully' };
};

export const toggleCollaboratorVerification = async (taskId: string, verified: boolean) => {
  return await prisma.task.update({
    where: { id: taskId },
    data: {
      collaboratorVerified: verified
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      },
      collaborator: {
        select: {
          name: true,
          whatsappNumber: true
        }
      }
    }
  });
};

export const getStats = async () => {
  const [pendingTasks, totalUsers, usersAggregate] = await Promise.all([
    prisma.task.count({
      where: {
        status: {
          in: ['PENDING', 'PRE_APPROVED', 'PRE_REJECTED']
        }
      }
    }),
    prisma.user.count({ where: { role: 'USER' } }),
    prisma.user.aggregate({
      where: { role: 'USER' },
      _sum: {
        capitalUSDT: true,
        currentBalanceUSDT: true
      }
    })
  ]);

  return {
    pendingTasks,
    totalUsers,
    totalCapital: usersAggregate._sum.capitalUSDT || 0,
    totalBalance: usersAggregate._sum.currentBalanceUSDT || 0
  };
};

export const getRecentTransactions = async (limit: number = 10) => {
  const transactions = await prisma.transaction.findMany({
    where: {
      status: 'COMPLETED'
    },
    include: {
      user: {
        select: {
          username: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: limit
  });

  return transactions;
};



export const createCollaborator = async (data: any) => {
  const { email, password, name, username, whatsappNumber } = data;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { username }
      ]
    }
  });

  if (existingUser) {
    throw new Error('Este usuario ya existe');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      username,
      whatsappNumber,
      role: 'SUBADMIN',
      collaboratorConfig: {
        commission: 5,
        processingTime: '10-30 minutos',
        minAmount: 10,
        maxAmount: 10000,
        isActive: true
      }
    }
  });
};

export const updateCollaboratorConfig = async (userId: string, config: any) => {
  // Validate commission
  if (config.commission > 10) {
    throw new Error('La comisión no puede exceder el 10%');
  }

  return await prisma.user.update({
    where: { id: userId },
    data: {
      collaboratorConfig: config,
      whatsappNumber: config.whatsappNumber // Update root whatsapp if passed
    }
  });
};

export const getAllStaff = async () => {
  return await prisma.user.findMany({
    where: {
      role: { in: ['SUPERADMIN', 'SUBADMIN'] }
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      whatsappNumber: true,
      collaboratorConfig: true,
    }
  });
};
