import { Request, Response } from 'express';
import * as btcPoolService from '../services/btc-address-pool.service.js';
import * as auditService from '../services/audit.service.js';
import { AuditAction } from '@prisma/client';

/**
 * POST /api/admin/btc-pool/upload
 * Carga masiva de direcciones BTC (Solo Super Admin)
 */
export const bulkUpload = async (req: Request, res: Response): Promise<void> => {
    try {
        const { addresses } = req.body;

        if (!addresses || !Array.isArray(addresses)) {
            res.status(400).json({ error: 'Se requiere un array de direcciones' });
            return;
        }

        if (addresses.length === 0) {
            res.status(400).json({ error: 'El array de direcciones está vacío' });
            return;
        }

        const adminId = req.user!.userId;
        const result = await btcPoolService.bulkUploadAddresses(addresses, adminId);

        // Log to audit
        await auditService.logAction({
            adminId: req.user!.userId,
            adminEmail: req.user!.email,
            adminRole: req.user!.role as any,
            action: AuditAction.UPLOADED_ADDRESSES,
            entityType: 'ADDRESS_POOL',
            entityId: 'BULK_UPLOAD',
            newValue: {
                uploaded: result.uploaded,
                duplicates: result.duplicates.length,
                invalid: result.invalid.length,
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(200).json({
            message: `${result.uploaded} direcciones cargadas exitosamente`,
            uploaded: result.uploaded,
            duplicates: result.duplicates,
            invalid: result.invalid,
        });
    } catch (error: any) {
        console.error('[BTC Pool Controller Error]', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/admin/btc-pool/stats
 * Obtener estadísticas del pool
 */
export const getStats = async (_req: Request, res: Response): Promise<void> => {
    try {
        const stats = await btcPoolService.getPoolStats();
        res.status(200).json(stats);
    } catch (error: any) {
        console.error('[BTC Pool Controller Error]', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/admin/btc-pool/addresses
 * Listar direcciones con filtros y paginación
 */
export const getAddresses = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const status = req.query.status as any;
        const search = req.query.search as string;

        const result = await btcPoolService.getAddresses({
            page,
            limit,
            status,
            search,
        });

        res.status(200).json(result);
    } catch (error: any) {
        console.error('[BTC Pool Controller Error]', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * DELETE /api/admin/btc-pool/:id
 * Eliminar dirección no usada (Solo Super Admin)
 */
export const deleteAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await btcPoolService.deleteAddress(id);

        // Log to audit
        await auditService.logAction({
            adminId: req.user!.userId,
            adminEmail: req.user!.email,
            adminRole: req.user!.role as any,
            action: AuditAction.UPLOADED_ADDRESSES,
            entityType: 'ADDRESS',
            entityId: id,
            notes: `Address deleted from pool${result.rejectedTask ? `, task ${result.taskId} auto-rejected` : ''}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        const message = result.rejectedTask
            ? `Dirección eliminada exitosamente. La solicitud de depósito asociada fue rechazada automáticamente.`
            : 'Dirección eliminada exitosamente';

        res.status(200).json({
            message,
            rejectedTask: result.rejectedTask,
            taskId: result.taskId,
        });
    } catch (error: any) {
        console.error('[BTC Pool Controller Error]', error);
        res.status(400).json({ error: error.message });
    }
};

/**
 * PATCH /api/admin/btc-pool/:id/release
 * Liberar dirección RESERVED (volver a AVAILABLE) (Solo Super Admin)
 */
export const releaseAddress = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        const result = await btcPoolService.releaseAddressById(id);

        // Log to audit
        await auditService.logAction({
            adminId: req.user!.userId,
            adminEmail: req.user!.email,
            adminRole: req.user!.role as any,
            action: AuditAction.UPLOADED_ADDRESSES,
            entityType: 'ADDRESS',
            entityId: id,
            notes: `Address released back to available pool${result.rejectedTask ? `, task ${result.taskId} auto-rejected` : ''}`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        const message = result.rejectedTask
            ? `Dirección liberada exitosamente. Se rechazaron automáticamente ${result.rejectedTasksCount} solicitudes de depósito asociadas.`
            : 'Dirección liberada exitosamente';

        res.status(200).json({
            message,
            rejectedTask: result.rejectedTask,
            rejectedTasksCount: result.rejectedTasksCount,
            taskId: result.taskId,
        });
    } catch (error: any) {
        console.error('[BTC Pool Controller Error]', error);
        res.status(400).json({ error: error.message });
    }
};

/**
 * PUT /api/admin/btc-pool/:id/notes
 * Actualizar notas de admin para una dirección
 */
export const updateNotes = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { notes } = req.body;

        await btcPoolService.updateAddressNotes(id, notes || '');

        // Log to audit
        await auditService.logAction({
            adminId: req.user!.userId,
            adminEmail: req.user!.email,
            adminRole: req.user!.role as any,
            action: AuditAction.UPLOADED_ADDRESSES,
            entityType: 'ADDRESS',
            entityId: id,
            notes: `Admin notes updated`,
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
        });

        res.status(200).json({ message: 'Notas actualizadas exitosamente' });
    } catch (error: any) {
        console.error('[BTC Pool Controller Error]', error);
        res.status(400).json({ error: error.message });
    }
};
