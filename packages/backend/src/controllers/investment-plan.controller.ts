import { Request, Response } from 'express';
import { investmentPlanService } from '../services/investment-plan.service.js';

export const getPlans = async (_req: Request, res: Response) => {
  try {
    const plans = await investmentPlanService.getAllPlans();
    res.json(plans);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPlanById = async (req: Request, res: Response) => {
  try {
    const plan = await investmentPlanService.getPlanById(req.params.id);
    if (!plan) {
      return res.status(404).json({ error: 'Plan no encontrado' });
    }
    res.json(plan);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createPlan = async (req: Request, res: Response) => {
  try {
    console.log('Creating plan with data:', req.body);
    const plan = await investmentPlanService.createPlan(req.body);
    res.status(201).json(plan);
  } catch (error: any) {
    console.error('Error creating plan:', error);
    res.status(400).json({ error: error.message });
  }
};

export const updatePlan = async (req: Request, res: Response) => {
  try {
    const plan = await investmentPlanService.updatePlan(req.params.id, req.body);
    res.json(plan);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deletePlan = async (req: Request, res: Response) => {
  try {
    await investmentPlanService.deletePlan(req.params.id);
    res.json({ message: 'Plan eliminado exitosamente' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
