import { apiClient } from './api';

export interface CycleProgress {
    totalDeposits: number;
    totalProfit: number;
    targetProfit: number;
    progressPercentage: number;
    isCompleted: boolean;
}

export interface ContractStatus {
    contractStatus: string;
    cycleCompleted: boolean;
    cycleCompletedAt: Date | null;
    investmentClass: string | null;
    currentPlanStartDate: Date | null;
    currentPlanExpiryDate: Date | null;
    capitalUSDT: number;
    currentBalanceUSDT: number;
    daysRemaining: number;
    availableProfit: number;
    totalProfit: number; // Total profit generated (before withdrawals)
    passiveIncomeRate: number;
    withdrawalHistory?: Array<{
        amountUSDT: number;
        createdAt: Date;
        reference: string;
    }>;
}

export const contractService = {
    async getCycleProgress(): Promise<CycleProgress> {
        const response = await apiClient.get<CycleProgress>('/user/cycle-progress');
        return response.data;
    },

    async getContractStatus(): Promise<ContractStatus> {
        const response = await apiClient.get<ContractStatus>('/user/contract-status');
        return response.data;
    },
};
