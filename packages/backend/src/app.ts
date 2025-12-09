import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes/index.js';
import { errorHandler } from './middleware/error.middleware.js';

const app = express();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Cloud Capital API is running' });
});

// API routes
app.use('/api', routes);

// Error handling middleware (must be last)
app.use(errorHandler);

import cron from 'node-cron';
import { processDailyProfits } from './services/profit.service.js';

// Schedule daily profit processing at 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily profit processing cron job...');
  try {
    const result = await processDailyProfits();
    console.log('Daily profit processing completed:', result);
  } catch (error) {
    console.error('Error in daily profit processing cron job:', error);
  }
});

export default app;

