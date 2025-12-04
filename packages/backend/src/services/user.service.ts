import { PrismaClient, User, Transaction } from '@prisma/client';

const prisma = new PrismaClient();

export const getUserProfile = async (userId: string): Promise<Omit<User, 'password'>> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('Usuario no encontrado');
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
    throw new Error('Usuario no encontrado');
  }

  // Check if user has enough balance
  const availableProfit = user.currentBalanceUSDT - user.capitalUSDT;
  
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
  const availableProfit = user.currentBalanceUSDT - user.capitalUSDT;
  
  if (availableProfit < amountUSD) {
    throw new Error('Saldo insuficiente para reinvertir');
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
