import { apiClient } from './api';

export const systemConfigService = {
    async getReferralCommissionRate(): Promise<number> {
        const response = await apiClient.get<{ key: string; value: string }>('/admin/system-config/REFERRAL_COMMISSION_RATE');
        return parseFloat(response.data.value);
    },

    async updateReferralCommissionRate(rate: number): Promise<void> {
        await apiClient.put('/admin/system-config/REFERRAL_COMMISSION_RATE', {
            value: rate.toString()
        });
    }
};
