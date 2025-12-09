import { apiClient } from './api';

interface AutoDepositRequest {
    amountUSDT: number;
    txid?: string;
    proof?: File | null;
}

interface ManualDepositRequest {
    amountUSDT: number;
    txid: string;
    collaboratorName: string;
    notes?: string;
}

interface WithdrawalRequest {
    amountUSDT: number;
    btcAddress: string;
    destinationType: 'PERSONAL' | 'COLLABORATOR';
    destinationUserId?: string;
}

interface ReinvestRequest {
    amountUSD: number;
    btcAddress?: string;
}

interface Collaborator {
    id: string;
    name: string;
    whatsappNumber?: string;
    role: string;
    btcDepositAddress?: string;
}

// Auto deposit (direct BTC)
export const createAutoDeposit = async (data: AutoDepositRequest) => {
    const formData = new FormData();
    formData.append('amountUSDT', data.amountUSDT.toString());
    if (data.txid) formData.append('txid', data.txid);
    if (data.proof) formData.append('proof', data.proof);

    const response = await apiClient.post('/user/deposit/auto', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data;
};

// Manual deposit order (via collaborator)
export const createManualDepositOrder = async (data: ManualDepositRequest) => {
    const response = await apiClient.post('/user/deposit/manual', data);
    return response.data;
};

// Enhanced withdrawal
export const createWithdrawal = async (data: WithdrawalRequest) => {
    const response = await apiClient.post('/user/withdraw/enhanced', data);
    return response.data;
};

// Reinvest profit
export const reinvestProfit = async (data: ReinvestRequest) => {
    const response = await apiClient.post('/user/reinvest', data);
    return response.data;
};

// Get collaborators list
export const getCollaborators = async (): Promise<Collaborator[]> => {
    const response = await apiClient.get('/user/collaborators');
    return response.data;
};

export const investmentService = {
    createAutoDeposit,
    createManualDepositOrder,
    createWithdrawal,
    reinvestProfit,
    getCollaborators,
};
