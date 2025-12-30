import prisma from '../config/database.js';

/**
 * Calculate total deposits for a user (historical sum)
 * Spec 2: Sum of ALL deposits ever made
 */
export const calculateTotalDeposits = async (userId: string): Promise<number> => {
    const result = await prisma.transaction.aggregate({
        where: {
            userId,
            type: 'DEPOSIT'
        },
        _sum: {
            amountUSDT: true
        }
    });

    return result._sum.amountUSDT || 0;
};

/**
 * Calculate total profit generated for a user (historical sum)
 * Spec 2: Sum of ALL profit ever generated, regardless of withdrawals
 */
export const calculateTotalProfit = async (userId: string): Promise<number> => {
    const result = await prisma.transaction.aggregate({
        where: {
            userId,
            type: 'PROFIT'
        },
        _sum: {
            amountUSDT: true
        }
    });

    return result._sum.amountUSDT || 0;
};

/**
 * Check if user has completed their investment cycle
 * Spec 3: Cycle is complete when total profit >= 2x total deposits
 */
export const hasCycleCompleted = async (userId: string): Promise<boolean> => {
    const totalDeposits = await calculateTotalDeposits(userId);
    const totalProfit = await calculateTotalProfit(userId);

    // Cycle completes when profit reaches or exceeds 200% of deposits
    return totalProfit >= (totalDeposits * 2);
};

/**
 * Check if user can generate profit
 * Spec 3: Cannot generate profit if cycle is completed
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

    // Cannot generate profit if:
    // 1. Cycle is already completed
    // 2. Contract status is not ACTIVE
    // 3. No capital invested
    if (user.cycleCompleted) return false;
    if (user.contractStatus !== 'ACTIVE') return false;
    if (!user.capitalUSDT || user.capitalUSDT <= 0) return false;

    // Check if cycle should be marked as completed
    const cycleCompleted = await hasCycleCompleted(userId);
    if (cycleCompleted) {
        // Mark as completed
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
 * Returns percentage of completion towards 200% goal
 */
export const getCycleProgress = async (userId: string): Promise<{
    totalDeposits: number;
    totalProfit: number;
    targetProfit: number;
    progressPercentage: number;
    isCompleted: boolean;
}> => {
    const totalDeposits = await calculateTotalDeposits(userId);
    const totalProfit = await calculateTotalProfit(userId);
    const targetProfit = totalDeposits * 2;
    const progressPercentage = totalDeposits > 0 ? (totalProfit / targetProfit) * 100 : 0;
    const isCompleted = totalProfit >= targetProfit;

    return {
        totalDeposits,
        totalProfit,
        targetProfit,
        progressPercentage: Math.min(progressPercentage, 100),
        isCompleted
    };
};

/**
 * Calculate available profit for withdrawal
 * Available profit = currentBalance - capital
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
 * Spec 1: Commission charged once per 30-day period
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
    if (!user.currentPlanStartDate) return true; // First time subscription

    // If never charged, it's due
    if (!user.lastCommissionChargeDate) return true;

    // Check if 30 days have passed since last charge
    const daysSinceLastCharge = Math.floor(
        (Date.now() - user.lastCommissionChargeDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysSinceLastCharge >= 30;
};

/**
 * Check if plan has expired
 * Spec 1: Plans expire after 30 days
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
