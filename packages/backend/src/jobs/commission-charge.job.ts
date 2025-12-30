import cron from 'node-cron';
import { chargeAllPlanCommissions } from '../services/plan-commission.service.js';

/**
 * Cron job for automatic monthly commission charging
 * Runs on the 1st day of each month at 00:00 (midnight)
 * Schedule: '0 0 1 * *' = minute hour day-of-month month day-of-week
 */
export const startCommissionChargeJob = () => {
    // Run on the 1st of every month at midnight
    cron.schedule('0 0 1 * *', async () => {
        console.log('🔄 [CRON] Iniciando cobro automático de comisiones mensuales...');
        console.log(`📅 Fecha: ${new Date().toISOString()}`);

        try {
            const result = await chargeAllPlanCommissions();

            console.log('✅ [CRON] Cobro de comisiones completado:');
            console.log(`   - Usuarios procesados: ${result.processed}`);
            console.log(`   - Comisiones cobradas: ${result.charged}`);
            console.log(`   - Total cobrado: $${result.totalAmount.toFixed(2)} USDT`);

            if (result.errors.length > 0) {
                console.error('❌ [CRON] Errores encontrados:');
                result.errors.forEach((error, index) => {
                    console.error(`   ${index + 1}. ${error}`);
                });
            }
        } catch (error) {
            console.error('❌ [CRON] Error crítico en cobro de comisiones:', error);
        }
    }, {
        scheduled: true,
        timezone: "America/Bogota" // Ajustar según tu zona horaria
    });

    console.log('✅ [CRON] Job de cobro de comisiones inicializado (1ro de cada mes a las 00:00)');
};

/**
 * Manual trigger for testing purposes
 * Can be called from admin panel or API endpoint
 */
export const triggerCommissionChargeManually = async () => {
    console.log('🔄 [MANUAL] Ejecutando cobro de comisiones manualmente...');

    try {
        const result = await chargeAllPlanCommissions();
        console.log('✅ [MANUAL] Cobro completado:', result);
        return result;
    } catch (error) {
        console.error('❌ [MANUAL] Error:', error);
        throw error;
    }
};
