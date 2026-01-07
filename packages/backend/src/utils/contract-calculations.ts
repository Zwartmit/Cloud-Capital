import prisma from '../config/database.js';

/**
 * Helper to determine the start date of the CURRENT cycle
 */
export const getCycleStartDate = async (userId: string): Promise<Date | null> => {
    try {
        // 1. Find the most recent REINVEST transaction
        const lastReinvest = await prisma.transaction.findFirst({
            where: { userId, type: 'REINVEST' },
            orderBy: { createdAt: 'desc' }
        });

        // 2. Find the most recent "Cycle Reset" withdrawal
        // 2. Find the most recent "Cycle Reset" withdrawal
        // expanded to include Early Liquidation
        const lastCycleReset = await prisma.transaction.findFirst({
            where: {
                userId,
                type: 'WITHDRAWAL',
                OR: [
                    { reference: 'Liquidación al completar meta del 200%' },
                    { reference: 'Liquidación Anticipada de Capital' }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        if (lastReinvest && lastCycleReset) {
            return lastReinvest.createdAt > lastCycleReset.createdAt
                ? lastReinvest.createdAt
                : lastCycleReset.createdAt;
        } else if (lastReinvest) {
            return lastReinvest.createdAt;
        } else if (lastCycleReset) {
            return lastCycleReset.createdAt;
        }

        return null;
    } catch (error) {
        console.error('Error in getCycleStartDate:', error);
        throw error;
    }
};

/**
 * Calculate total deposits for a user (for current cycle)
 */
export const calculateTotalDeposits = async (userId: string): Promise<number> => {
    const cycleStartDate = await getCycleStartDate(userId);

    const result = await prisma.transaction.aggregate({
        where: {
            userId,
            type: 'DEPOSIT',
            ...(cycleStartDate && {
                createdAt: { gt: cycleStartDate }
            })
        },
        _sum: { amountUSDT: true }
    });

    return result._sum.amountUSDT || 0;
};

/**
 * Calculate total commissions paid in the current cycle
 * Returns absolute value (positive number)
 */
export const calculateTotalCommissions = async (userId: string): Promise<number> => {
    const cycleStartDate = await getCycleStartDate(userId);

    const result = await prisma.transaction.aggregate({
        where: {
            userId,
            type: 'COMMISSION',
            ...(cycleStartDate && {
                createdAt: { gt: cycleStartDate }
            })
        },
        _sum: { amountUSDT: true }
    });

    // Commissions are stored as negative numbers, return absolute value
    return Math.abs(result._sum.amountUSDT || 0);
};

/**
 * Calculate total profit generated for a user (for current cycle)
 */
export const calculateTotalProfit = async (userId: string): Promise<number> => {
    const cycleStartDate = await getCycleStartDate(userId);

    const result = await prisma.transaction.aggregate({
        where: {
            userId,
            type: 'PROFIT',
            ...(cycleStartDate && {
                createdAt: { gt: cycleStartDate }
            })
        },
        _sum: { amountUSDT: true }
    });

    return result._sum.amountUSDT || 0;
};

/**
 * Check if user has completed their investment cycle
 */
export const hasCycleCompleted = async (userId: string): Promise<boolean> => {
    // Get user's current capital
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { capitalUSDT: true }
    });

    const currentCapital = user?.capitalUSDT || 0;
    const totalCommissions = await calculateTotalCommissions(userId);

    // Base capital for target is Current Capital + Paid Commissions
    // This represents the "Gross Capital" invested by the user
    const baseCapital = currentCapital + totalCommissions;

    const totalProfit = await calculateTotalProfit(userId);

    return totalProfit >= (baseCapital * 2) && baseCapital > 0;
};

/**
 * Check if user can generate profit
 */
export const canGenerateProfit = async (userId: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            contractStatus: true,
            cycleCompleted: true,
            capitalUSDT: true
        }
    });

    if (!user) return false;

    if (user.cycleCompleted) return false;
    if (user.contractStatus !== 'ACTIVE') return false;
    if (!user.capitalUSDT || user.capitalUSDT <= 0) return false;

    const cycleCompleted = await hasCycleCompleted(userId);
    if (cycleCompleted) {
        await prisma.user.update({
            where: { id: userId },
            data: {
                cycleCompleted: true,
                cycleCompletedAt: new Date(),
                contractStatus: 'COMPLETED'
            }
        });
        return false;
    }

    return true;
};

/**
 * Get cycle progress for a user
 */
export const getCycleProgress = async (userId: string): Promise<{
    totalDeposits: number;
    totalProfit: number;
    targetProfit: number;
    progressPercentage: number;
    isCompleted: boolean;
}> => {
    try {
        // Get user's current capital
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { capitalUSDT: true }
        });

        const currentCapital = user?.capitalUSDT || 0;
        const totalCommissions = await calculateTotalCommissions(userId);

        // Target Base = Current Capital + Commissions Paid
        // Ensures target is 200% of what user put in, not what remains after fees
        const baseCapital = currentCapital + totalCommissions;

        const totalDeposits = await calculateTotalDeposits(userId);
        const totalProfit = await calculateTotalProfit(userId);

        const targetProfit = baseCapital * 2;
        const progressPercentage = targetProfit > 0 ? (totalProfit / targetProfit) * 100 : 0;
        const isCompleted = totalProfit >= targetProfit && targetProfit > 0;

        return {
            totalDeposits,
            totalProfit,
            targetProfit,
            progressPercentage: Math.min(progressPercentage, 100),
            isCompleted
        };
    } catch (error) {
        console.error('Error in getCycleProgress:', error);
        throw error;
    }
};

/**
 * Calculate available profit for withdrawal
 */
export const calculateAvailableProfit = async (userId: string): Promise<number> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            capitalUSDT: true,
            currentBalanceUSDT: true
        }
    });

    if (!user) return 0;

    const capital = user.capitalUSDT || 0;
    const balance = user.currentBalanceUSDT || 0;
    const availableProfit = balance - capital;

    return Math.max(availableProfit, 0);
};

/**
 * Check if plan commission is due
 */
export const isPlanCommissionDue = async (userId: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            investmentClass: true,
            currentPlanStartDate: true,
            lastCommissionChargeDate: true
        }
    });

    if (!user || !user.investmentClass) return false;
    if (!user.currentPlanStartDate) return true;

    if (!user.lastCommissionChargeDate) return true;

    const daysSinceLastCharge = Math.floor(
        (Date.now() - user.lastCommissionChargeDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastCharge >= 30;
};

/**
 * Check if plan has expired
 */
export const hasPlanExpired = async (userId: string): Promise<boolean> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            currentPlanExpiryDate: true
        }
    });

    if (!user || !user.currentPlanExpiryDate) return false;

    return new Date() > user.currentPlanExpiryDate;
};
