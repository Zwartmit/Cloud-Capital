import { PrismaClient, InvestmentPlan } from '@prisma/client';

const prisma = new PrismaClient();

export const investmentPlanService = {
  async getAllPlans(): Promise<InvestmentPlan[]> {
    return prisma.investmentPlan.findMany({
      orderBy: {
        minCapital: 'asc',
      },
    });
  },

  async getPlanById(id: string): Promise<InvestmentPlan | null> {
    return prisma.investmentPlan.findUnique({
      where: { id },
    });
  },

  async createPlan(data: Omit<InvestmentPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<InvestmentPlan> {
    return prisma.investmentPlan.create({
      data,
    });
  },

  async updatePlan(id: string, data: Partial<Omit<InvestmentPlan, 'id' | 'createdAt' | 'updatedAt'>>): Promise<InvestmentPlan> {
    return prisma.investmentPlan.update({
      where: { id },
      data,
    });
  },

  async deletePlan(id: string): Promise<InvestmentPlan> {
    return prisma.investmentPlan.delete({
      where: { id },
    });
  },
};
