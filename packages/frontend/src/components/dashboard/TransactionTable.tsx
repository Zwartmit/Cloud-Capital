import { TransactionDTO } from '@cloud-capital/shared';
import { formatUSDT, formatBTC } from '../../utils/formatters';
import { useState, useMemo } from 'react';

interface TransactionTableProps {
    transactions: TransactionDTO[];
    btcPrice?: number; // Current BTC price for conversion
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions, btcPrice = 96500 }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('ALL');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [itemsPerPage, setItemsPerPage] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'DEPOSIT':
                return 'text-accent';
            case 'PROFIT':
            case 'DAILY_PROFIT':
                return 'text-profit';
            case 'REINVEST':
                return 'text-sky-400';
            case 'WITHDRAWAL':
                return 'text-red-500';
            default:
                return 'text-white';
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'DEPOSIT':
                return 'Aporte';
            case 'WITHDRAWAL':
                return 'Liquidación';
            case 'LIQUIDATION':
                return 'Liquidación Capital';
            case 'CAPITAL_LIQUIDATION':
                return 'Liquidación de Capital';
            case 'PROFIT':
                return 'Ganancia';
            case 'DAILY_PROFIT':
                return 'Ganancia Pasiva';
            case 'REINVEST':
                return 'Reinversión';
            case 'REFERRAL_COMMISSION':
                return 'Comisión Referido';
            default:
                return type;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'Completada';
            case 'PENDING':
                return 'Pendiente';
            case 'REJECTED':
                return 'Rechazada';
            default:
                return status;
        }
    };

    // Helper function to calculate BTC amount from USDT
    const calculateBTCAmount = (amountUSDT: number): number => {
        return amountUSDT / btcPrice;
    };

    // Filter transactions based on search and filters
    const filteredTransactions = useMemo(() => {
        return transactions.filter((tx) => {
            // Search filter (by reference or type)
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                (tx.reference?.toLowerCase().includes(searchLower)) ||
                getTypeText(tx.type).toLowerCase().includes(searchLower);

            // Type filter
            const matchesType = typeFilter === 'ALL' || tx.type === typeFilter;

            // Status filter
            const matchesStatus = statusFilter === 'ALL' || tx.status === statusFilter;

            // Date range filter
            const txDate = new Date(tx.createdAt);
            const matchesDateFrom = !dateFrom || txDate >= new Date(dateFrom);
            const matchesDateTo = !dateTo || txDate <= new Date(dateTo + 'T23:59:59');

            return matchesSearch && matchesType && matchesStatus && matchesDateFrom && matchesDateTo;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [transactions, searchTerm, typeFilter, statusFilter, dateFrom, dateTo]);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, typeFilter, statusFilter, dateFrom, dateTo]);

    // Pagination calculations
    const totalPages = itemsPerPage === -1 ? 1 : Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginatedTransactions = itemsPerPage === -1
        ? filteredTransactions
        : filteredTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return (
        <div className="card p-4 sm:p-6 rounded-xl mt-6 sm:mt-8">
            <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-white">Registro de transacciones</h3>

            {/* Search and Filter Controls */}
            <div className="mb-4 space-y-3">
                {/* Search Input */}
                <div className="w-full">
                    <input
                        type="text"
                        placeholder="Buscar por referencia o tipo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                        <option value="ALL">Todos los tipos</option>
                        <option value="DEPOSIT">Aporte</option>
                        <option value="WITHDRAWAL">Liquidación</option>
                        <option value="PROFIT">Ganancia</option>
                        <option value="DAILY_PROFIT">Ganancia Pasiva</option>
                        <option value="REINVEST">Reinversión</option>
                        <option value="REFERRAL_COMMISSION">Comisión Referido</option>
                    </select>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    >
                        <option value="ALL">Todos los estados</option>
                        <option value="COMPLETED">Completada</option>
                        <option value="PENDING">Pendiente</option>
                        <option value="REJECTED">Rechazada</option>
                    </select>

                    {/* Date From */}
                    <div>
                        <label className="block text-xs text-gray-400">Desde</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            placeholder="Desde"
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                    </div>

                    {/* Date To */}
                    <div>
                        <label className="block text-xs text-gray-400">Hasta</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            placeholder="Hasta"
                            className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Results Count and Items Per Page */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="text-sm text-gray-400">
                        {itemsPerPage === -1
                            ? `Mostrando ${filteredTransactions.length} de ${transactions.length} transacciones`
                            : `Mostrando ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de ${filteredTransactions.length} transacciones`
                        }
                    </div>

                    {/* Items Per Page Selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-400">Mostrar:</label>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => {
                                setItemsPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            className="px-3 py-1 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value={-1}>Todas</option>
                        </select>
                    </div>
                </div>
            </div>

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
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 sm:px-6 py-4 text-center text-sm text-gray-500">
                                    {transactions.length === 0
                                        ? 'No hay transacciones registradas'
                                        : 'No se encontraron transacciones con los filtros aplicados'
                                    }
                                </td>
                            </tr>
                        ) : (
                            paginatedTransactions.map((tx) => {
                                // Calculate BTC amount if not provided
                                const btcAmount = tx.amountBTC || calculateBTCAmount(tx.amountUSDT);

                                return (
                                    <tr key={tx.id} className="hover:bg-gray-800 transition">
                                        <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-400">
                                            {new Date(tx.createdAt).toLocaleDateString('es-ES')}
                                        </td>
                                        <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-semibold ${getTypeColor(tx.type)}`}>
                                            {getTypeText(tx.type)}
                                            {tx.reference && (
                                                <span className="block text-xs text-gray-500">{tx.reference}</span>
                                            )}
                                        </td>
                                        <td className={`px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-black data-metric ${getTypeColor(tx.type)}`}>
                                            {formatBTC(btcAmount)} BTC
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
                                                {getStatusText(tx.status)}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {filteredTransactions.length > 0 && itemsPerPage !== -1 && totalPages > 1 && (
                <div className="mt-4 flex justify-center items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
                    >
                        Anterior
                    </button>

                    <div className="flex gap-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                            // Show first page, last page, current page, and pages around current
                            if (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 1 && page <= currentPage + 1)
                            ) {
                                return (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-2 rounded-lg transition ${currentPage === page
                                            ? 'bg-accent text-white font-semibold'
                                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            } else if (
                                page === currentPage - 2 ||
                                page === currentPage + 2
                            ) {
                                return <span key={page} className="px-2 text-gray-500">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition"
                    >
                        Siguiente
                    </button>
                </div>
            )}
        </div>
    );
};
