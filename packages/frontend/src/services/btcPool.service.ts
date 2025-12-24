import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with auth token
const getAuthHeader = () => {
    const token = localStorage.getItem('accessToken'); // Changed from 'token' to 'accessToken'
    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Upload bulk BTC addresses to pool (Super Admin only)
 */
export const uploadAddresses = async (addresses: string[]) => {
    const response = await axios.post(
        `${API_URL}/admin/btc-pool/upload`,
        { addresses },
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Get pool statistics
 */
export const getPoolStats = async () => {
    const response = await axios.get(
        `${API_URL}/admin/btc-pool/stats`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Get addresses with filters
 */
export const getAddresses = async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
}) => {
    const response = await axios.get(
        `${API_URL}/admin/btc-pool/addresses`,
        {
            params,
            headers: getAuthHeader(),
        }
    );
    return response.data;
};

/**
 * Delete an address from pool
 */
export const deleteAddress = async (addressId: string) => {
    const response = await axios.delete(
        `${API_URL}/admin/btc-pool/${addressId}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Release a RESERVED address back to AVAILABLE
 */
export const releaseAddress = async (addressId: string) => {
    const response = await axios.patch(
        `${API_URL}/admin/btc-pool/${addressId}/release`,
        {},
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Get blockchain info for an address
 */
export const getAddressInfo = async (address: string) => {
    const response = await axios.get(
        `${API_URL}/blockchain/address/${address}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Get transaction details
 */
export const getTransactionDetails = async (txid: string) => {
    const response = await axios.get(
        `${API_URL}/blockchain/transaction/${txid}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Verify a deposit
 */
export const verifyDeposit = async (params: {
    address: string;
    expectedAmountBTC?: number;
    minConfirmations?: number;
}) => {
    const response = await axios.post(
        `${API_URL}/blockchain/verify-deposit`,
        params,
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Get audit logs
 */
export const getAuditLogs = async (params?: {
    page?: number;
    limit?: number;
    adminId?: string;
    action?: string;
    entityType?: string;
    entityId?: string;
    startDate?: string;
    endDate?: string;
}) => {
    const response = await axios.get(
        `${API_URL}/admin/audit/logs`,
        {
            params,
            headers: getAuthHeader(),
        }
    );
    return response.data;
};

/**
 * Get audit trail for a specific task
 */
export const getTaskAuditTrail = async (taskId: string) => {
    const response = await axios.get(
        `${API_URL}/admin/audit/task/${taskId}`,
        { headers: getAuthHeader() }
    );
    return response.data;
};

/**
 * Get audit statistics
 */
export const getAuditStats = async (params?: {
    startDate?: string;
    endDate?: string;
}) => {
    const response = await axios.get(
        `${API_URL}/admin/audit/stats`,
        {
            params,
            headers: getAuthHeader(),
        }
    );
    return response.data;
};
