import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CollaboratorBankAccountData {
    bankName: string;
    accountType: string;
    accountNumber: string;
    accountHolder: string;
    documentType: string;
    documentNumber: string;
}

/**
 * Create a new bank account for a collaborator
 */
export const createCollaboratorBankAccount = async (
    userId: string,
    data: CollaboratorBankAccountData
) => {
    return await prisma.collaboratorBankAccount.create({
        data: {
            userId,
            ...data,
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
    });
};

/**
 * Get all bank accounts for a specific collaborator
 */
export const getCollaboratorBankAccounts = async (userId: string) => {
    return await prisma.collaboratorBankAccount.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
    });
};

/**
 * Get all bank accounts (for superadmin) with optional filters
 */
export const getAllCollaboratorBankAccounts = async (filters?: {
    userId?: string;
    search?: string;
}) => {
    const where: any = {};

    if (filters?.userId) {
        where.userId = filters.userId;
    }

    if (filters?.search) {
        where.OR = [
            { bankName: { contains: filters.search, mode: 'insensitive' } },
            { accountNumber: { contains: filters.search, mode: 'insensitive' } },
            { accountHolder: { contains: filters.search, mode: 'insensitive' } },
        ];
    }

    return await prisma.collaboratorBankAccount.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });
};

/**
 * Update a bank account
 */
export const updateCollaboratorBankAccount = async (
    id: string,
    userId: string,
    data: Partial<CollaboratorBankAccountData> & { isActive?: boolean }
) => {
    // Verify ownership
    const account = await prisma.collaboratorBankAccount.findUnique({
        where: { id },
    });

    if (!account) {
        throw new Error('Cuenta bancaria no encontrada');
    }

    if (account.userId !== userId) {
        throw new Error('No tienes permiso para editar esta cuenta');
    }

    return await prisma.collaboratorBankAccount.update({
        where: { id },
        data,
    });
};

/**
 * Delete a bank account
 */
export const deleteCollaboratorBankAccount = async (
    id: string,
    userId: string
) => {
    // Verify ownership
    const account = await prisma.collaboratorBankAccount.findUnique({
        where: { id },
    });

    if (!account) {
        throw new Error('Cuenta bancaria no encontrada');
    }

    if (account.userId !== userId) {
        throw new Error('No tienes permiso para eliminar esta cuenta');
    }

    return await prisma.collaboratorBankAccount.delete({
        where: { id },
    });
};
