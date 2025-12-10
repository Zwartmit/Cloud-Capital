import React, { useState, useMemo, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Clock, TrendingUp, TrendingDown, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Task {
    id: string;
    type: string;
    status: string;
    amountUSD: number;
    createdAt: string;
    approvedByAdmin?: string;
    rejectionReason?: string;
}

interface NotificationCenterProps {
    tasks: Task[];
    loading: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ tasks, loading }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'REJECTED' | 'PENDING'>('ALL');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL');

    // Date filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

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

    const getStatusText = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return 'Aprobada';
            case 'REJECTED':
                return 'Rechazada';
            case 'PENDING':
                return 'Pendiente';
            case 'PRE_APPROVED':
                return 'Pre-aprobada';
            case 'PRE_REJECTED':
                return 'Pre-rechazada';
            default:
                return status;
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
        });
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
                                            <p className="text-xs sm:text-sm text-gray-400">
                                                {getStatusText(task.status)} • {new Date(task.createdAt).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                            {task.approvedByAdmin && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Por: {task.approvedByAdmin}
                                                </p>
                                            )}
                                            {task.status === 'REJECTED' && task.rejectionReason && (
                                                <div className="mt-2 p-2 bg-red-500/10 border border-red-500/20 rounded text-xs text-red-400">
                                                    <span className="font-semibold">Motivo: </span>
                                                    {task.rejectionReason}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        <p className={`text-sm sm:text-base font-bold ${task.type.includes('DEPOSIT') ? 'text-green-400' : 'text-red-400'
                                            }`}>
                                            {task.type.includes('DEPOSIT') ? '+' : '-'}${task.amountUSD.toLocaleString()}
                                        </p>
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
        </div>
    );
};
