import prisma from '../config/database.js';

/**
 * Get system configuration value by key
 */
export const getSystemConfig = async (key: string): Promise<string> => {
    const config = await prisma.systemConfig.findUnique({
        where: { key }
    });

    // Return value or default
    if (config) {
        return config.value;
    }

    // Default values
    const defaults: { [key: string]: string } = {
        'REFERRAL_COMMISSION_RATE': '0.10'
    };

    return defaults[key] || '';
};

/**
 * Update system configuration
 */
export const updateSystemConfig = async (
    key: string,
    value: string,
    adminId: string
): Promise<any> => {
    return prisma.systemConfig.upsert({
        where: { key },
        update: {
            value,
            updatedBy: adminId
        },
        create: {
            key,
            value,
            updatedBy: adminId
        }
    });
};

/**
 * Get all system configurations
 */
export const getAllSystemConfigs = async (): Promise<any[]> => {
    return prisma.systemConfig.findMany({
        orderBy: { key: 'asc' }
    });
};
