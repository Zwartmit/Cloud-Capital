import dotenv from 'dotenv';
import app from './app.js';
import { startAddressRecyclingJob, startLowInventoryAlertJob } from './jobs/address-recycling.job.js';
// FASE 3: Import new cron jobs
import { startCommissionChargeJob } from './jobs/commission-charge.job.js';
import { startPlanExpiryCheckJob } from './jobs/plan-expiry-check.job.js';
// Passive Income: Import daily profit job
import { applyDailyPassiveProfit } from './services/daily-profit.service.js';
import cron from 'node-cron';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Cloud Capital API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`💱 BTC Network: ${process.env.BTC_NETWORK || 'testnet'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);

  // Initialize cron jobs
  startAddressRecyclingJob();
  startLowInventoryAlertJob();

  // FASE 3: Initialize new business logic cron jobs
  startCommissionChargeJob();
  startPlanExpiryCheckJob();

  // Passive Income: Run daily at 00:01 AM
  cron.schedule('1 0 * * *', async () => {
    console.log('[Cron] Running daily passive profit calculation...');
    try {
      const result = await applyDailyPassiveProfit();
      console.log(`[Cron] Daily profit completed: ${result.processed} users processed, ${result.skipped} skipped`);
    } catch (error) {
      console.error('[Cron] Daily profit failed:', error);
    }
  });

  console.log('⏰ Cron jobs initialized (including daily passive profit at 00:01)');
});
