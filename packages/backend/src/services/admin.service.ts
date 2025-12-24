import { PrismaClient, TaskStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

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

  // Map _count to referralsCount for DTO compatibility
  const users = allUsers.map(user => ({
    ...user,
    referralsCount: user._count.referrals,
    _count: undefined
  }));

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

  // Map _count to referralsCount for DTO compatibility
  return {
    ...user,
    referralsCount: user._count.referrals,
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
  return users.map(user => ({
    ...user,
    referralsCount: user._count.referrals,
    _count: undefined
  }));
};

export const updateUserBalance = async (id: string, capitalUSDT: number, currentBalanceUSDT: number) => {
  const user = await prisma.user.update({
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
      investmentClass: true
    }
  });

  return user;
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
export const getAllTasks = async (status?: string) => {
  const where = status ? { status: status as TaskStatus } : {};

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

export const approveTask = async (id: string, adminEmail: string, adminRole: UserRole) => {
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

  // Handle different task types
  let updatedTask;

  if (task.type === 'DEPOSIT_AUTO' || task.type === 'DEPOSIT_MANUAL') {
    const amountToAdd = task.adjustedAmount || task.amountUSD;
    const newCapital = (task.user.capitalUSDT || 0) + amountToAdd;
    const newBalance = (task.user.currentBalanceUSDT || 0) + amountToAdd;

    await prisma.$transaction(async (tx) => {
      // Update user balance
      await tx.user.update({
        where: { id: task.userId },
        data: {
          capitalUSDT: newCapital,
          currentBalanceUSDT: newBalance,
          hasFirstDeposit: true
        }
      });

      // Create transaction record
      await tx.transaction.create({
        data: {
          userId: task.userId,
          type: 'DEPOSIT',
          amountUSDT: amountToAdd,
          reference: task.txid || task.reference,
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

      // Mark BTC address as USED if it was assigned from pool
      if (task.assignedAddress) {
        await tx.btcAddressPool.update({
          where: { address: task.assignedAddress },
          data: {
            status: 'USED',
            usedAt: new Date(),
            usedByUserId: task.userId,
          },
        });
      }

      // Handle referral commission if this is first deposit
      if (!task.user.hasFirstDeposit && task.user.referrerId) {
        const referralCommissionRate = 0.10; // 10%
        const commissionAmount = amountToAdd * referralCommissionRate;

        // Add commission to referrer's balance
        const referrer = await tx.user.findUnique({
          where: { id: task.user.referrerId }
        });

        if (referrer) {
          await tx.user.update({
            where: { id: task.user.referrerId },
            data: {
              currentBalanceUSDT: (referrer.currentBalanceUSDT || 0) + commissionAmount
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
              reference: `Comisión por referido: ${task.user.name}`,
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
        updateData.capitalUSDT = 0;
        updateData.isBlocked = true;
        updateData.blockedAt = new Date();
        updateData.blockedReason = 'LIQUIDATION_APPROVED';
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
          reference: task.txid || task.reference,
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

export const rejectTask = async (id: string, adminEmail: string, adminRole: UserRole, rejectionReason?: string) => {
  const task = await prisma.task.update({
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
  if (task.assignedAddress) {
    await prisma.btcAddressPool.updateMany({
      where: {
        address: task.assignedAddress,
        status: 'RESERVED',
      },
      data: {
        status: 'AVAILABLE',
        reservedAt: null,
        reservedForTaskId: null,
        requestedAmount: null, // Clear amount when rejecting
      },
    });
  }

  return task;
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
      collaboratorConfig: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return staff;
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
  const user = await prisma.user.update({
    where: { id },
    data: {
      collaboratorConfig: config,
      whatsappNumber: config.whatsappNumber
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
      role: true,
      whatsappNumber: true,
      collaboratorConfig: true
    }
  });

  return user;
};
