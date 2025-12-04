import { apiClient } from './api';
import { UserDTO, TransactionDTO } from '@cloud-capital/shared';

export const userService = {
  async getProfile(): Promise<UserDTO> {
    const response = await apiClient.get<UserDTO>('/user/profile');
    return response.data;
  },

  async getBalance(): Promise<{ capitalUSDT: number; currentBalanceUSDT: number }> {
    const response = await apiClient.get('/user/balance');
    return response.data;
  },

  async getTransactions(): Promise<TransactionDTO[]> {
    const response = await apiClient.get<TransactionDTO[]>('/user/transactions');
    return response.data;
  },

  async requestDeposit(data: {
    amount: number;
    bank?: string;
    name?: string;
    cedula?: string;
  }): Promise<{ message: string; taskId: string }> {
    const response = await apiClient.post('/user/deposit', data);
    return response.data;
  },

  async requestWithdrawal(data: {
    amountBTC: number;
    walletAddress: string;
  }): Promise<{ message: string; taskId: string }> {
    const response = await apiClient.post('/user/withdraw', data);
    return response.data;
  },

  async reinvest(data: { amountBTC: number }): Promise<{ message: string }> {
    const response = await apiClient.post('/user/reinvest', data);
    return response.data;
  },

  async getBalanceHistory(days: number = 30): Promise<{ date: string; balance: number }[]> {
    const response = await apiClient.get(`/user/balance-history?days=${days}`);
    return response.data;
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.put('/user/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  },

  async getReferrals(): Promise<UserDTO[]> {
    const response = await apiClient.get<UserDTO[]>('/user/referrals');
    return response.data;
  },

  async getReferralCommissions(): Promise<any[]> {
    const response = await apiClient.get<any[]>('/user/referral-commissions');
    return response.data;
  }
};
