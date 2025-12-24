import { PrismaClient, AuditAction, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

export interface CreateAuditLogDTO {
    adminId: string;
    adminEmail: string;
    adminRole: UserRole;
    action: AuditAction;
    entityType: string;
    entityId: string;
    oldValue?: any;
    newValue?: any;
    blockchainLink?: string;
    notes?: string;
    ipAddress?: string;
    userAgent?: string;
}

/**
 * Registrar acción de auditoría
 */
export async function logAction(dto: CreateAuditLogDTO): Promise<void> {
    await prisma.auditLog.create({
        data: {
            adminId: dto.adminId,
            adminEmail: dto.adminEmail,
            adminRole: dto.adminRole,
            action: dto.action,
            entityType: dto.entityType,
            entityId: dto.entityId,
            oldValue: dto.oldValue || null,
            newValue: dto.newValue || null,
            blockchainLink: dto.blockchainLink || null,
            notes: dto.notes || null,
            ipAddress: dto.ipAddress || null,
            userAgent: dto.userAgent || null,
        },
    });
}

/**
 * Obtener logs de auditoría con filtros
 */
export async function getAuditLogs(params: {
    adminId?: string;
    action?: AuditAction;
    entityType?: string;
    entityId?: string;
    startDate?: Date;
    endDate?: Date;
    page?: number;
    limit?: number;
}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.adminId) {
        where.adminId = params.adminId;
    }

    if (params.action) {
        where.action = params.action;
    }

    if (params.entityType) {
        where.entityType = params.entityType;
    }

    if (params.entityId) {
        where.entityId = params.entityId;
    }

    if (params.startDate || params.endDate) {
        where.createdAt = {};
        if (params.startDate) {
            where.createdAt.gte = params.startDate;
        }
        if (params.endDate) {
            where.createdAt.lte = params.endDate;
        }
    }

    const [logs, total] = await Promise.all([
        prisma.auditLog.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: {
                admin: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true,
                    },
                },
            },
        }),
        prisma.auditLog.count({ where }),
    ]);

    return {
        logs,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Obtener historial de actividad de un administrador
 */
export async function getAdminActivityLog(
    adminId: string,
    dateRange?: { startDate?: Date; endDate?: Date },
    limit: number = 100
) {
    const where: any = { adminId };

    if (dateRange?.startDate || dateRange?.endDate) {
        where.createdAt = {};
        if (dateRange.startDate) {
            where.createdAt.gte = dateRange.startDate;
        }
        if (dateRange.endDate) {
            where.createdAt.lte = dateRange.endDate;
        }
    }

    return await prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
    });
}

/**
 * Obtener trail de auditoría de una entidad específica
 */
export async function getEntityAuditTrail(
    entityType: string,
    entityId: string
) {
    return await prisma.auditLog.findMany({
        where: {
            entityType,
            entityId,
        },
        orderBy: { createdAt: 'asc' },
        include: {
            admin: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                },
            },
        },
    });
}

/**
 * Obtener estadísticas de acciones de auditoría
 */
export async function getAuditStats(dateRange?: { startDate?: Date; endDate?: Date }) {
    const where: any = {};

    if (dateRange?.startDate || dateRange?.endDate) {
        where.createdAt = {};
        if (dateRange.startDate) {
            where.createdAt.gte = dateRange.startDate;
        }
        if (dateRange.endDate) {
            where.createdAt.lte = dateRange.endDate;
        }
    }

    const [
        totalActions,
        actionsByType,
        actionsByAdmin,
    ] = await Promise.all([
        prisma.auditLog.count({ where }),
        prisma.auditLog.groupBy({
            by: ['action'],
            where,
            _count: true,
        }),
        prisma.auditLog.groupBy({
            by: ['adminId', 'adminEmail', 'adminRole'],
            where,
            _count: true,
            orderBy: {
                _count: {
                    adminId: 'desc',
                },
            },
        }),
    ]);

    return {
        totalActions,
        actionsByType,
        actionsByAdmin,
    };
}
