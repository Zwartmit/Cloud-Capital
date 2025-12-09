import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { TaskDTO } from '@cloud-capital/shared';
import { Check, X, Eye, Clock, ListChecks, Download, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatUSDT } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface TaskManagerProps {
    onTaskProcessed?: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ onTaskProcessed }) => {
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [tasks, setTasks] = useState<TaskDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Action state
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Reject Modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [taskToReject, setTaskToReject] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // Proof Modal state
    const [showProofModal, setShowProofModal] = useState(false);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);

    // History filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'REJECTED'>('ALL');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter, activeTab]);

    useEffect(() => {
        loadTasks();
    }, [activeTab]);

    const loadTasks = async () => {
        setLoading(true);
        setError('');
        try {
            const fetchedTasks = await adminService.getAllTasks(activeTab === 'pending' ? 'PENDING' : undefined);

            if (activeTab === 'pending') {
                setTasks(fetchedTasks);
            } else {
                // Filter out pending for history view
                setTasks(fetchedTasks.filter(t => t.status !== 'PENDING'));
            }
        } catch (err) {
            console.error('Error loading tasks:', err);
            setError('Error al cargar las tareas');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredTasks = () => {
        if (activeTab === 'pending') return tasks;

        return tasks.filter(task => {
            // Search filter (User name, email, or Reference)
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch =
                task.user?.name.toLowerCase().includes(searchLower) ||
                task.user?.email.toLowerCase().includes(searchLower) ||
                (task.reference && task.reference.toLowerCase().includes(searchLower));

            // Status filter
            const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;

            // Type filter
            const matchesType = typeFilter === 'ALL' ||
                (typeFilter === 'DEPOSIT' && task.type.includes('DEPOSIT')) ||
                (typeFilter === 'WITHDRAWAL' && task.type === 'WITHDRAWAL');

            return matchesSearch && matchesStatus && matchesType;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    const filteredTasks = getFilteredTasks();

    // UX State
    const [actionStatus, setActionStatus] = useState<{ [key: string]: 'APPROVED' | 'REJECTED' }>({});
    const [disintegratingTaskId, setDisintegratingTaskId] = useState<string | null>(null);

    const handleApprove = async (taskId: string) => {
        if (!confirm('¿Deseas aprobar esta transacción?')) return;

        setProcessingId(taskId);
        try {
            await adminService.approveTask(taskId);

            // UX Sequence
            setActionStatus(prev => ({ ...prev, [taskId]: 'APPROVED' }));

            // Wait 1s for user to read message
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Trigger disintegration
            setDisintegratingTaskId(taskId);

            // Wait 600ms for animation
            await new Promise(resolve => setTimeout(resolve, 600));

            // Refresh list
            loadTasks();
            if (onTaskProcessed) onTaskProcessed();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al aprobar la tarea');
        } finally {
            setProcessingId(null);
            // Cleanup states after list refresh
            setActionStatus(prev => {
                const newState = { ...prev };
                delete newState[taskId];
                return newState;
            });
            setDisintegratingTaskId(null);
        }
    };

    const openRejectModal = (taskId: string) => {
        setTaskToReject(taskId);
        setRejectReason('');
        setShowRejectModal(true);
    };

    const handleReject = async () => {
        if (!taskToReject) return;

        setProcessingId(taskToReject);
        try {
            await adminService.rejectTask(taskToReject, rejectReason);
            setShowRejectModal(false);

            // UX Sequence
            setActionStatus(prev => ({ ...prev, [taskToReject]: 'REJECTED' }));

            // Wait 1s for user to read message
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Trigger disintegration
            setDisintegratingTaskId(taskToReject);

            // Wait 600ms for animation
            await new Promise(resolve => setTimeout(resolve, 600));

            loadTasks();
            if (onTaskProcessed) onTaskProcessed();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al rechazar la tarea');
        } finally {
            setProcessingId(null);
            if (taskToReject) {
                setActionStatus(prev => {
                    const newState = { ...prev };
                    delete newState[taskToReject];
                    return newState;
                });
            }
            setDisintegratingTaskId(null);
            setTaskToReject(null);
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'DEPOSIT_MANUAL': return 'Depósito Manual';
            case 'DEPOSIT_AUTO': return 'Depósito Auto';
            case 'WITHDRAWAL': return 'Retiro';
            default: return type;
        }
    };

    const getTypeColor = (type: string) => {
        if (type.includes('DEPOSIT')) return 'text-green-400';
        if (type === 'WITHDRAWAL') return 'text-red-400';
        return 'text-gray-400';
    };

    const getProofUrl = (path: string) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        // Assuming API_URL ends with /api, remove it to get base URL
        const baseUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
        return `${baseUrl}${path}`;
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const paginatedTasks = filteredTasks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="card p-6 rounded-xl border-t-4 border-gray-700">
            {/* Section Header */}
            <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Centro de tareas</h3>
                <p className="text-gray-400">
                    Administra las solicitudes de depósito y retiro de los usuarios. Revisa los comprobantes de pago, verifica los montos
                    y aprueba o rechaza las transacciones. Las acciones aquí impactan directamente los balances de los usuarios.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-4 border-b mb-4 border-gray-700">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`pb-3 px-4 font-bold transition-colors ${activeTab === 'pending'
                        ? 'text-accent border-b-2 border-accent'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Pendientes
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`pb-3 px-4 font-bold transition-colors ${activeTab === 'history'
                        ? 'text-accent border-b-2 border-accent'
                        : 'text-gray-400 hover:text-white'
                        }`}
                >
                    <ListChecks className="w-4 h-4 inline mr-2" />
                    Historial
                </button>
            </div>

            {/* Filters (Only for History) */}
            {activeTab === 'history' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 mt-6">
                    <div className="md:col-span-1">
                        <input
                            type="text"
                            placeholder="Buscar..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent"
                        />
                    </div>
                    <div>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as any)}
                            className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent"
                        >
                            <option value="ALL">Todos los estados</option>
                            <option value="COMPLETED">Completados</option>
                            <option value="REJECTED">Rechazados</option>
                        </select>
                    </div>
                    <div>
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value as any)}
                            className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent"
                        >
                            <option value="ALL">Todos los tipos</option>
                            <option value="DEPOSIT">Depósitos</option>
                            <option value="WITHDRAWAL">Retiros</option>
                        </select>
                    </div>
                    {/* Items per page selector */}
                    <div>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => setItemsPerPage(Number(e.target.value))}
                            className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent"
                        >
                            <option value={10}>10 por página</option>
                            <option value={25}>25 por página</option>
                            <option value={50}>50 por página</option>
                            <option value={100}>100 por página</option>
                        </select>
                    </div>
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Cargando tareas...</div>
            ) : error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No hay tareas {activeTab === 'pending' ? 'pendientes' : 'que coincidan con los filtros'}
                </div>
            ) : (
                <>
                    <div className="grid gap-4">
                        {paginatedTasks.map(task => (
                            <div key={task.id} className={`bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 ${disintegratingTaskId === task.id ? 'disintegrate' : ''}`}>

                                {/* Task Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-1">
                                        <span className={`font-bold ${getTypeColor(task.type)}`}>
                                            {getTypeLabel(task.type)}
                                        </span>
                                        <span className="text-gray-500 text-sm">•</span>
                                        <span className="text-white font-bold">{formatUSDT(task.amountUSD)}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded border ${task.status === 'PENDING' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                                            task.status === 'COMPLETED' ? 'border-green-500 text-green-500 bg-green-500/10' :
                                                'border-red-500 text-red-500 bg-red-500/10'
                                            }`}>
                                            {task.status}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-400">
                                        <span className="text-gray-300 font-medium">{task.user?.name}</span> ({task.user?.email})
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        Ref: {task.reference || 'N/A'} • {new Date(task.createdAt).toLocaleString()}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-3 w-full md:w-auto">
                                    {task.proof && (
                                        <button
                                            onClick={() => {
                                                setSelectedProof(task.proof || null);
                                                setShowProofModal(true);
                                            }}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white"
                                            title="Ver comprobante"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    )}

                                    {activeTab === 'pending' && (
                                        <>
                                            {actionStatus[task.id] === 'APPROVED' ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-500 font-bold rounded-lg animate-pulse">
                                                    <Check className="w-5 h-5" /> Tarea aprobada
                                                </div>
                                            ) : actionStatus[task.id] === 'REJECTED' ? (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-500 font-bold rounded-lg animate-pulse">
                                                    <X className="w-5 h-5" /> Tarea rechazada
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(task.id)}
                                                        disabled={processingId === task.id}
                                                        className="flex-1 md:flex-none px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                                                    >
                                                        <Check className="w-4 h-4" /> Aprobar
                                                    </button>
                                                    <button
                                                        onClick={() => openRejectModal(task.id)}
                                                        disabled={processingId === task.id}
                                                        className="flex-1 md:flex-none px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-lg flex items-center justify-center gap-2"
                                                    >
                                                        <X className="w-4 h-4" /> Rechazar
                                                    </button>
                                                </>
                                            )}
                                        </>
                                    )}
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
                                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <span className="text-sm text-gray-400">
                                Página <span className="text-white font-bold">{currentPage}</span> de <span className="text-white font-bold">{totalPages}</span>
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Reject Modal */}
            <Modal isOpen={showRejectModal} onClose={() => setShowRejectModal(false)} title="Rechazar tarea">
                <div className="space-y-4">
                    <p className="text-gray-300">Por favor indica el motivo del rechazo:</p>
                    <textarea
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-lg text-white resize-none focus:ring-accent focus:border-accent"
                        placeholder="Ej: Comprobante ilegible, Wallet incorrecta..."
                    />
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            onClick={() => setShowRejectModal(false)}
                            className="px-4 py-2 text-gray-400 hover:text-white"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleReject}
                            disabled={!rejectReason.trim()}
                            className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold rounded-lg"
                        >
                            Confirmar rechazo
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Proof View Modal */}
            <Modal isOpen={showProofModal} onClose={() => setShowProofModal(false)} title="Comprobante">
                <div className="space-y-4">
                    <div className="flex justify-center bg-black/20 p-2 rounded-lg">
                        {selectedProof && (
                            <img
                                src={getProofUrl(selectedProof)}
                                alt="Comprobante"
                                className="max-w-full max-h-[70vh] rounded-lg object-contain"
                            />
                        )}
                    </div>

                    {selectedProof && (
                        <div className="flex justify-center gap-3">
                            <button
                                onClick={async () => {
                                    try {
                                        const url = getProofUrl(selectedProof);
                                        const response = await fetch(url);
                                        const blob = await response.blob();
                                        const blobUrl = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = blobUrl;
                                        link.download = `comprobante-${Date.now()}.${selectedProof.split('.').pop()}`;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        window.URL.revokeObjectURL(blobUrl);
                                    } catch (e) {
                                        console.error('Download failed:', e);
                                        window.open(getProofUrl(selectedProof), '_blank');
                                    }
                                }}
                                className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-blue-500 text-white rounded-lg transition"
                            >
                                <Download className="w-4 h-4" />
                                Descargar
                            </button>
                            <button
                                onClick={() => window.open(getProofUrl(selectedProof), '_blank')}
                                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Ver
                            </button>
                        </div>
                    )}
                </div>
            </Modal>
        </div>
    );
};
