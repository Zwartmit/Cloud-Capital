import React, { useState, useMemo, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Search, ChevronLeft, ChevronRight, Copy, Check, Shield, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { Modal } from '../common/Modal';
import * as btcPoolService from '../../services/btcPool.service';

interface Task {
    id: string;
    type: string;
    status: string;
    amountUSD: number;
    amountBTC?: number;
    createdAt: string;
    approvedByAdmin?: string;
    rejectionReason?: string;
    destinationUserId?: string;
    assignedAddress?: string; // BTC address for auto deposits
    adminNotes?: string;
    adjustedAmount?: number; // Original requested amount if admin approved with different amount
    btcAddress?: string; // Address for withdrawals
}

interface NotificationCenterProps {
    tasks: Task[];
    loading: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ tasks, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'REJECTED' | 'PENDING'>('ALL');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL');

    // Copy state
    const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

    // Date filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Blockchain Verification Modal state
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [blockchainData, setBlockchainData] = useState<any>(null);
    const [verifying, setVerifying] = useState(false);

    const handleVerifyBlockchain = async (task: Task) => {
        const addressToVerify = task.assignedAddress || (task.type === 'WITHDRAWAL' ? task.btcAddress : undefined);

        // Note: Task interface in NotificationCenter didn't explicitly show btcAddress but it comes from API
        // We cast to any or should update interface. Let's verify interface first.
        // Interface Task defined at top has: assignedAddress?: string;
        // It does NOT have btcAddress explicitly? lines 6-19.
        // Need to add btcAddress to interface as well.
        if (!addressToVerify && !task.assignedAddress) return;

        // Correct logic:
        // For auto deposit: assignedAddress
        // For withdrawal: check if task has btcAddress (it should be in the response)

        const effectiveAddress = task.assignedAddress || task.btcAddress;

        if (!effectiveAddress) return;

        setSelectedTask(task);
        setShowBlockchainModal(true);
        setVerifying(true);
        setBlockchainData(null);

        try {
            const data = await btcPoolService.verifyDeposit({
                address: effectiveAddress,
                expectedAmountBTC: task.amountBTC
            });
            setBlockchainData({
                ...data,
                explorerLink: `https://mempool.space/${import.meta.env.VITE_BTC_NETWORK === 'mainnet' ? '' : 'testnet/'}address/${effectiveAddress}`
            });
        } catch (error) {
            console.error('Error verifying blockchain:', error);
            setBlockchainData({ error: 'No se pudo verificar la información de la blockchain. Intente nuevamente.' });
        } finally {
            setVerifying(false);
        }
    };

    const handleRefreshBlockchain = () => {
        if (selectedTask) {
            handleVerifyBlockchain(selectedTask);
        }
    };

    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter, dateFrom, dateTo]);

    const getTaskIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            case 'REJECTED':
                return <XCircle className="w-5 h-5 text-red-500" />;
            case 'PENDING':
            case 'PRE_APPROVED':
                return <Clock className="w-5 h-5 text-yellow-500" />;
            case 'PRE_REJECTED':
                return <XCircle className="w-5 h-5 text-orange-500" />;
            default:
                return <Bell className="w-5 h-5 text-gray-500" />;
        }
    };

    const getTaskColor = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'border-green-500/20 bg-green-500/5';
            case 'REJECTED':
                return 'border-red-500/20 bg-red-500/5';
            case 'PENDING':
            case 'PRE_APPROVED':
                return 'border-yellow-500/20 bg-yellow-500/5';
            case 'PRE_REJECTED':
                return 'border-orange-500/20 bg-orange-500/5';
            default:
                return 'border-gray-700 bg-secondary';
        }
    };

    const getStatusText = (task: Task) => {
        const isDeposit = task.type.includes('DEPOSIT');

        switch (task.status) {
            case 'COMPLETED':
                if (task.type === 'WITHDRAWAL' && task.destinationUserId) {
                    return 'Transacción aprobada. Pendiente de envío del comprobante vía WhatsApp.';
                }
                return isDeposit ? 'Orden aprobada - Saldo acreditado' : 'Liquidación completada';
            case 'REJECTED':
                return 'Rechazada';
            case 'PENDING':
                return 'Orden creada';
            case 'PRE_APPROVED':
                return 'Pre-aprobada';
            case 'PRE_REJECTED':
                return 'Pre-rechazada';
            default:
                return task.status;
        }
    };

    const getTypeText = (type: string) => {
        switch (type) {
            case 'DEPOSIT_MANUAL':
                return 'Depósito Manual';
            case 'DEPOSIT_AUTO':
                return 'Depósito Auto';
            case 'WITHDRAWAL':
                return 'Retiro';
            case 'LIQUIDATION':
                return 'Liquidación de Capital';
            default:
                return type;
        }
    };

    const getTypeIcon = (type: string) => {
        if (type.includes('DEPOSIT')) {
            return <TrendingUp className="w-4 h-4" />;
        }
        return <TrendingDown className="w-4 h-4" />;
    };

    // Copy BTC address to clipboard
    const handleCopyAddress = async (address: string) => {
        try {
            await navigator.clipboard.writeText(address);
            setCopiedAddress(address);
            setTimeout(() => setCopiedAddress(null), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };

    // Filter tasks based on search and filters
    const filteredTasks = useMemo(() => {
        return tasks.filter(task => {
            // Search filter
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                getTypeText(task.type).toLowerCase().includes(searchLower) ||
                task.amountUSD.toString().includes(searchLower) ||
                (task.approvedByAdmin && task.approvedByAdmin.toLowerCase().includes(searchLower)) ||
                (task.rejectionReason && task.rejectionReason.toLowerCase().includes(searchLower));

            // Status filter
            const matchesStatus = statusFilter === 'ALL' ||
                (statusFilter === 'PENDING' && (task.status === 'PENDING' || task.status === 'PRE_APPROVED')) ||
                task.status === statusFilter;

            // Type filter
            const matchesType = typeFilter === 'ALL' ||
                (typeFilter === 'DEPOSIT' && task.type.includes('DEPOSIT')) ||
                (typeFilter === 'WITHDRAWAL' && task.type === 'WITHDRAWAL');

            // Date filter
            const taskDate = new Date(task.createdAt);
            const matchesDateFrom = !dateFrom || taskDate >= new Date(dateFrom);
            const matchesDateTo = !dateTo || taskDate <= new Date(dateTo + 'T23:59:59');

            return matchesSearch && matchesStatus && matchesType && matchesDateFrom && matchesDateTo;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [tasks, searchTerm, statusFilter, typeFilter, dateFrom, dateTo]);

    // Pagination logic
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const paginatedTasks = filteredTasks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="card p-4 sm:p-6 rounded-xl border border-secondary">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Bell className="w-5 h-5 text-accent" />
                <h3 className="text-lg sm:text-xl font-bold text-white">
                    Centro de notificaciones
                </h3>
            </div>

            {/* Filters */}
            <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-4 space-y-4">
                {/* First row: Search, Status, Type, Items per page */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as any)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                    >
                        <option value="ALL">Estado: Todos</option>
                        <option value="PENDING">Pendientes</option>
                        <option value="COMPLETED">Aprobadas</option>
                        <option value="REJECTED">Rechazadas</option>
                    </select>

                    {/* Type Filter */}
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value as any)}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                    >
                        <option value="ALL">Tipo: Todos</option>
                        <option value="DEPOSIT">Depósitos</option>
                        <option value="WITHDRAWAL">Retiros</option>
                    </select>

                    {/* Items per page */}
                    <select
                        value={itemsPerPage}
                        onChange={(e) => {
                            setItemsPerPage(Number(e.target.value));
                            setCurrentPage(1);
                        }}
                        className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                    >
                        <option value={10}>10 por página</option>
                        <option value={25}>25 por página</option>
                        <option value={50}>50 por página</option>
                    </select>
                </div>

                {/* Second row: Date filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Desde</label>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-400 mb-1.5">Hasta</label>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                        />
                    </div>
                </div>

                {/* Clear filters button */}
                {(searchTerm || statusFilter !== 'ALL' || typeFilter !== 'ALL' || dateFrom || dateTo) && (
                    <div className="flex justify-end">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('ALL');
                                setTypeFilter('ALL');
                                setDateFrom('');
                                setDateTo('');
                            }}
                            className="text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                )}
            </div>

            {loading ? (
                <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-400">
                    Cargando notificaciones...
                </div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-400">
                    {tasks.length === 0 ? 'No tienes notificaciones' : 'No se encontraron notificaciones con los filtros aplicados'}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
                        {paginatedTasks.map((task) => (
                            <div
                                key={task.id}
                                className={`p-3 sm:p-4 rounded-lg border transition-all ${getTaskColor(task.status)}`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getTaskIcon(task.status)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                {getTypeIcon(task.type)}
                                                <p className="text-sm sm:text-base font-semibold text-white">
                                                    {getTypeText(task.type)}
                                                </p>
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-400">
                                                {getStatusText(task)}
                                                <span className="ml-1">• {new Date(task.createdAt).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}</span>
                                            </div>
                                            {(task.status === 'PRE_APPROVED' || task.status === 'PRE_REJECTED') && task.approvedByAdmin && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Por: {task.approvedByAdmin}
                                                </p>
                                            )}
                                            {(task.status === 'REJECTED' || task.status === 'PRE_REJECTED') && task.rejectionReason && (
                                                <div className={`mt-2 p-2 ${task.status === 'PRE_REJECTED' ? 'bg-orange-500/10 border-orange-500/20' : 'bg-red-500/10 border-red-500/20'} border rounded text-xs ${task.status === 'PRE_REJECTED' ? 'text-orange-400' : 'text-red-400'}`}>
                                                    <span className="font-semibold">Motivo: </span>
                                                    {task.rejectionReason}
                                                </div>
                                            )}
                                            {task.adminNotes && (
                                                <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                                                    <span className="font-semibold">Nota: </span>
                                                    {task.adminNotes}
                                                </div>
                                            )}
                                            {/* Show BTC address for auto deposits */}
                                            {task.type === 'DEPOSIT_AUTO' && task.assignedAddress && (
                                                <div className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] text-gray-400 mb-0.5">Dirección BTC asignada:</p>
                                                            <p className="text-xs text-blue-400 font-mono truncate">{task.assignedAddress}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopyAddress(task.assignedAddress!)}
                                                            className="flex-shrink-0 p-1.5 hover:bg-blue-500/20 rounded transition"
                                                            title="Copiar dirección"
                                                        >
                                                            {copiedAddress === task.assignedAddress ? (
                                                                <Check className="w-4 h-4 text-green-400" />
                                                            ) : (
                                                                <Copy className="w-4 h-4 text-blue-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-blue-500/20 flex justify-end">
                                                        <button
                                                            onClick={() => handleVerifyBlockchain(task)}
                                                            className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                                                        >
                                                            <Shield className="w-3.5 h-3.5" />
                                                            Verificar en Blockchain
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Show BTC address for WITHDRAWAL */}
                                            {task.type === 'WITHDRAWAL' && task.btcAddress && (
                                                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[10px] text-gray-400 mb-0.5">Dirección destino:</p>
                                                            <p className="text-xs text-red-300 font-mono truncate">{task.btcAddress}</p>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopyAddress(task.btcAddress!)}
                                                            className="flex-shrink-0 p-1.5 hover:bg-red-500/20 rounded transition"
                                                            title="Copiar dirección"
                                                        >
                                                            {copiedAddress === task.btcAddress ? (
                                                                <Check className="w-4 h-4 text-green-400" />
                                                            ) : (
                                                                <Copy className="w-4 h-4 text-red-400" />
                                                            )}
                                                        </button>
                                                    </div>
                                                    <div className="mt-2 pt-2 border-t border-red-500/20 flex justify-end">
                                                        <button
                                                            onClick={() => handleVerifyBlockchain(task)}
                                                            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                                                        >
                                                            <Shield className="w-3.5 h-3.5" />
                                                            Verificar en Blockchain
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        {task.adjustedAmount ? (
                                            // Show both requested and approved amounts when they differ
                                            <div className="space-y-0.5">
                                                <p className="text-xs text-gray-400 line-through">
                                                    {task.type.includes('DEPOSIT') ? '+' : '-'}${task.adjustedAmount.toLocaleString()}
                                                </p>
                                                <p className={`text-sm sm:text-base font-bold ${task.type.includes('DEPOSIT') ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {task.type.includes('DEPOSIT') ? '+' : '-'}${task.amountUSD.toLocaleString()}
                                                </p>
                                                <p className="text-[10px] text-blue-400">
                                                    Aprobado
                                                </p>
                                            </div>
                                        ) : (
                                            // Show only approved amount when no adjustment
                                            <p className={`text-sm sm:text-base font-bold ${task.type.includes('DEPOSIT') ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {task.type.includes('DEPOSIT') ? '+' : '-'}${task.amountUSD.toLocaleString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-2 mt-6">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-gray-400">
                                Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Blockchain Verification Modal */}
            <Modal
                isOpen={showBlockchainModal}
                onClose={() => setShowBlockchainModal(false)}
                title="Verificación en Blockchain"
            >
                <div className="space-y-4">
                    {verifying ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
                            <p className="mt-4 text-gray-300">Verificando en Blockchain...</p>
                        </div>
                    ) : blockchainData ? (
                        <>
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <h3 className="text-white font-bold mb-3 flex items-center gap-2">
                                    {blockchainData.error ? (
                                        <><AlertCircle className="w-5 h-5 text-red-500" /> ❌ Error</>
                                    ) : blockchainData.verified ? (
                                        <><Check className="w-5 h-5 text-green-500" /> ✅ Verificado</>
                                    ) : (
                                        <><AlertCircle className="w-5 h-5 text-yellow-500" /> ⚠️ Pendiente</>
                                    )}
                                </h3>

                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">
                                            {selectedTask?.type === 'WITHDRAWAL' ? 'Dirección destino:' : 'Dirección asignada:'}
                                        </span>
                                        <code className="text-cyan-400 text-xs">{selectedTask?.assignedAddress || selectedTask?.btcAddress}</code>
                                    </div>
                                    {blockchainData.expectedAmountBTC && (
                                        <div className="flex justify-between">
                                            <span className="text-gray-400">Monto esperado:</span>
                                            <strong className="text-yellow-400">{blockchainData.expectedAmountBTC.toFixed(8)} BTC</strong>
                                        </div>
                                    )}
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Balance:</span>
                                        <strong className="text-white">{blockchainData.balance} BTC</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Total recibido:</span>
                                        <strong className={blockchainData.totalReceived > 0 ? "text-green-400" : "text-white"}>{blockchainData.totalReceived} BTC</strong>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Confirmaciones:</span>
                                        <strong className={blockchainData.confirmations >= 1 ? 'text-green-500' : 'text-yellow-500'}>
                                            {blockchainData.confirmations}
                                        </strong>
                                    </div>
                                </div>

                                {blockchainData.validationMessage && (
                                    <div className={`mt-3 p-3 rounded border-l-4 ${blockchainData.error ? 'bg-red-900/20 border-red-500' :
                                        blockchainData.verified ? 'bg-green-900/20 border-green-500' :
                                            'bg-yellow-900/20 border-yellow-500'
                                        }`}>
                                        <p className="text-sm text-gray-300 whitespace-pre-line">{blockchainData.validationMessage}</p>
                                    </div>
                                )}

                                {blockchainData.message && !blockchainData.validationMessage && (
                                    <div className="mt-3 p-3 bg-gray-900/50 rounded border-l-4 border-cyan-500">
                                        <p className="text-sm text-gray-300">{blockchainData.message}</p>
                                    </div>
                                )}

                                {blockchainData.explorerLink && !blockchainData.error && (
                                    <a
                                        href={blockchainData.explorerLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition w-full"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Ver en Explorador de Bloques
                                    </a>
                                )}
                            </div>

                            {/* Transactions */}
                            <div className="mt-4 border-t border-gray-700 pt-4">
                                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <RefreshCw className="w-4 h-4 text-gray-400" />
                                    Últimas Transacciones
                                </h4>
                                {blockchainData.transactions && blockchainData.transactions.length > 0 ? (
                                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                                        {blockchainData.transactions.map((tx: any) => (
                                            <div key={tx.txid} className="p-3 bg-gray-900/50 rounded-lg border border-gray-700/50">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <a
                                                            href={`https://mempool.space/tx/${tx.txid}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs font-mono text-accent hover:underline flex items-center gap-1"
                                                        >
                                                            {tx.txid.substring(0, 8)}...{tx.txid.substring(tx.txid.length - 8)}
                                                            <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <span className={`text-xs px-1.5 py-0.5 rounded ${tx.confirmed ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                                                                }`}>
                                                                {tx.confirmed ? 'Confirmada' : 'Pendiente'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {new Date(tx.time * 1000).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-sm font-bold ${tx.value > 0 ? 'text-green-400' : 'text-white'}`}>
                                                            {tx.value > 0 ? '+' : ''}{tx.value} BTC
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 italic text-center py-4 bg-gray-900/50 rounded-lg">
                                        No se encontraron transacciones recientes
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end pt-4 mt-2 border-t border-gray-700">
                                <button
                                    onClick={handleRefreshBlockchain}
                                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    Actualizar
                                </button>
                            </div>

                        </>
                    ) : (
                        <p className="text-gray-400 text-center py-4">No hay datos disponibles</p>
                    )}
                </div>
            </Modal >

        </div >
    );
};
