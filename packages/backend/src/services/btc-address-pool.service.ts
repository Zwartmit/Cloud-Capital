import prisma from '../config/database.js';
import { BtcAddressStatus, Prisma } from '@prisma/client';

/**
 * Validar formato de dirección Bitcoin
 * Soporta Legacy (1...), SegWit (3...), y Native SegWit (bc1...)
 */
export function validateBtcAddress(address: string): boolean {
    // Regex para direcciones Bitcoin válidas
    const legacyPattern = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const segwitPattern = /^3[a-km-zA-HJ-NP-Z1-9]{25,34}$/;
    const nativeSegwitPattern = /^(bc1|tb1|bcrt1)[a-z0-9]{39,87}$/;

    return (
        legacyPattern.test(address) ||
        segwitPattern.test(address) ||
        nativeSegwitPattern.test(address)
    );
}

/**
 * Carga masiva de direcciones BTC al pool
 */
export async function bulkUploadAddresses(
    addresses: string[],
    adminId: string
): Promise<{ uploaded: number; duplicates: string[]; invalid: string[] }> {
    const duplicates: string[] = [];
    const invalid: string[] = [];
    const validAddresses: string[] = [];

    // Validar y filtrar direcciones
    for (const address of addresses) {
        const cleanAddress = address.trim();

        if (!cleanAddress) continue;

        if (!validateBtcAddress(cleanAddress)) {
            invalid.push(cleanAddress);
            continue;
        }

        // Verificar si ya existe
        const existing = await prisma.btcAddressPool.findUnique({
            where: { address: cleanAddress },
        });

        if (existing) {
            duplicates.push(cleanAddress);
            continue;
        }

        validAddresses.push(cleanAddress);
    }

    // Insertar direcciones válidas
    if (validAddresses.length > 0) {
        await prisma.btcAddressPool.createMany({
            data: validAddresses.map(address => ({
                address,
                uploadedBy: adminId,
                status: BtcAddressStatus.AVAILABLE,
            })),
        });
    }

    return {
        uploaded: validAddresses.length,
        duplicates,
        invalid,
    };
}

/**
 * Asignar una dirección disponible a un depósito
 */
export async function assignAddressToDeposit(taskId: string): Promise<string> {
    // Buscar primera dirección disponible
    const availableAddress = await prisma.btcAddressPool.findFirst({
        where: { status: BtcAddressStatus.AVAILABLE },
        orderBy: { createdAt: 'asc' }, // FIFO: usar la más antigua primero
    });

    if (!availableAddress) {
        throw new Error('No hay direcciones BTC disponibles. Contacte al administrador.');
    }

    // Marcar como reservada
    await prisma.btcAddressPool.update({
        where: { id: availableAddress.id },
        data: {
            status: BtcAddressStatus.RESERVED,
            reservedAt: new Date(),
            reservedForTaskId: taskId,
        },
    });

    return availableAddress.address;
}


/**
 * Reservar dirección BTC temporalmente SIN crear tarea
 * Para mostrar al usuario la dirección antes de que envíe la solicitud
 */
export async function reserveAddressTemporarily(
    userId: string,
    amountUSDT: number
): Promise<{ address: string; reservationId: string }> {
    // 1. Check if user already has a valid reserved address
    const timeout = parseInt(process.env.ADDRESS_RESERVATION_TIMEOUT_HOURS || '24');
    const validThreshold = new Date();
    validThreshold.setHours(validThreshold.getHours() - timeout);

    // Check for existing valid reservation for this user
    // Casting to any because reservedByUserId might not be in the generated client type yet
    const existingReservation = await prisma.btcAddressPool.findFirst({
        where: {
            status: BtcAddressStatus.RESERVED,
            reservedByUserId: userId,
            reservedAt: { gt: validThreshold }
        }
    });

    if (existingReservation) {
        // Do not overwrite requestedAmount - we want to accumulate confirmed deposits
        return {
            address: existingReservation.address,
            reservationId: existingReservation.id
        };
    }

    // 2. If no existing reservation, find new available address
    const availableAddress = await prisma.btcAddressPool.findFirst({
        where: { status: BtcAddressStatus.AVAILABLE },
        orderBy: { createdAt: 'asc' }, // FIFO
    });

    if (!availableAddress) {
        throw new Error('No hay direcciones BTC disponibles. Contacte al administrador.');
    }

    // Marcar como RESERVED y asignar al usuario
    const reserved = await prisma.btcAddressPool.update({
        where: { id: availableAddress.id },
        data: {
            status: BtcAddressStatus.RESERVED,
            reservedAt: new Date(),
            requestedAmount: 0, // Initialize to 0, will increment on confirmed deposit
            reservedByUserId: userId,
            // NO asignar reservedForTaskId - se asignará cuando se cree la tarea
        },
    });

    return {
        address: reserved.address,
        reservationId: reserved.id,
    };
}

