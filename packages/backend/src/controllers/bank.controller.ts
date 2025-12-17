import { Request, Response } from 'express';
import { bankService } from '../services/bank.service';

export const getActiveBanks = async (_req: Request, res: Response) => {
    try {
        const banks = await bankService.getActiveBanks();
        res.json(banks);
    } catch (error) {
        console.error('Error fetching active banks:', error);
        res.status(500).json({ error: 'Error al obtener bancos activos' });
    }
};

export const getBanks = async (req: Request, res: Response) => {
    try {
        const banks = await bankService.getAllBanks();
        res.json(banks);
    } catch (error) {
        console.error('Error fetching banks:', error);
        res.status(500).json({ error: 'Error al obtener bancos' });
    }
};

export const createBank = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'El nombre del banco es requerido' });
        }
        const bank = await bankService.createBank(name);
        res.json(bank);
    } catch (error) {
        console.error('Error creating bank:', error);
        res.status(500).json({ error: 'Error al crear banco' });
    }
};

export const updateBank = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, isActive } = req.body;
        const bank = await bankService.updateBank(id, name, isActive);
        res.json(bank);
    } catch (error) {
        console.error('Error updating bank:', error);
        res.status(500).json({ error: 'Error al actualizar banco' });
    }
};

export const deleteBank = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await bankService.deleteBank(id);
        res.json({ message: 'Banco eliminado' });
    } catch (error) {
        console.error('Error deleting bank:', error);
        res.status(500).json({ error: 'Error al eliminar banco' });
    }
};
