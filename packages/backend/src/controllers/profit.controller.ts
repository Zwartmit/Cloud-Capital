import { Request, Response } from 'express';
import * as profitService from '../services/profit.service';

export const setRates = async (req: Request, res: Response) => {
    try {
        const { date, rates } = req.body;
        if (!date || !rates || !Array.isArray(rates)) {
            return res.status(400).json({ error: 'Invalid data format' });
        }

        const result = await profitService.setDailyRates({ date, rates });
        res.json(result);
    } catch (error: any) {
        console.error('Error setting rates:', error);
        res.status(500).json({ error: error.message || 'Error setting rates' });
    }
};

export const getRates = async (req: Request, res: Response) => {
    try {
        const { date } = req.query;
        if (!date || typeof date !== 'string') {
            return res.status(400).json({ error: 'Date is required' });
        }

        const rates = await profitService.getDailyRates(date);
        res.json(rates);
    } catch (error: any) {
        console.error('Error fetching rates:', error);
        res.status(500).json({ error: 'Error fetching rates' });
    }
};

export const triggerProcess = async (req: Request, res: Response) => {
    try {
        // Optional: Allow passing a specific date for manual trigger, otherwise defaults to yesterday logic
        const { date } = req.body;
        const result = await profitService.processDailyProfits(date);
        res.json(result);
    } catch (error: any) {
        console.error('Error processing profits:', error);
        res.status(500).json({ error: error.message || 'Error processing profits' });
    }
};
