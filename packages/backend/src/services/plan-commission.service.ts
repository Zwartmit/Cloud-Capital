import prisma from '../config/database.js';
import { isPlanCommissionDue } from '../utils/contract-calculations.js';

/**
 * Charge plan commission for a user
 * SPEC 1: Commission charged once per 30-day period
 * Priority: First from PROFIT, then from CAPITAL if insufficient
 */
export const chargePlanCommission = async (userId: string): Promise<{
    charged: boolean;
    amount: number;
    source: 'PROFIT' | 'CAPITAL' | 'MIXED';
    message: string;
}> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            investmentClass: true,
            capitalUSDT: true,
            currentBalanceUSDT: true,
            lastCommissionChargeDate: true,
            currentPlanStartDate: true
        }
    });

    if (!user || !user.investmentClass) {
        return { charged: false, amount: 0, source: 'PROFIT', message: 'Usuario no tiene plan activo' };
    }

    // Check if commission is due
    const isDue = await isPlanCommissionDue(userId);
    if (!isDue) {
        return { charged: false, amount: 0, source: 'PROFIT', message: 'Comisión ya fue cobrada este período' };
    }

    // Get plan details
    const plan = await prisma.investmentPlan.findFirst({
        where: { name: user.investmentClass }
    });

    if (!plan) {
        return { charged: false, amount: 0, source: 'PROFIT', message: 'Plan no encontrado' };
    }

    const capital = user.capitalUSDT || 0;
    const balance = user.currentBalanceUSDT || 0;
    const availableProfit = balance - capital;

    // Calculate commission amount (percentage of capital)
    const commissionAmount = capital * (plan.monthlyCommission / 100);

    let source: 'PROFIT' | 'CAPITAL' | 'MIXED' = 'PROFIT';
    let newBalance = balance;
    let newCapital = capital;

    // SPEC 1: Priority - First from PROFIT, then from CAPITAL
    if (availableProfit >= commissionAmount) {
        // Sufficient profit to cover commission
        newBalance = balance - commissionAmount;
        source = 'PROFIT';
    } else if (availableProfit > 0) {
        // Partial profit, rest from capital
        const fromProfit = availableProfit;
        const fromCapital = commissionAmount - fromProfit;
        newBalance = capital; // All profit consumed
        newCapital = capital - fromCapital;
        source = 'MIXED';
    } else {
        // No profit, take from capital
        newCapital = capital - commissionAmount;
        newBalance = newCapital; // Balance = capital when no profit
        source = 'CAPITAL';
    }

    // Validate that user has enough funds
    if (newCapital < 0) {
        return {
            charged: false,
            amount: 0,
            source: 'CAPITAL',
            message: 'Fondos insuficientes para cobrar comisión'
        };
    }

    // Update user and create transaction
    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: { id: userId },
            data: {
                capitalUSDT: newCapital,
                currentBalanceUSDT: newBalance,
                lastCommissionChargeDate: new Date()
            }
        });

        await tx.transaction.create({
            data: {
                userId,
                type: 'WITHDRAWAL', // Commission is a withdrawal
                amountUSDT: commissionAmount,
                reference: `Comisión mensual del plan ${user.investmentClass} (${plan.monthlyCommission}%)`,
                status: 'COMPLETED'
            }
        });
    });

    return {
        charged: true,
        amount: commissionAmount,
        source,
        message: `Comisión de $${commissionAmount.toFixed(2)} cobrada desde ${source}`
    };
};

/**
 * Charge commissions for all users with active plans
 * Should be run as a cron job daily or weekly
 */
export const chargeAllPlanCommissions = async (): Promise<{
    processed: number;
    charged: number;
    totalAmount: number;
    errors: string[];
}> => {
    const users = await prisma.user.findMany({
        where: {
            investmentClass: { not: null },
            contractStatus: 'ACTIVE'
        },
        select: {
            id: true,
            name: true,
            investmentClass: true
        }
    });

    let processed = 0;
    let charged = 0;
    let totalAmount = 0;
    const errors: string[] = [];

    for (const user of users) {
        try {
            const result = await chargePlanCommission(user.id);
            processed++;

            if (result.charged) {
                charged++;
                totalAmount += result.amount;
                console.log(`✓ ${user.name}: ${result.message}`);
            }
        } catch (error) {
            const errorMsg = `Error cobrando comisión a ${user.name}: ${error}`;
            errors.push(errorMsg);
            console.error(errorMsg);
        }
    }

    return {
        processed,
        charged,
        totalAmount,
        errors
    };
};

/**
 * Check if a user's plan has expired and needs renewal
 */
export const checkPlanExpiry = async (userId: string): Promise<{
    expired: boolean;
    daysRemaining: number;
    expiryDate: Date | null;
}> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            currentPlanExpiryDate: true
        }
    });

    if (!user || !user.currentPlanExpiryDate) {
        return { expired: false, daysRemaining: 0, expiryDate: null };
    }

    const now = new Date();
    const expiryDate = user.currentPlanExpiryDate;
    const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
        expired: now > expiryDate,
        daysRemaining: Math.max(daysRemaining, 0),
        expiryDate
    };
};
