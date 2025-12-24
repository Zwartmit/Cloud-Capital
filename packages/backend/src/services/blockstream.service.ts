/**
 * Servicio para interactuar con Blockstream API
 * Docs: https://github.com/Blockstream/esplora/blob/master/API.md
 */

interface AddressInfo {
    address: string;
    chain_stats: {
        funded_txo_count: number;
        funded_txo_sum: number; // satoshis
        spent_txo_count: number;
        spent_txo_sum: number;  // satoshis
        tx_count: number;
    };
    mempool_stats: {
        funded_txo_count: number;
        funded_txo_sum: number;
        spent_txo_count: number;
        spent_txo_sum: number;
        tx_count: number;
    };
}

interface Transaction {
    txid: string;
    version: number;
    locktime: number;
    vin: any[];
    vout: any[];
    size: number;
    weight: number;
    fee: number;
    status: {
        confirmed: boolean;
        block_height?: number;
        block_hash?: string;
        block_time?: number;
    };
}

interface AddressTransaction {
    txid: string;
    vout: {
        scriptpubkey: string;
        scriptpubkey_asm: string;
        scriptpubkey_type: string;
        scriptpubkey_address: string;
        value: number; // satoshis
    }[];
    status: {
        confirmed: boolean;
        block_height?: number;
    };
}

const SATOSHIS_PER_BTC = 100000000;

/**
 * Obtener URL base de Blockstream API según el network configurado
 */
function getBlockstreamApiUrl(): string {
    const network = process.env.BTC_NETWORK || 'testnet';

    if (network === 'mainnet') {
        return 'https://blockstream.info/api';
    } else {
        return 'https://blockstream.info/testnet/api';
    }
}

/**
 * Obtener información de una dirección BTC
 */
export async function getAddressInfo(address: string): Promise<{
    totalReceived: number; // en BTC
    totalSpent: number;    // en BTC
    balance: number;       // en BTC
    txCount: number;
    confirmed: boolean;
}> {
    const apiUrl = getBlockstreamApiUrl();

    try {
        const response = await fetch(`${apiUrl}/address/${address}`);

        if (!response.ok) {
            throw new Error(`Blockstream API error: ${response.status}`);
        }

        const data = (await response.json()) as AddressInfo;

        const totalReceived = data.chain_stats.funded_txo_sum / SATOSHIS_PER_BTC;
        const totalSpent = data.chain_stats.spent_txo_sum / SATOSHIS_PER_BTC;
        const balance = totalReceived - totalSpent;

        return {
            totalReceived,
            totalSpent,
            balance,
            txCount: data.chain_stats.tx_count,
            confirmed: data.chain_stats.tx_count > 0,
        };
    } catch (error: any) {
        console.error('[Blockstream API Error]', error.message);
        throw new Error('Error al consultar Blockstream API. Intente nuevamente.');
    }
}

/**
 * Obtener transacciones de una dirección
 */
export async function getAddressTransactions(address: string): Promise<AddressTransaction[]> {
    const apiUrl = getBlockstreamApiUrl();

    try {
        const response = await fetch(`${apiUrl}/address/${address}/txs`);

        if (!response.ok) {
            throw new Error(`Blockstream API error: ${response.status}`);
        }

        const transactions = (await response.json()) as AddressTransaction[];
        return transactions;
    } catch (error: any) {
        console.error('[Blockstream API Error]', error.message);
        throw new Error('Error al obtener transacciones.');
    }
}

/**
 * Obtener detalles de una transacción específica
 */
