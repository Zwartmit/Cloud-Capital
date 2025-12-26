import { PrismaClient, BtcAddressStatus, BtcAddressPool } from '@prisma/client';

const prisma = new PrismaClient();

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
    // Buscar primera dirección disponible
    const availableAddress = await prisma.btcAddressPool.findFirst({
        where: { status: BtcAddressStatus.AVAILABLE },
        orderBy: { createdAt: 'asc' }, // FIFO: usar la más antigua primero
    });

    if (!availableAddress) {
        throw new Error('No hay direcciones BTC disponibles. Contacte al administrador.');
    }

    // Marcar como RESERVED pero SIN taskId (temporal)
    const reserved = await prisma.btcAddressPool.update({
        where: { id: availableAddress.id },
        data: {
            status: BtcAddressStatus.RESERVED,
            reservedAt: new Date(),
            requestedAmount: amountUSDT,
            // NO asignar reservedForTaskId - se asignará cuando se cree la tarea
        },
    });

    return {
        address: reserved.address,
        reservationId: reserved.id,
    };
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
    const [available, reserved, used, total] = await Promise.all([
        prisma.btcAddressPool.count({ where: { status: BtcAddressStatus.AVAILABLE } }),
        prisma.btcAddressPool.count({ where: { status: BtcAddressStatus.RESERVED } }),
        prisma.btcAddressPool.count({ where: { status: BtcAddressStatus.USED } }),
        prisma.btcAddressPool.count(),
    ]);

    return {
        total,
        available,
        reserved,
        used,
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
 * Eliminar dirección no usada (solo AVAILABLE o RESERVED)
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

    await prisma.btcAddressPool.delete({
        where: { id: addressId },
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
export async function releaseAddressById(addressId: string): Promise<{ releasedAddress: boolean; rejectedTask: boolean; taskId?: string }> {
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
                    rejectionReason: 'La dirección BTC asignada fue liberada por un administrador. Por favor, solicita un nuevo depósito.',
                    approvedByAdmin: 'SYSTEM',
                },
            });
            rejectedTask = true;
        }
    }

    // Liberar la dirección: volver a AVAILABLE
    await prisma.btcAddressPool.update({
        where: { id: addressId },
        data: {
            status: BtcAddressStatus.AVAILABLE,
            reservedAt: null,
            reservedForTaskId: null,
            requestedAmount: null, // Clear amount when releasing
        },
    });

    return {
        releasedAddress: true,
        rejectedTask,
        taskId,
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
