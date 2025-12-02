import { PrismaClient, User, Task } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsers = async (page: number = 1, limit: number = 20) => {
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
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
      }
    }),
    prisma.user.count()
  ]);

  return {
    users,
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
    }
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
};

export const searchUsers = async (query: string) => {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query } },
        { name: { contains: query } },
        { username: { contains: query } },
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
    },
    take: 10,
  });

  return users;
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
          capitalUSDT: task.user.capitalUSDT + task.amountUSD,
          currentBalanceUSDT: task.user.currentBalanceUSDT + task.amountUSD,
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
    } else if (task.type === 'WITHDRAWAL') {
      await prisma.user.update({
        where: { id: task.userId },
        data: {
          currentBalanceUSDT: task.user.currentBalanceUSDT - task.amountUSD,
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
