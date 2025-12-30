import cron from 'node-cron';
import prisma from '../config/database.js';

/**
 * Cron job for checking plan expiry and sending notifications
 * Runs daily at 09:00 AM
 * Schedule: '0 9 * * *' = minute hour day-of-month month day-of-week
 */
export const startPlanExpiryCheckJob = () => {
    // Run daily at 9:00 AM
    cron.schedule('0 9 * * *', async () => {
        console.log('🔄 [CRON] Verificando planes próximos a expirar...');
        console.log(`📅 Fecha: ${new Date().toISOString()}`);

        try {
            const now = new Date();
            const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

            // Find users with plans expiring in the next 5 days
            const usersWithExpiringPlans = await prisma.user.findMany({
                where: {
                    currentPlanExpiryDate: {
                        lte: fiveDaysFromNow,
                        gte: now
                    },
                    contractStatus: 'ACTIVE',
                    investmentClass: { not: null }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    investmentClass: true,
                    currentPlanExpiryDate: true
                }
            });

            console.log(`📊 [CRON] Encontrados ${usersWithExpiringPlans.length} usuarios con planes próximos a expirar`);

            for (const user of usersWithExpiringPlans) {
                const daysRemaining = Math.ceil(
                    (user.currentPlanExpiryDate!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                );

                console.log(`⚠️  [CRON] Usuario: ${user.name} (${user.email})`);
                console.log(`   - Plan: ${user.investmentClass}`);
                console.log(`   - Expira en: ${daysRemaining} días`);
                console.log(`   - Fecha de expiración: ${user.currentPlanExpiryDate?.toISOString()}`);

                // TODO: Aquí se puede integrar servicio de email
                // await sendPlanExpiryNotification(user);
            }

            // Also check for already expired plans
            const usersWithExpiredPlans = await prisma.user.findMany({
                where: {
                    currentPlanExpiryDate: {
                        lt: now
                    },
                    contractStatus: 'ACTIVE',
                    investmentClass: { not: null }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    investmentClass: true,
                    currentPlanExpiryDate: true
                }
            });

            if (usersWithExpiredPlans.length > 0) {
                console.log(`🚨 [CRON] Encontrados ${usersWithExpiredPlans.length} usuarios con planes EXPIRADOS`);

                for (const user of usersWithExpiredPlans) {
                    console.log(`❌ [CRON] Usuario: ${user.name} (${user.email})`);
                    console.log(`   - Plan: ${user.investmentClass}`);
                    console.log(`   - Expiró: ${user.currentPlanExpiryDate?.toISOString()}`);

                    // TODO: Aquí se puede tomar acción automática
                    // - Pausar generación de profit
                    // - Enviar notificación urgente
                    // - Cambiar contractStatus a 'AWAITING_ACTION'
                }
            }

            console.log('✅ [CRON] Verificación de planes completada');

        } catch (error) {
            console.error('❌ [CRON] Error en verificación de planes:', error);
        }
    }, {
        timezone: "America/Bogota" // Ajustar según tu zona horaria
    });

    console.log('✅ [CRON] Job de verificación de planes inicializado (diario a las 09:00)');
};

/**
 * Manual trigger for testing purposes
 */
export const triggerPlanExpiryCheckManually = async () => {
    console.log('🔄 [MANUAL] Ejecutando verificación de planes manualmente...');

    try {
        const now = new Date();
        const fiveDaysFromNow = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);

        const usersWithExpiringPlans = await prisma.user.findMany({
            where: {
                currentPlanExpiryDate: {
                    lte: fiveDaysFromNow,
                    gte: now
                },
                contractStatus: 'ACTIVE'
            }
        });

        console.log(`✅ [MANUAL] Encontrados ${usersWithExpiringPlans.length} usuarios`);
        return usersWithExpiringPlans;
    } catch (error) {
        console.error('❌ [MANUAL] Error:', error);
        throw error;
    }
};
