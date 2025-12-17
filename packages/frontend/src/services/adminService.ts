import { apiClient } from './api';
import { TaskDTO, UserDTO } from '@cloud-capital/shared';

export interface Bank {
  id: string;
  name: string;
  isActive: boolean;
}

export interface CollaboratorConfig {
  commission: number;
  processingTime: string;
  minAmount: number;
  maxAmount: number;
  isActive?: boolean;
  walletAddress?: string;
  whatsappNumber?: string;
}

export const adminService = {
  // User Management
  async getAllUsers(limit: number = 25, page: number = 1): Promise<{
    users: UserDTO[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const response = await apiClient.get(`/admin/users?limit=${limit}&page=${page}`);
    return response.data;
  },

  async getAllStaff(): Promise<UserDTO[]> {
    const response = await apiClient.get<UserDTO[]>('/admin/staff');
    return response.data;
  },

  async getUserById(userId: string): Promise<UserDTO> {
    const response = await apiClient.get<UserDTO>(`/admin/users/${userId}`);
    return response.data;
  },

  async searchUsers(query: string): Promise<UserDTO[]> {
    const response = await apiClient.get<UserDTO[]>(`/admin/users/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async updateUserBalance(userId: string, capitalUSDT: number, currentBalanceUSDT: number): Promise<UserDTO> {
    const response = await apiClient.put<UserDTO>(`/admin/users/${userId}/balance`, {
      capitalUSDT,
      currentBalanceUSDT,
    });
    return response.data;
  },

  async updateUser(userId: string, data: {
    capitalUSDT?: number;
    currentBalanceUSDT?: number;
    investmentClass?: string;
    role?: string;
  }): Promise<UserDTO> {
    // Note: Currently backend only supports balance update via specific endpoint
    // This method might need backend support for other fields
    if (data.capitalUSDT !== undefined && data.currentBalanceUSDT !== undefined) {
      return this.updateUserBalance(userId, data.capitalUSDT, data.currentBalanceUSDT);
    }
    const response = await apiClient.put<UserDTO>(`/admin/users/${userId}`, data);
    return response.data;
  },

  async deleteUser(userId: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },

  async resetUserPassword(userId: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.put(`/admin/users/${userId}/reset-password`, {
      newPassword
    });
    return response.data;
  },

  async getUserReferrals(userId: string): Promise<UserDTO[]> {
    const response = await apiClient.get<UserDTO[]>(`/admin/users/${userId}/referrals`);
    return response.data;
  },

  // Task Management
  async getAllTasks(status?: string): Promise<TaskDTO[]> {
    const query = status ? `?status=${status}` : '';
    const response = await apiClient.get<TaskDTO[]>(`/admin/tasks${query}`);
    return response.data;
  },

  async getTaskById(taskId: string): Promise<TaskDTO> {
    const response = await apiClient.get<TaskDTO>(`/admin/tasks/${taskId}`);
    return response.data;
  },

  async approveTask(taskId: string): Promise<{ message: string; task: TaskDTO }> {
    const response = await apiClient.put(`/admin/tasks/${taskId}/approve`);
    return response.data;
  },

  async rejectTask(taskId: string, reason?: string): Promise<{ message: string; task: TaskDTO }> {
    const response = await apiClient.put(`/admin/tasks/${taskId}/reject`, { rejectionReason: reason });
    return response.data;
  },

  verifyCollaboratorTask: async (id: string, verified: boolean): Promise<TaskDTO> => {
    const response = await apiClient.put(`/admin/tasks/${id}/verify-collaborator`, { verified });
    return response.data;
  },

  // Statistics
  async getStats(): Promise<{
    totalUsers: number;
    totalCapital: number;
    totalBalance: number;
    pendingTasks: number;
  }> {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  // Profit Management
  async setDailyRates(date: string, rates: { investmentClass: string, rate: number }[]) {
    const response = await apiClient.post('/profit/rates', { date, rates });
    return response.data;
  },

  async getDailyRates(date: string) {
    const response = await apiClient.get(`/profit/rates?date=${date}`);
    return response.data;
  },

  async triggerProfitProcess(date?: string) {
    const response = await apiClient.post('/profit/process', { date });
    return response.data;
  },

  // Collaborator Config
  async updateCollaboratorConfig(userId: string, config: CollaboratorConfig): Promise<UserDTO> {
    const response = await apiClient.put<UserDTO>(`/admin/staff/${userId}/config`, config);
    return response.data;
  },

  async createCollaborator(data: any): Promise<UserDTO> {
    const response = await apiClient.post<UserDTO>('/admin/staff', data);
    return response.data;
  },

  // Bank Management
  async getAllBanks(): Promise<Bank[]> {
    const response = await apiClient.get<Bank[]>('/admin/banks');
    return response.data;
  },

  async createBank(name: string): Promise<Bank> {
    const response = await apiClient.post<Bank>('/admin/banks', { name });
    return response.data;
  },

  async updateBank(id: string, name: string, isActive: boolean): Promise<Bank> {
    const response = await apiClient.put<Bank>(`/admin/banks/${id}`, { name, isActive });
    return response.data;
  },

  async deleteBank(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete(`/admin/banks/${id}`);
    return response.data;
  }
};
