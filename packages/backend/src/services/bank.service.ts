import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllBanks = async () => {
    return await prisma.bank.findMany({
        orderBy: { name: 'asc' },
    });
};

export const getActiveBanks = async () => {
    return await prisma.bank.findMany({
        where: { isActive: true },
        orderBy: { name: 'asc' },
    });
};


export const createBank = async (name: string) => {
    return await prisma.bank.create({
        data: { name },
    });
};

export const updateBank = async (id: string, name: string, isActive: boolean) => {
    return await prisma.bank.update({
        where: { id },
        data: { name, isActive },
    });
};

export const deleteBank = async (id: string) => {
    return await prisma.bank.delete({
        where: { id },
    });
};

export const bankService = {
    getAllBanks,
    getActiveBanks,
    createBank,
    updateBank,
    deleteBank,
};
