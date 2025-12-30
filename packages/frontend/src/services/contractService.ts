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
