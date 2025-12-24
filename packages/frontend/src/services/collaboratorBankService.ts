import { apiClient } from './api';

export interface CollaboratorBankAccount {
    id: string;
    userId: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
    bankName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
    documentType: string;
    documentNumber: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CollaboratorBankAccountData {
    bankName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
    documentType: string;
    documentNumber: string;
}

/**
 * Create a new bank account
 */
export const createBankAccount = async (data: CollaboratorBankAccountData): Promise<CollaboratorBankAccount> => {
    const response = await apiClient.post('/admin/collaborator-banks', data);
    return response.data;
};

/**
 * Get bank accounts (filtered by role)
 * - SUBADMIN: gets only their accounts
 * - ADMIN: gets all accounts with optional filters
 */
export const getBankAccounts = async (filters?: {
    collaboratorId?: string;
    search?: string;
}): Promise<CollaboratorBankAccount[]> => {
    const params = new URLSearchParams();
    if (filters?.collaboratorId) params.append('collaboratorId', filters.collaboratorId);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get(`/admin/collaborator-banks?${params.toString()}`);
    return response.data;
};

/**
 * Update a bank account
 */
export const updateBankAccount = async (
    id: string,
    data: Partial<CollaboratorBankAccountData> & { isActive?: boolean }
): Promise<CollaboratorBankAccount> => {
    const response = await apiClient.put(`/admin/collaborator-banks/${id}`, data);
    return response.data;
};

/**
 * Delete a bank account
 */
export const deleteBankAccount = async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/collaborator-banks/${id}`);
};

export const collaboratorBankService = {
    createBankAccount,
    getBankAccounts,
    updateBankAccount,
    deleteBankAccount,
};

export default collaboratorBankService;