/**
 * Verificar si el usuario tiene una reserva activa
 */
export async function getActiveReservation(userId: string) {
    const timeout = parseInt(process.env.ADDRESS_RESERVATION_TIMEOUT_HOURS || '24');
    const validThreshold = new Date();
    validThreshold.setHours(validThreshold.getHours() - timeout);

    const existingReservation = await prisma.btcAddressPool.findFirst({
        where: {
            status: BtcAddressStatus.RESERVED,
            reservedByUserId: userId,
            reservedAt: { gt: validThreshold }
        }
    });

    if (existingReservation) {
        return {
            address: existingReservation.address,
            reservationId: existingReservation.id,
            expiresAt: new Date((existingReservation.reservedAt || new Date()).getTime() + timeout * 60 * 60 * 1000).toISOString(),
            amount: existingReservation.requestedAmount
        };
    }

    // NEW: Check for recently submitted DEPOSIT tasks (Reuse address from last 24h)
    // IMPORTANT: Only check DEPOSIT tasks, NOT withdrawal/liquidation tasks
    const recentTask = await prisma.task.findFirst({
        where: {
            userId: userId,
            createdAt: { gt: validThreshold },
            btcAddress: { not: null },
            // Only include deposit-related tasks, exclude withdrawals and liquidations
            type: { in: ['DEPOSIT_MANUAL', 'DEPOSIT_AUTO'] }
        },
        orderBy: { createdAt: 'desc' },
        select: { btcAddress: true, createdAt: true, amountUSD: true }
    });

    if (recentTask && recentTask.btcAddress) {
        return {
            address: recentTask.btcAddress,
            reservationId: null, // No reservation ID because it's already 'used'/'submitted'
            expiresAt: new Date(recentTask.createdAt.getTime() + timeout * 60 * 60 * 1000).toISOString(),
            amount: recentTask.amountUSD ? new Prisma.Decimal(recentTask.amountUSD) : undefined
        };
    }

    return null;
}
/**
 * Marcar dirección como usada tras aprobación de depósito
 */
export async function markAddressAsUsed(
    address: string,
    userId: string
): Promise<void> {
    await prisma.btcAddressPool.update({
        where: { address },
        data: {
            status: BtcAddressStatus.USED,
            usedAt: new Date(),
            usedByUserId: userId,
        },
    });
}

/**
 * Liberar direcciones reservadas que expiraron (>24 horas sin uso)
 * Llamado por cron job
 */
export async function releaseExpiredReservations(): Promise<number> {
    const timeout = parseInt(process.env.ADDRESS_RESERVATION_TIMEOUT_HOURS || '24');
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() - timeout);

    const expiredAddresses = await prisma.btcAddressPool.findMany({
        where: {
            status: BtcAddressStatus.RESERVED,
            reservedAt: {
                lt: expirationDate,
            },
        },
    });

    if (expiredAddresses.length === 0) {
        return 0;
    }

    // Liberar todas las direcciones expiradas
    await prisma.btcAddressPool.updateMany({
        where: {
            id: {
                in: expiredAddresses.map(addr => addr.id),
            },
        },
        data: {
            status: BtcAddressStatus.AVAILABLE,
            reservedAt: null,
            reservedForTaskId: null,
        },
    });

    return expiredAddresses.length;
}

/**
 * Obtener estadísticas del pool
 */
export async function getPoolStats() {
    const [available, reserved, used, deleted, total] = await Promise.all([
        prisma.btcAddressPool.count({ where: { status: BtcAddressStatus.AVAILABLE } }),
        prisma.btcAddressPool.count({ where: { status: BtcAddressStatus.RESERVED } }),
        prisma.btcAddressPool.count({ where: { status: BtcAddressStatus.USED } }),
        prisma.btcAddressPool.count({ where: { status: BtcAddressStatus.DELETED } }),
        prisma.btcAddressPool.count(),
    ]);

    return {
        total,
        available,
        reserved,
        used,
        deleted,
        percentageAvailable: total > 0 ? (available / total) * 100 : 0,
    };
}

/**
 * Listar direcciones con filtros y paginación
 */