export async function getTransactionDetails(txid: string): Promise<{
    txid: string;
    confirmed: boolean;
    confirmations?: number;
    blockHeight?: number;
    fee: number; // en BTC
    totalOutput: number; // en BTC
}> {
    const apiUrl = getBlockstreamApiUrl();

    try {
        const response = await fetch(`${apiUrl}/tx/${txid}`);

        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Transacción no encontrada');
            }
            throw new Error(`Blockstream API error: ${response.status}`);
        }

        const tx = (await response.json()) as Transaction;

        // Calcular altura actual para obtener confirmaciones
        let confirmations: number | undefined;
        if (tx.status.confirmed && tx.status.block_height) {
            // Obtener la altura actual del blockchain
            const tipResponse = await fetch(`${apiUrl}/blocks/tip/height`);
            const currentHeight = (await tipResponse.json()) as number;
            confirmations = currentHeight - tx.status.block_height + 1;
        }

        // Calcular total de outputs
        const totalOutput = tx.vout.reduce((sum, output) => sum + (output.value || 0), 0) / SATOSHIS_PER_BTC;

        return {
            txid: tx.txid,
            confirmed: tx.status.confirmed,
            confirmations,
            blockHeight: tx.status.block_height,
            fee: tx.fee / SATOSHIS_PER_BTC,
            totalOutput,
        };
    } catch (error: any) {
        console.error('[Blockstream API Error]', error.message);
        throw new Error(error.message || 'Error al obtener detalles de la transacción.');
    }
}

/**
 * Verificar si un depósito fue recibido
 */
export async function verifyDeposit(
    address: string,
    expectedAmountBTC?: number,
    minConfirmations: number = 1
): Promise<{
    verified: boolean;
    balance: number;
    totalReceived: number;
    confirmations: number;
    message: string;
    transactions: AddressTransaction[];
}> {
    try {
        // Obtener info de la dirección
        const addressInfo = await getAddressInfo(address);

        // Obtener transacciones
        const transactions = await getAddressTransactions(address);

        // Verificar si hay balance
        if (addressInfo.balance === 0 && addressInfo.totalReceived === 0) {
            return {
                verified: false,
                balance: 0,
                totalReceived: 0,
                confirmations: 0,
                message: 'No se detectaron fondos en esta dirección',
                transactions: [],
            };
        }

        // Obtener confirmaciones de la transacción más reciente
        let confirmations = 0;
        if (transactions.length > 0) {
            const latestTx = transactions[0];
            if (latestTx.status.confirmed && latestTx.status.block_height) {
                const tipResponse = await fetch(`${getBlockstreamApiUrl()}/blocks/tip/height`);
                const currentHeight = (await tipResponse.json()) as number;
                confirmations = currentHeight - latestTx.status.block_height + 1;
            }
        }

        // Verificar monto esperado si se especificó
        if (expectedAmountBTC) {
            const tolerance = 0.00001; // Tolerancia para diferencias de fees
            const amountMatches = Math.abs(addressInfo.totalReceived - expectedAmountBTC) < tolerance;

            if (!amountMatches) {
                return {
                    verified: false,
                    balance: addressInfo.balance,
                    totalReceived: addressInfo.totalReceived,
                    confirmations,
                    message: `Monto recibido (${addressInfo.totalReceived} BTC) no coincide con el esperado (${expectedAmountBTC} BTC)`,
                    transactions,
                };
            }
        }

        // Verificar confirmaciones mínimas
        if (confirmations < minConfirmations) {
            return {
                verified: false,
                balance: addressInfo.balance,
                totalReceived: addressInfo.totalReceived,
                confirmations,
                message: `Transacción pendiente de confirmación (${confirmations}/${minConfirmations})`,
                transactions,
            };
        }

        return {
            verified: true,
            balance: addressInfo.balance,
            totalReceived: addressInfo.totalReceived,
            confirmations,
            message: `Depósito verificado: ${addressInfo.totalReceived} BTC recibidos con ${confirmations} confirmaciones`,
            transactions,
        };
    } catch (error: any) {
        console.error('[Verify Deposit Error]', error.message);
        throw error;
    }
}

/**
 * Generar link a explorador de bloques
 */
export function getExplorerLink(address: string): string {
    const network = process.env.BTC_NETWORK || 'testnet';

    if (network === 'mainnet') {
        return `https://mempool.space/address/${address}`;
    } else {
        return `https://mempool.space/testnet/address/${address}`;
    }
}

/**
 * Generar link a transacción en explorador
 */
export function getTransactionExplorerLink(txid: string): string {
    const network = process.env.BTC_NETWORK || 'testnet';

    if (network === 'mainnet') {
        return `https://mempool.space/tx/${txid}`;
    } else {
        return `https://mempool.space/testnet/tx/${txid}`;
    }
}
