import prisma from '../config/database.js';

/**
 * Apply daily passive profit to all eligible users
 * Runs daily via cron job
 */
export const applyDailyPassiveProfit = async () => {
    try {
        // Find users eligible for passive income:
        // - Has made first deposit
        // - Has passive income rate > 0
        // - NOT subscribed to a plan (investmentClass is null)
        // - Has capital > 0
        const users = await prisma.user.findMany({
            where: {
                hasFirstDeposit: true,
                passiveIncomeRate: { gt: 0 },
                investmentClass: null,
                capitalUSDT: { gt: 0 }
            }
        });

        console.log(`[Daily Profit] Processing ${users.length} eligible users...`);

        let processedCount = 0;
        let skippedCount = 0;

        for (const user of users) {
            const today = new Date();
            const lastProfit = user.lastDailyProfitDate;

            // Check if profit was already applied today
            if (lastProfit && isSameDay(lastProfit, today)) {
                skippedCount++;
                continue;
            }

            // Calculate daily profit
            // passiveIncomeRate is monthly (0.03 or 0.06)
            // Daily rate = monthly rate / 30
            const dailyRate = user.passiveIncomeRate / 30;
            const dailyProfit = user.capitalUSDT! * dailyRate;

            // Apply profit to balance
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    currentBalanceUSDT: { increment: dailyProfit },
                    lastDailyProfitDate: today
                }
            });

            // Create transaction record
            await prisma.transaction.create({
                data: {
                    userId: user.id,
                    type: 'DAILY_PROFIT',
                    amountUSDT: dailyProfit,
                    reference: `Ganancia diaria pasiva (${(dailyRate * 100).toFixed(3)}%)`,
                    status: 'COMPLETED'
                }
            });

            processedCount++;
        }

        console.log(`[Daily Profit] Completed: ${processedCount} processed, ${skippedCount} skipped (already processed today)`);

        return {
            success: true,
            processed: processedCount,
            skipped: skippedCount
        };
    } catch (error) {
        console.error('[Daily Profit] Error:', error);
        throw error;
    }
};

/**
 * Helper function to check if two dates are the same day
 */
function isSameDay(date1: Date, date2: Date): boolean {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
}
