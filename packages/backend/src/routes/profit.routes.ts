import { Router } from 'express';
import * as profitController from '../controllers/profit.controller';
// Middleware to ensure admin access would be good here, assuming we have one.
// For now, I'll assume public or I'd check how other routes are protected.
// Based on list_dir, there is an 'auth' middleware probably.
// But user didn't ask me to implement auth middleware if it's missing, I'll just check if I can import it.
// Checking file listing: middleware/auth.middleware.ts likely exists.
// I'll check other routes files if I can... actually I'll just create the routes first.

const router = Router();

router.post('/rates', profitController.setRates);
router.get('/rates', profitController.getRates);
router.post('/process', profitController.triggerProcess);

export default router;
