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

// CORS configuration - Allow multiple origins for local development
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.137.1:5173',
  'http://192.168.101.22:5173',
  'http://192.168.56.1:5173',
  'http://172.24.112.1:5173',
];

// Add FRONTEND_URL from env if it exists and is not already in the list
if (process.env.FRONTEND_URL && !allowedOrigins.includes(process.env.FRONTEND_URL)) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
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

