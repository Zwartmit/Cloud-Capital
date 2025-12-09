import { PrismaClient } from '@prisma/client';

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

  // If subadmin, set to PRE_APPROVED
  // If superadmin, complete the task
  const newStatus = adminRole === 'SUPERADMIN' ? 'COMPLETED' : 'PRE_APPROVED';

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: newStatus,
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
    } else if (task.type === 'WITHDRAWAL') {
      await prisma.user.update({
        where: { id: task.userId },
        data: {
          currentBalanceUSDT: (task.user.currentBalanceUSDT || 0) - task.amountUSD,
        }
      });

      // Create transaction
      await prisma.transaction.create({
        data: {
          userId: task.userId,
          type: 'WITHDRAWAL',
          amountUSDT: task.amountUSD,
          status: 'COMPLETED',
        }
      });
    }
  }

  return updatedTask;
};

export const rejectTask = async (taskId: string, adminEmail: string) => {
  const task = await prisma.task.findUnique({
    where: { id: taskId }
  });

  if (!task) {
    throw new Error('Task not found');
  }

  if (task.status === 'COMPLETED' || task.status === 'REJECTED') {
    throw new Error('Task already processed');
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'REJECTED',
      approvedByAdmin: adminEmail,
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

export const getStats = async () => {
  const pendingTasks = await prisma.task.count({
    where: {
      status: {
        in: ['PENDING', 'PRE_APPROVED']
      }
    }
  });

  return {
    pendingTasks
  };
};