export async function getAddresses(params: {
    page?: number;
    limit?: number;
    status?: BtcAddressStatus;
    search?: string;
}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.status) {
        where.status = params.status;
    }

    if (params.search) {
        where.address = {
            contains: params.search,
        };
    }

    const [addresses, total] = await Promise.all([
        prisma.btcAddressPool.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                address: true,
                status: true,
                reservedAt: true,
                usedAt: true,
                uploadedAt: true,
                requestedAmount: true,
                receivedAmount: true,
                adminNotes: true,
                uploadedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                usedByUser: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        username: true,
                    },
                },
            },
        }),
        prisma.btcAddressPool.count({ where }),
    ]);

    return {
        addresses,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Eliminar dirección no usada (solo AVAILABLE o RESERVED) - SOFT DELETE
 */
export async function deleteAddress(addressId: string): Promise<{ deletedAddress: boolean; rejectedTask: boolean; taskId?: string }> {
    const address = await prisma.btcAddressPool.findUnique({
        where: { id: addressId },
    });

    if (!address) {
        throw new Error('Dirección no encontrada');
    }

    if (address.status === BtcAddressStatus.USED) {
        throw new Error('No se puede eliminar una dirección ya utilizada');
    }

    if (address.status === BtcAddressStatus.DELETED) {
        throw new Error('Esta dirección ya está eliminada');
    }

    // Si tiene una tarea asociada, rechazarla automáticamente
    let rejectedTask = false;
    let taskId: string | undefined;

    if (address.reservedForTaskId) {
        taskId = address.reservedForTaskId;

        // Buscar la tarea
        const task = await prisma.task.findUnique({
            where: { id: address.reservedForTaskId },
        });

        // Solo rechazar si está pendiente o pre-aprobada
        if (task && (task.status === 'PENDING' || task.status === 'PRE_APPROVED')) {
            await prisma.task.update({
                where: { id: address.reservedForTaskId },
                data: {
                    status: 'REJECTED',
                    rejectionReason: 'La dirección BTC asignada fue eliminada por un administrador. Por favor, solicita un nuevo depósito.',
                    approvedByAdmin: 'SYSTEM',
                },
            });
            rejectedTask = true;
        }
    }

    // Soft delete: cambiar estado a DELETED y registrar fecha
    await prisma.btcAddressPool.update({
        where: { id: addressId },
        data: {
            status: BtcAddressStatus.DELETED,
            deletedAt: new Date(),
        },
    });

    return {
        deletedAddress: true,
        rejectedTask,
        taskId,
    };
}

/**
 * Liberar dirección RESERVED manualmente por ID (volver a AVAILABLE)
 */
export async function releaseAddressById(addressId: string): Promise<{ releasedAddress: boolean; rejectedTask: boolean; rejectedTasksCount: number; taskId?: string }> {
    const address = await prisma.btcAddressPool.findUnique({
        where: { id: addressId },
    });

    if (!address) {
        throw new Error('Dirección no encontrada');
    }

    if (address.status === BtcAddressStatus.USED) {
        throw new Error('No se puede liberar una dirección ya utilizada');
    }

    if (address.status === BtcAddressStatus.AVAILABLE) {
        throw new Error('La dirección ya está disponible');
    }

    // Cancel ALL pending tasks associated with this address
    // (Both linked via reservedForTaskId AND any others that might have been created via address reuse)
    // We search by 'assignedAddress' or 'btcAddress' depending on how it's stored.
    // In createAutoDepositRequest, we store 'assignedAddress' and 'btcAddress' might be null or same.
    // We query by assignedAddress

    const updateResult = await prisma.task.updateMany({
        where: {
            assignedAddress: address.address,
            status: { in: ['PENDING', 'PRE_APPROVED'] }
        },
        data: {
            status: 'REJECTED',
            rejectionReason: 'La dirección BTC asignada fue liberada manualmente por un administrador.',
            approvedByAdmin: 'SYSTEM'
        }
    });

    const rejectedTasksCount = updateResult.count;

    // Liberar la dirección: volver a AVAILABLE
    await prisma.btcAddressPool.update({
        where: { id: addressId },
        data: {
            status: BtcAddressStatus.AVAILABLE,
            reservedAt: null,
            reservedForTaskId: null,
            requestedAmount: null, // Clear amount when releasing
            reservedByUserId: null, // Ensure user reservation is cleared
        },
    });

    return {
        releasedAddress: true,
        rejectedTask: rejectedTasksCount > 0,
        rejectedTasksCount, // New return field
        taskId: undefined // Deprecated but kept for type compat if needed, or remove if updating controller
    };
}

/**
 * Liberar dirección reservada específica (para cuando un usuario cancela)
 */
export async function releaseReservedAddress(taskId: string): Promise<void> {
    await prisma.btcAddressPool.updateMany({
        where: {
            reservedForTaskId: taskId,
            status: BtcAddressStatus.RESERVED,
        },
        data: {
            status: BtcAddressStatus.AVAILABLE,
            reservedAt: null,
            reservedForTaskId: null,
        },
    });
}

/**
 * Actualizar notas de admin para una dirección
 */
export async function updateAddressNotes(
    addressId: string,
    notes: string
): Promise<void> {
    await prisma.btcAddressPool.update({
        where: { id: addressId },
        data: { adminNotes: notes },
    });
}
