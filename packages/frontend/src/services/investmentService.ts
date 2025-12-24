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
    bankName?: string;
    collaboratorId?: string;
}

interface WithdrawalRequest {
    amountUSDT: number;
    btcAddress: string;
    destinationType: 'PERSONAL' | 'COLLABORATOR';
    destinationUserId?: string;
    bankDetails?: any;
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
    collaboratorConfig?: {
        commission: number;
        processingTime: string;
        minAmount: number;
        maxAmount: number;
    };
}

export interface Bank {
    id: string;
    name: string;
}

// Reserve BTC address (NEW FLOW - doesn't create task)
export const reserveBtcAddress = async (amountUSDT: number) => {
    const response = await apiClient.post('/user/deposit/reserve-address', { amountUSDT });
    return response.data;
};

// Auto deposit (creates task with reserved address)
export const createAutoDeposit = async (data: AutoDepositRequest & { reservedAddressId?: string }) => {
    const formData = new FormData();
    formData.append('amountUSDT', data.amountUSDT.toString());
    if (data.txid) formData.append('txid', data.txid);
    if (data.proof) formData.append('proof', data.proof);
    if (data.reservedAddressId) formData.append('reservedAddressId', data.reservedAddressId);

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

// Early Capital Liquidation
export const liquidateCapital = async (btcAddress: string) => {
    const response = await apiClient.post('/user/withdraw/capital', { btcAddress });
    return response.data;
};

// Get collaborators list
export const getCollaborators = async (): Promise<Collaborator[]> => {
    const response = await apiClient.get('/user/collaborators');
    return response.data;
};

// Get banks list
export const getBanks = async (): Promise<Bank[]> => {
    const response = await apiClient.get('/user/banks');
    return response.data;
};

// Release reserved address (when user closes modal)
export const releaseReservedAddress = async (addressId: string) => {
    const response = await apiClient.post('/user/deposit/release-address', { addressId });
    return response.data;
};

export const investmentService = {
    reserveBtcAddress,
    createAutoDeposit,
    createManualDepositOrder,
    createWithdrawal,
    liquidateCapital,
    reinvestProfit,
    getCollaborators,
    getBanks,
    releaseReservedAddress,
};


