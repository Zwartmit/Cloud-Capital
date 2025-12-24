import dotenv from 'dotenv';
import app from './app.js';
import { startAddressRecyclingJob, startLowInventoryAlertJob } from './jobs/address-recycling.job.js';

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
  console.log('⏰ Cron jobs initialized');
});
