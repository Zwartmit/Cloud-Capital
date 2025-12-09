import { PrismaClient, InvestmentClass } from '@prisma/client';

const prisma = new PrismaClient();

interface DailyRateInput {
  date: string; // ISO Date string (YYYY-MM-DD)
  rates: {
    investmentClass: InvestmentClass;
    rate: number;
  }[];
}

export const setDailyRates = async (data: DailyRateInput) => {
  const date = new Date(data.date);
  
  // Create or update rates for each class
  const results = await Promise.all(
    data.rates.map(async (item) => {
      // Check if already processed
      const existing = await prisma.dailyProfitRate.findUnique({
        where: {
          date_investmentClass: {
            date: date,
            investmentClass: item.investmentClass
          }
        }
      });

      if (existing && existing.processed) {
        throw new Error(`Profit for ${item.investmentClass} on ${data.date} has already been processed and cannot be modified.`);
      }

      return prisma.dailyProfitRate.upsert({
        where: {
          date_investmentClass: {
            date: date,
            investmentClass: item.investmentClass
          }
        },
        update: {
          rate: item.rate
        },
        create: {
          date: date,
          investmentClass: item.investmentClass,
          rate: item.rate,
          processed: false
        }
      });
    })
  );

  return results;
};

export const getDailyRates = async (dateStr: string) => {
  const date = new Date(dateStr);
  return prisma.dailyProfitRate.findMany({
    where: {
      date: date
    }
  });
};

export const processDailyProfits = async (dateStr?: string) => {
  // If no date provided, default to yesterday (assuming cron runs at 00:00 for the previous day)
  let targetDate: Date;
  if (dateStr) {
    targetDate = new Date(dateStr);
  } else {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0); // Normalize to midnight
    targetDate = yesterday;
  }

  // Get rates for the target date that are NOT processed
  const rates = await prisma.dailyProfitRate.findMany({
    where: {
      date: targetDate,
      processed: false
    }
  });

  if (rates.length === 0) {
    console.log(`No unprocessed rates found for ${targetDate.toISOString()}`);
    return { processed: 0, message: 'No unprocessed rates found' };
  }

  let totalProcessed = 0;

  for (const rateRecord of rates) {
    // Find users with this investment class and positive capital
    const users = await prisma.user.findMany({
      where: {
        investmentClass: rateRecord.investmentClass,
        capitalUSDT: { gt: 0 }
      }
    });

    // Process each user
    for (const user of users) {
        if (!user.capitalUSDT) continue;

        const profitAmount = user.capitalUSDT * (rateRecord.rate / 100);

        // Update user balance
        await prisma.user.update({
            where: { id: user.id },
            data: {
                currentBalanceUSDT: (user.currentBalanceUSDT || 0) + profitAmount
            }
        });

        // Create transaction record
        await prisma.transaction.create({
            data: {
                userId: user.id,
                type: 'PROFIT',
                amountUSDT: profitAmount,
                reference: `Rendimiento día ${targetDate.toISOString().split('T')[0]} - ${rateRecord.rate}%`,
                status: 'COMPLETED'
            }
        });
        
        totalProcessed++;
    }

    // Mark rate as processed
    await prisma.dailyProfitRate.update({
        where: { id: rateRecord.id },
        data: { processed: true }
    });
  }

  return { processed: totalProcessed, message: `Profits procesados con éxito para ${rates.length} planes.` };
};
