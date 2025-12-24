import cron from 'node-cron';
import * as btcPoolService from '../services/btc-address-pool.service.js';
import * as auditService from '../services/audit.service.js';
import { AuditAction, UserRole } from '@prisma/client';

/**
 * Cron job para reciclar direcciones BTC rezervadas que expiraron
 * Se ejecuta cada hora (0 * * * *)
 */
export function startAddressRecyclingJob(): void {
    console.log('[CRON] Address recycling job initialized');

    // Ejecutar cada hora a los 0 minutos
    cron.schedule('0 * * * *', async () => {
        try {
            console.log('[CRON] Running address recycling job...');

            const recycledCount = await btcPoolService.releaseExpiredReservations();

            if (recycledCount > 0) {
                console.log(`[CRON] ✓ Recicladas ${recycledCount} direcciones BTC expiradas`);

                // Log to audit (sistema automático)
                await auditService.logAction({
                    adminId: 'SYSTEM',
                    adminEmail: 'system@cloudcapital.com',
                    adminRole: UserRole.SUPERADMIN,
                    action: AuditAction.RECYCLED_ADDRESS,
                    entityType: 'ADDRESS_POOL',
                    entityId: 'BATCH',
                    notes: `Automatic recycling of ${recycledCount} expired address${recycledCount > 1 ? 'es' : ''}`,
                });
            } else {
                console.log('[CRON] No expired addresses to recycle');
            }
        } catch (error: any) {
            console.error('[CRON ERROR] Address recycling failed:', error.message);
        }
    });
}

/**
 * Verificar bajo inventario de direcciones disponibles
 * Se ejecuta cada 6 horas
 */
export function startLowInventoryAlertJob(): void {
    console.log('[CRON] Low inventory alert job initialized');

    cron.schedule('0 */6 * * *', async () => {
        try {
            const stats = await btcPoolService.getPoolStats();
            const threshold = parseInt(process.env.MIN_ADDRESS_POOL_THRESHOLD || '20');

            if (stats.available < threshold) {
                console.warn(`[CRON] ⚠️ WARNING: Solo ${stats.available} direcciones disponibles (threshold: ${threshold})`);

                // TODO: Enviar email/notificación al Super Admin
                // await emailService.sendLowInventoryAlert(stats);
            } else {
                console.log(`[CRON] ✓ Pool inventory OK: ${stats.available} direcciones disponibles`);
            }
        } catch (error: any) {
            console.error('[CRON ERROR] Low inventory check failed:', error.message);
        }
    });
}
