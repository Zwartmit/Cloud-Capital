import { Request, Response } from 'express';
import * as blockstreamService from '../services/blockstream.service.js';

/**
 * GET /api/blockchain/address/:address
 * Consultar información de una dirección BTC
 */
export const getAddressInfo = async (req: Request, res: Response): Promise<void> => {
    try {
        const { address } = req.params;

        const info = await blockstreamService.getAddressInfo(address);
        const explorerLink = blockstreamService.getExplorerLink(address);

        res.status(200).json({
            ...info,
            explorerLink,
        });
    } catch (error: any) {
        console.error('[Blockchain Controller Error]', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/blockchain/transaction/:txid
 * Consultar detalles de una transacción
 */
export const getTransactionDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { txid } = req.params;

        const details = await blockstreamService.getTransactionDetails(txid);
        const explorerLink = blockstreamService.getTransactionExplorerLink(txid);

        res.status(200).json({
            ...details,
            explorerLink,
        });
    } catch (error: any) {
        console.error('[Blockchain Controller Error]', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * POST /api/blockchain/verify-deposit
 * Verificar si un depósito fue recibido
 */
export const verifyDeposit = async (req: Request, res: Response): Promise<void> => {
    try {
        const { address, expectedAmountBTC, minConfirmations } = req.body;

        if (!address) {
            res.status(400).json({ error: 'La dirección es requerida' });
            return;
        }

        const result = await blockstreamService.verifyDeposit(
            address,
            expectedAmountBTC,
            minConfirmations || 1
        );

        res.status(200).json(result);
    } catch (error: any) {
        console.error('[Blockchain Controller Error]', error);
        res.status(500).json({ error: error.message });
    }
};

/**
 * GET /api/blockchain/explorer-link/:address
 * Obtener link al explorador de bloques
 */
export const getExplorerLink = async (req: Request, res: Response): Promise<void> => {
    try {
        const { address } = req.params;
        const link = blockstreamService.getExplorerLink(address);

        res.status(200).json({ link });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};
