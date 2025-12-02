import { PrismaClient, User, Transaction } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserProfile = async (userId: string): Promise<Omit<User, 'password'>> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
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
    throw new Error('User not found');
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

export const updateUserProfile = async (userId: string, data: Partial<User>): Promise<Omit<User, 'password'>> => {
  // Don't allow updating sensitive fields
  const { password, role, capitalUSDT, currentBalanceUSDT, ...allowedData } = data;

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
    throw new Error('User not found');
  }

  // Check if user has enough balance
  const availableProfit = user.currentBalanceUSDT - user.capitalUSDT;
  
  if (availableProfit < amountUSD) {
    throw new Error('Insufficient balance');
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
    throw new Error('User not found');
  }

  // Check if user has enough profit
  const availableProfit = user.currentBalanceUSDT - user.capitalUSDT;
  
  if (availableProfit < amountUSD) {
    throw new Error('Insufficient profit to reinvest');
  }

  // Update user capital and create transaction
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      capitalUSDT: user.capitalUSDT + amountUSD,
    }
  });

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      type: 'REINVEST',
      amountUSDT: amountUSD,
      status: 'COMPLETED',
    }
  });

  return { user: updatedUser, transaction };
};
