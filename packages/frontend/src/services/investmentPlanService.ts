import { apiClient } from './api';

export interface InvestmentPlan {
  id: string;
  name: string;
  minCapital: number;
  minDailyReturn: number;
  maxDailyReturn: number;
  dailyAverage: number;
  monthlyCommission: number;
  referralCommissionRate: number; // Added field
  doublingTime: string;
  description?: string;
}

export const investmentPlanService = {
  async getAllPlans(): Promise<InvestmentPlan[]> {
    const response = await apiClient.get<InvestmentPlan[]>('/investment-plans');
    return response.data;
  },

  async createPlan(data: Omit<InvestmentPlan, 'id'>): Promise<InvestmentPlan> {
    const response = await apiClient.post<InvestmentPlan>('/investment-plans', data);
    return response.data;
  },

  async updatePlan(id: string, data: Partial<InvestmentPlan>): Promise<InvestmentPlan> {
    const response = await apiClient.put<InvestmentPlan>(`/investment-plans/${id}`, data);
    return response.data;
  },

  async deletePlan(id: string): Promise<void> {
    await apiClient.delete(`/investment-plans/${id}`);
  },
};
