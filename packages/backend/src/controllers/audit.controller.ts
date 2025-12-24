import { Request, Response } from 'express';
import * as auditService from '../services/audit.service.js';
import { AuditAction } from '@prisma/client';

/**
 * GET /api/admin/audit/logs
 * Obtener logs de auditoría con filtros
 */
export const getAuditLogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const adminId = req.query.adminId as string;
        const action = req.query.action as AuditAction;
        const entityType = req.query.entityType as string;
        const entityId = req.query.entityId as string;

        // Parse date filters if provided
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (req.query.startDate) {
            startDate = new Date(req.query.startDate as string);
        }
        if (req.query.endDate) {
            endDate = new Date(req.query.endDate as string);
        }

        const result = await auditService.getAuditLogs({
            adminId,
            action,
            entityType,
            entityId,
            startDate,
            endDate,
            page,
            limit,
        });

        res.status(200).json(result);
    } catch (error: any) {
        console.error('[Audit Controller Error]', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/admin/audit/task/:taskId
 * Obtener trail de auditoría de un task específico
 */
export const getTaskAuditTrail = async (req: Request, res: Response): Promise<void> => {
    try {
        const { taskId } = req.params;

        const trail = await auditService.getEntityAuditTrail('DEPOSIT', taskId);

        res.status(200).json(trail);
    } catch (error: any) {
        console.error('[Audit Controller Error]', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/admin/audit/stats
 * Obtener estadísticas de auditoría
 */
export const getAuditStats = async (req: Request, res: Response): Promise<void> => {
    try {
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (req.query.startDate) {
            startDate = new Date(req.query.startDate as string);
        }
        if (req.query.endDate) {
            endDate = new Date(req.query.endDate as string);
        }

        const stats = await auditService.getAuditStats({
            startDate,
            endDate,
        });

        res.status(200).json(stats);
    } catch (error: any) {
        console.error('[Audit Controller Error]', error);
        res.status(500).json({ error: error.message });
    }
};
