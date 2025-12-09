import { TransactionDTO } from '@cloud-capital/shared';
import { formatUSDT, formatBTC } from '../../utils/formatters';

interface TransactionTableProps {
    transactions: TransactionDTO[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
    const getTypeColor = (type: string) => {
        switch (type) {
            case 'DEPOSIT':
                return 'text-accent';
            case 'PROFIT':
                return 'text-profit';
            case 'REINVEST':
                return 'text-sky-400';
            case 'WITHDRAWAL':
                return 'text-red-500';
            default:
                return 'text-white';
        }
    };

    return (
        <div className="card p-4 sm:p-6 rounded-xl mt-6 sm:mt-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Registro de transacciones</h3>

            <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-700">
                        <tr>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                Fecha
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                Tipo / Referencia
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                Monto (BTC)
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                Valor (USD)
                            </th>
                            <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                Estado
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {transactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">
                                    No hay transacciones registradas
                                </td>
                            </tr>
                        ) : (
                            transactions.map((tx) => (
                                <tr key={tx.id} className="hover:bg-gray-800 transition">
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-400">
                                        {new Date(tx.createdAt).toLocaleDateString('es-ES')}
                                    </td>
                                    <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold ${getTypeColor(tx.type)}`}>
                                        {tx.type}
                                        {tx.reference && (
                                            <span className="block text-xs text-gray-500">{tx.reference}</span>
                                        )}
                                    </td>
                                    <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-black data-metric ${getTypeColor(tx.type)}`}>
                                        {tx.amountBTC ? formatBTC(tx.amountBTC) + ' BTC' : '-'}
                                    </td>
                                    <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-black data-metric ${getTypeColor(tx.type)}`}>
                                        ≈ {formatUSDT(tx.amountUSDT)} USD
                                    </td>
                                    <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                                        <span
                                            className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-semibold ${tx.status === 'COMPLETED'
                                                ? 'bg-profit/20 text-profit'
                                                : 'bg-yellow-500/20 text-yellow-500'
                                                }`}
                                        >
                                            {tx.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
