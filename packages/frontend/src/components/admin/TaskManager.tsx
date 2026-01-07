import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import * as btcPoolService from '../../services/btcPool.service';
import { TaskDTO, UserDTO } from '@cloud-capital/shared';
import { Check, X, Eye, Clock, ListChecks, Download, ExternalLink, ChevronLeft, ChevronRight, AlertCircle, Shield, MessageCircle } from 'lucide-react';
import { formatUSDT } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import { CollaboratorProofModal } from './CollaboratorProofModal';
import { useAuthStore } from '../../store/authStore';

interface TaskManagerProps {
    onTaskProcessed?: () => void;
}

export const TaskManager: React.FC<TaskManagerProps> = ({ onTaskProcessed }) => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'pending' | 'preapproved' | 'history'>('pending');
    const [tasks, setTasks] = useState<TaskDTO[]>([]);
    const [allTasks, setAllTasks] = useState<TaskDTO[]>([]); // For badge counts
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [collaborators, setCollaborators] = useState<UserDTO[]>([]);
    const [collaboratorFilter, setCollaboratorFilter] = useState('ALL');

    // Action state
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Reject Modal state
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [taskToReject, setTaskToReject] = useState<string | null>(null);
    const [rejectReason, setRejectReason] = useState('');

    // Proof Modal state
    const [showProofModal, setShowProofModal] = useState(false);
    const [selectedProof, setSelectedProof] = useState<string | null>(null);
    const [selectedProofReference, setSelectedProofReference] = useState<string | null>(null);

    // Blockchain Verification Modal state
    const [showBlockchainModal, setShowBlockchainModal] = useState(false);
    const [selectedTask, setSelectedTask] = useState<TaskDTO | null>(null);
    const [blockchainData, setBlockchainData] = useState<any>(null);
    const [verifying, setVerifying] = useState(false);

    // Received Amount Modal state
    const [showReceivedAmountModal, setShowReceivedAmountModal] = useState(false);
    const [taskToApprove, setTaskToApprove] = useState<string | null>(null);
    const [receivedAmount, setReceivedAmount] = useState('');

    // Collaborator Proof Modal state
    const [showCollaboratorProofModal, setShowCollaboratorProofModal] = useState(false);
    const [taskToApproveWithProof, setTaskToApproveWithProof] = useState<TaskDTO | null>(null);

    // History filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'REJECTED'>('ALL');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'DEPOSIT' | 'WITHDRAWAL'>('ALL');

    // Date filters
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter, dateFrom, dateTo, activeTab]);

    useEffect(() => {
        loadTasks();
        loadCollaborators();
    }, [activeTab]);

    const loadCollaborators = async () => {
        try {
            const data = await adminService.getAllStaff();
            setCollaborators(data);
        } catch (err) {
            console.error('Error loading collaborators:', err);
        }
    };

    const loadTasks = async () => {
        setLoading(true);
        setError('');
        try {
            // Always load all tasks for badge counts
            const allTasksData = await adminService.getAllTasks();
            setAllTasks(allTasksData);

            let fetchedTasks;
            if (activeTab === 'pending') {
                fetchedTasks = allTasksData.filter(t => t.status === 'PENDING');
            } else if (activeTab === 'preapproved') {
                // Filter PRE_APPROVED and PRE_REJECTED tasks
                fetchedTasks = allTasksData.filter(t =>
                    t.status === 'PRE_APPROVED' || t.status === 'PRE_REJECTED'
                ).sort((a, b) =>
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
            } else {
                // History: all tasks except PENDING, PRE_APPROVED, and PRE_REJECTED
                fetchedTasks = allTasksData.filter(t =>
                    t.status !== 'PENDING' &&
                    t.status !== 'PRE_APPROVED' &&
                    t.status !== 'PRE_REJECTED'
                );
            }
            setTasks(fetchedTasks);
        } catch (err) {
            console.error('Error loading tasks:', err);
            setError('Error al cargar las tareas');
        } finally {
            setLoading(false);
        }
    };

    const getFilteredTasks = () => {
        return tasks.filter(task => {
            // Search filter (User name, email, Reference, or BTC addresses)
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = !searchTerm ||
                task.user?.name.toLowerCase().includes(searchLower) ||
                task.user?.email.toLowerCase().includes(searchLower) ||
                (task.reference && task.reference.toLowerCase().includes(searchLower)) ||
                (task.assignedAddress && task.assignedAddress.toLowerCase().includes(searchLower)) ||
                (task.btcAddress && task.btcAddress.toLowerCase().includes(searchLower));

            // Status filter (only for history tab)
            const matchesStatus = activeTab === 'history'
                ? (statusFilter === 'ALL' || task.status === statusFilter)
                : true;

            // Type filter
            const matchesType = typeFilter === 'ALL' ||
                (typeFilter === 'DEPOSIT' && task.type.includes('DEPOSIT')) ||
                (typeFilter === 'WITHDRAWAL' && task.type === 'WITHDRAWAL');

            // Date filter
            const taskDate = new Date(task.createdAt);
            const matchesDateFrom = !dateFrom || taskDate >= new Date(dateFrom);
            const matchesDateTo = !dateTo || taskDate <= new Date(dateTo + 'T23:59:59');

            // Collaborator Filter
            const matchesCollaborator = collaboratorFilter === 'ALL' || task.collaboratorId === collaboratorFilter;

            return matchesSearch && matchesStatus && matchesType && matchesDateFrom && matchesDateTo && matchesCollaborator;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    };

    const filteredTasks = getFilteredTasks();

    // Calculate counts for each tab from allTasks
    const pendingCount = allTasks.filter(t => t.status === 'PENDING').length;
    const preApprovedCount = allTasks.filter(t => t.status === 'PRE_APPROVED' || t.status === 'PRE_REJECTED').length;

    // UX State
    const [actionStatus, setActionStatus] = useState<{ [key: string]: 'APPROVED' | 'REJECTED' }>({});
    const [disintegratingTaskId, setDisintegratingTaskId] = useState<string | null>(null);

    const handleApprove = async (taskId: string) => {
        const task = tasks.find(t => t.id === taskId);
        const isPreApproval = user?.role === 'SUBADMIN' && !task?.collaboratorId && !task?.destinationUserId;
        const isFinalApproval = task?.status === 'PRE_APPROVED';

        // Check if current user is the assigned collaborator
        const isAssignedCollaborator = (task?.collaboratorId === user?.id) || (task?.destinationUserId === user?.id);

        // If assigned collaborator, show proof modal
        if (isAssignedCollaborator && task) {
            setTaskToApproveWithProof(task);
            setShowCollaboratorProofModal(true);
            return;
        }

        // Check if this is a direct deposit with assigned address
        const isDirectDepositWithAddress = task?.type === 'DEPOSIT_AUTO' && task?.assignedAddress;

        if (isDirectDepositWithAddress) {
            // Show modal to ask for received amount
            setTaskToApprove(taskId);
            setReceivedAmount(task?.amountUSD?.toString() || '');
            setShowReceivedAmountModal(true);
            return;
        }

        const actionText = isPreApproval ? 'PRE-APROBAR' : isFinalApproval ? 'APROBAR FINALMENTE' : 'aprobar';

        if (!confirm(`¿Deseas ${actionText} esta transacción?`)) return;

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

    const handleApproveWithReceivedAmount = async () => {
        if (!taskToApprove) return;

        const receivedAmountNum = parseFloat(receivedAmount);
        if (isNaN(receivedAmountNum) || receivedAmountNum <= 0) {
            alert('Por favor ingresa un monto válido');
            return;
        }

        const task = tasks.find(t => t.id === taskToApprove);
        const isPreApproval = user?.role === 'SUBADMIN' && !task?.collaboratorId && !task?.destinationUserId;
        const isFinalApproval = task?.status === 'PRE_APPROVED';
        const actionText = isPreApproval ? 'PRE-APROBAR' : isFinalApproval ? 'APROBAR FINALMENTE' : 'aprobar';

        if (!confirm(`¿Deseas ${actionText} esta transacción con un monto recibido de $${receivedAmountNum}?`)) return;

        setShowReceivedAmountModal(false);
        setProcessingId(taskToApprove);
        try {
            await adminService.approveTask(taskToApprove, receivedAmountNum);

            // UX Sequence
            setActionStatus(prev => ({ ...prev, [taskToApprove]: 'APPROVED' }));

            // Wait 1s for user to read message
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Trigger disintegration
            setDisintegratingTaskId(taskToApprove);

            // Wait 600ms for animation
            await new Promise(resolve => setTimeout(resolve, 600));

            // Refresh list
            loadTasks();
            if (onTaskProcessed) onTaskProcessed();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al aprobar la tarea');
        } finally {
            setProcessingId(null);
            if (taskToApprove) {
                setActionStatus(prev => {
                    const newState = { ...prev };
                    delete newState[taskToApprove];
                    return newState;
                });
            }
            setDisintegratingTaskId(null);
            setTaskToApprove(null);
            setReceivedAmount('');
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

    const handleCollaboratorProofSubmit = async (proof: File, reference: string) => {
        if (!taskToApproveWithProof) return;

        setProcessingId(taskToApproveWithProof.id);
        try {
            await adminService.approveTask(taskToApproveWithProof.id, undefined, proof, reference);

            // UX Sequence
            setActionStatus(prev => ({ ...prev, [taskToApproveWithProof.id]: 'APPROVED' }));

            // Wait 1s for user to read message
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Trigger disintegration
            setDisintegratingTaskId(taskToApproveWithProof.id);

            // Wait 600ms for animation
            await new Promise(resolve => setTimeout(resolve, 600));

            loadTasks();
            if (onTaskProcessed) onTaskProcessed();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al aprobar la tarea');
        } finally {
            setProcessingId(null);
            setActionStatus(prev => {
                const newState = { ...prev };
                delete newState[taskToApproveWithProof.id];
                return newState;
            });
            setDisintegratingTaskId(null);
            setTaskToApproveWithProof(null);
        }
    };

    const handleToggleVerification = async (taskId: string, currentStatus: boolean) => {
        try {
            await adminService.verifyCollaboratorTask(taskId, !currentStatus);
            // Update local state without reload
            setTasks(prev => prev.map(t =>
                t.id === taskId
                    ? { ...t, collaboratorVerified: !currentStatus }
                    : t
            ));
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al actualizar verificación');
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'DEPOSIT_MANUAL': return 'Depósito Manual';
            case 'DEPOSIT_AUTO': return 'Depósito Auto';
            case 'WITHDRAWAL': return 'Retiro';
            case 'LIQUIDATION': return 'Liquidación de Capital';
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

    const handleVerifyBlockchain = async (task: TaskDTO) => {
        const addressToVerify = task.assignedAddress || task.btcAddress;
        if (!addressToVerify) {
            setError('Esta tarea no tiene dirección BTC asignada');
            return;
        }

        setSelectedTask(task);
        setShowBlockchainModal(true);
        setVerifying(true);
        setBlockchainData(null);
        setError('');

        try {
            // Calculate expected BTC amount if we have the price
            const expectedAmountBTC = task.amountBTC || (task.btcPrice ? task.amountUSD / task.btcPrice : undefined);

            // For withdrawals, we verify the destination address
            const address = task.assignedAddress || task.btcAddress!;

            const result = await btcPoolService.verifyDeposit({
                address,
                expectedAmountBTC,
                minConfirmations: 1,
            });

            const explorerLink = `https://mempool.space/${import.meta.env.VITE_BTC_NETWORK === 'mainnet' ? '' : 'testnet/'}address/${address}`;

            // Enhanced validation
            let validationMessage = '';
            if (result.verified) {
                validationMessage = '✅ Depósito verificado exitosamente';

                // Check if amount matches expected
                if (expectedAmountBTC && result.totalReceived) {
                    const difference = Math.abs(result.totalReceived - expectedAmountBTC);
                    const tolerance = expectedAmountBTC * 0.01; // 1% tolerance

                    if (difference > tolerance) {
                        validationMessage += `\n⚠️ Advertencia: El monto recibido (${result.totalReceived} BTC) difiere del esperado (${expectedAmountBTC} BTC)`;
                    }
                }
            } else {
                validationMessage = '⚠️ Depósito pendiente de confirmación';

                if (result.totalReceived === 0) {
                    validationMessage += '\n❌ No se han detectado transacciones en esta dirección';
                }
            }

            setBlockchainData({
                ...result,
                explorerLink,
                validationMessage,
                expectedAmountBTC,
            });
        } catch (error: any) {
            console.error('Error verifying deposit:', error);
            setError(error.response?.data?.error || 'Error al verificar depósito en blockchain. Por favor, intenta de nuevo.');
            // Don't close the modal, show error inside
            setBlockchainData({
                verified: false,
                balance: 0,
                totalReceived: 0,
                confirmations: 0,
                message: 'Error al conectar con la blockchain',
                error: true,
            });
        } finally {
            setVerifying(false);
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'PENDIENTE';
            case 'PRE_APPROVED':
                return 'PRE-APROBADA';
            case 'PRE_REJECTED':
                return 'PRE-RECHAZADA';
            case 'COMPLETED':
                return 'COMPLETADA';
            case 'REJECTED':
                return 'RECHAZADA';
            default:
                return status;
        }
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);
    const paginatedTasks = filteredTasks.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="card p-6 rounded-xl">
            {/* Tabs */}
            <div className="flex flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0 mb-4">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`relative pb-2 sm:pb-3 px-3 sm:px-4 font-bold transition-colors text-left sm:text-center ${activeTab === 'pending'
                        ? 'text-blue-400 border-l-4 sm:border-l-0 sm:border-b-2 border-blue-400 bg-blue-400/10 sm:bg-transparent'
                        : 'text-gray-400 hover:text-white border-l-4 border-transparent'
                        }`}
                >
                    <Clock className="w-4 h-4 inline mr-2" />
                    Pendientes
                    {pendingCount > 0 && (
                        <span className="ml-2 sm:absolute sm:-top-2 sm:-right-2 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                            {pendingCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('preapproved')}
                    className={`relative pb-2 sm:pb-3 px-3 sm:px-4 font-bold transition-colors text-left sm:text-center ${activeTab === 'preapproved'
                        ? 'text-orange-400 border-l-4 sm:border-l-0 sm:border-b-2 border-orange-400 bg-orange-400/10 sm:bg-transparent'
                        : 'text-gray-400 hover:text-white border-l-4 border-transparent'
                        }`}
                >
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Por revisar
                    {preApprovedCount > 0 && (
                        <span className="ml-2 sm:absolute sm:-top-2 sm:-right-2 bg-orange-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                            {preApprovedCount}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`relative pb-2 sm:pb-3 px-3 sm:px-4 font-bold transition-colors text-left sm:text-center ${activeTab === 'history'
                        ? 'text-green-400 border-l-4 sm:border-l-0 sm:border-b-2 border-green-400 bg-green-400/10 sm:bg-transparent'
                        : 'text-gray-400 hover:text-white border-l-4 border-transparent'
                        }`}
                >
                    <ListChecks className="w-4 h-4 inline mr-2" />
                    Historial
                </button>
            </div>

            {/* Filters */}
            {(activeTab === 'pending' || activeTab === 'preapproved' || activeTab === 'history') && (
                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-6 mt-6 space-y-4">
                    {/* First row: Search, Status (history only), Type, Items per page */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, email, referencia o dirección BTC..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent"
                            />
                        </div>
                        {activeTab === 'history' && (
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
                        )}
                        <div className={activeTab === 'history' ? '' : 'md:col-span-1'}>
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
                        {/* Collaborator Filter */}
                        {user?.role === 'SUPERADMIN' && (
                            <div className="md:col-span-1">
                                <select
                                    value={collaboratorFilter}
                                    onChange={(e) => setCollaboratorFilter(e.target.value)}
                                    className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent"
                                >
                                    <option value="ALL">Todos los colaboradores</option>
                                    {collaborators.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
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

                    {/* Second row: Date filters */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Desde</label>
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-400 mb-1.5">Hasta</label>
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full p-2.5 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent"
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
            )}

            {/* Content */}
            {loading ? (
                <div className="text-center py-12 text-gray-500">Cargando tareas...</div>
            ) : error ? (
                <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    No hay tareas {activeTab === 'pending' ? 'pendientes' : activeTab === 'preapproved' ? 'por revisar' : 'que coincidan con los filtros'}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {paginatedTasks.map(task => (
                            <div key={task.id} className={`bg-gray-800 p-4 rounded-xl border border-gray-700 flex flex-col gap-4 ${disintegratingTaskId === task.id ? 'disintegrate' : ''}`}>

                                {/* Task Info */}
                                <div className="flex-1">
                                    <div className="flex flex-wrap items-center gap-2 mb-1">
                                        <span className={`font-bold ${getTypeColor(task.type)} whitespace-nowrap`}>
                                            {getTypeLabel(task.type)}
                                        </span>
                                        <span className="text-gray-500 text-sm hidden sm:inline">•</span>
                                        {task.adjustedAmount ? (
                                            // Show both requested and approved amounts when they differ
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-400 line-through text-sm">{formatUSDT(task.adjustedAmount)}</span>
                                                <span className="text-white font-bold">{formatUSDT(task.amountUSD)}</span>
                                            </div>
                                        ) : (
                                            // Show only approved amount when no adjustment
                                            <span className="text-white font-bold whitespace-nowrap">{formatUSDT(task.amountUSD)}</span>
                                        )}
                                        <span className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${task.status === 'PENDING' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' :
                                            task.status === 'PRE_APPROVED' ? 'border-orange-500 text-orange-500 bg-orange-500/10' :
                                                task.status === 'COMPLETED' ? 'border-green-500 text-green-500 bg-green-500/10' :
                                                    'border-red-500 text-red-500 bg-red-500/10'
                                            }`}>
                                            {getStatusLabel(task.status)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-400 mt-1">{task.user?.name} ({task.user?.email})</p>
                                    {task.reference && <p className="text-xs text-gray-500 mt-1">Ref: {task.reference}</p>}
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(task.createdAt).toLocaleString('es-ES')}
                                    </p>

                                    {task.assignedAddress && (
                                        <div className="mt-2 bg-gray-900/50 p-2 rounded">
                                            <p className="text-xs text-gray-400 mb-1">Dirección BTC asignada:</p>
                                            <p className="text-xs text-accent font-mono break-all">{task.assignedAddress}</p>
                                        </div>
                                    )}

                                    {task.btcAddress && (
                                        <div className="mt-2 bg-gray-900/50 p-2 rounded">
                                            <p className="text-xs text-gray-400 mb-1">Dirección BTC destino:</p>
                                            <p className="text-xs text-accent font-mono break-all">{task.btcAddress}</p>
                                        </div>
                                    )}

                                    {task.txid && (
                                        <p className="text-xs text-gray-400 mt-2">
                                            TXID: <span className="text-white font-mono break-all">{task.txid}</span>
                                        </p>
                                    )}


                                    {(task.status === 'REJECTED' || task.status === 'PRE_REJECTED') && task.rejectionReason && (
                                        <div className={`mt-2 p-2 ${task.status === 'PRE_REJECTED' ? 'bg-orange-900/20 border-orange-700' : 'bg-red-900/20 border-red-700'} border rounded`}>
                                            <p className={`text-xs ${task.status === 'PRE_REJECTED' ? 'text-orange-400' : 'text-red-400'}`}>
                                                <span className="font-bold">Razón de rechazo:</span> {task.rejectionReason}
                                            </p>
                                        </div>
                                    )}

                                    {task.adminNotes && (
                                        <div className="mt-2 p-2 bg-blue-900/20 border border-blue-700 rounded">
                                            <p className="text-xs text-blue-400">
                                                <span className="font-bold">Nota:</span> {task.adminNotes}
                                            </p>
                                        </div>
                                    )}

                                    {activeTab === 'history' && task.approvedByAdmin && (
                                        <p className="text-xs text-gray-500 mt-1">
                                            Procesado por: {task.approvedByAdmin}
                                        </p>
                                    )}

                                    {task.type === 'DEPOSIT_MANUAL' && task.depositMethod === 'COLLABORATOR' && (
                                        <div className="mt-2">
                                            <p className="text-xs text-gray-400">Via colaborador: {task.collaborator?.name}</p>
                                            {task.bankDetails && (
                                                <div className="text-xs text-gray-500 mt-1 bg-gray-900/50 p-2 rounded">
                                                    <strong className="text-gray-400">Datos bancarios del usuario:</strong><br />
                                                    Banco: {task.bankDetails.bankName}<br />
                                                    Tipo: {task.bankDetails.accountType}<br />
                                                    Cuenta: {task.bankDetails.accountNumber}<br />
                                                    Titular: {task.bankDetails.ownerName} ({task.bankDetails.ownerId})
                                                </div>
                                            )}

                                            {user?.role === 'SUPERADMIN' && (
                                                <div className="flex items-center gap-2 mt-2">
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <div className="relative">
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only"
                                                                checked={!!task.collaboratorVerified}
                                                                onChange={() => handleToggleVerification(task.id, !!task.collaboratorVerified)}
                                                            />
                                                            <div className={`block w-10 h-6 rounded-full transition-colors ${task.collaboratorVerified ? 'bg-green-600' : 'bg-gray-600'}`}></div>
                                                            <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${task.collaboratorVerified ? 'transform translate-x-4' : ''}`}></div>
                                                        </div>
                                                        <div className="ml-3 text-xs font-medium text-gray-300">
                                                            BTC Recibido de Colaborador
                                                        </div>
                                                    </label>
                                                    {task.collaboratorVerified && (
                                                        <span className="text-green-500 text-xs font-bold flex items-center">
                                                            <Check className="w-3 h-3 mr-1" /> Verificado
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="flex flex-wrap items-center gap-2">
                                    {/* Blockchain Verification for DEPOSIT_AUTO and WITHDRAWAL */}
                                    {((task.type === 'DEPOSIT_AUTO' && task.assignedAddress) || (task.type === 'WITHDRAWAL' && task.btcAddress)) && (
                                        <button
                                            onClick={() => handleVerifyBlockchain(task)}
                                            className="p-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-white flex justify-center items-center gap-2"
                                            title="Verificar en Blockchain"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                            <span className="text-xs">Verificar en Blockchain</span>
                                        </button>
                                    )}

                                    {task.proof && (
                                        <button
                                            onClick={() => {
                                                setSelectedProof(task.proof || null);
                                                setSelectedProofReference(task.reference || null);
                                                setShowProofModal(true);
                                            }}
                                            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white flex justify-center items-center"
                                            title="Ver comprobante del usuario"
                                        >
                                            <Eye className="w-5 h-5" />
                                        </button>
                                    )}

                                    {task.collaboratorProof && (
                                        <button
                                            onClick={() => {
                                                setSelectedProof(task.collaboratorProof || null);
                                                setSelectedProofReference(task.reference || null);
                                                setShowProofModal(true);
                                            }}
                                            className="p-2 bg-blue-700 hover:bg-blue-600 rounded-lg text-white flex justify-center items-center gap-1"
                                            title="Ver comprobante del colaborador"
                                        >
                                            <Shield className="w-4 h-4" />
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    )}

                                    {task.collaborator?.whatsappNumber && (
                                        <a
                                            href={`https://wa.me/${task.collaborator.whatsappNumber.replace(/\+/g, '')}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 bg-green-600 hover:bg-green-500 rounded-lg text-white flex justify-center items-center gap-1"
                                            title="Contactar al colaborador"
                                        >
                                            <MessageCircle className="w-4 h-4" />
                                        </a>
                                    )}



                                    {(activeTab === 'pending' || activeTab === 'preapproved') && (
                                        <>
                                            {actionStatus[task.id] === 'APPROVED' ? (
                                                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 text-green-500 font-bold rounded-lg animate-pulse">
                                                    <Check className="w-4 h-4" /> Aprobada
                                                </div>
                                            ) : actionStatus[task.id] === 'REJECTED' ? (
                                                <div className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 text-red-500 font-bold rounded-lg animate-pulse">
                                                    <X className="w-4 h-4" /> Rechazada
                                                </div>
                                            ) : activeTab === 'preapproved' && user?.role !== 'SUPERADMIN' ? (
                                                <div className="text-xs text-gray-500 italic px-3 py-2 bg-gray-700/50 rounded-lg text-center">
                                                    Solo SUPERADMIN puede tomar decisión final
                                                </div>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleApprove(task.id)}
                                                        disabled={processingId === task.id}
                                                        className={`px-3 py-2 text-white text-sm font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 ${user?.role === 'SUBADMIN' && !task.collaboratorId && !task.destinationUserId
                                                            ? 'bg-orange-600 hover:bg-orange-500' // Pre-approve style
                                                            : 'bg-green-600 hover:bg-green-500' // Approve style
                                                            }`}
                                                    >
                                                        <Check className="w-4 h-4" />
                                                        {user?.role === 'SUBADMIN' && !task.collaboratorId && !task.destinationUserId
                                                            ? 'Pre-Aprobar'
                                                            : task.status === 'PRE_APPROVED'
                                                                ? 'Aprobar Final'
                                                                : 'Aprobar'}
                                                    </button>
                                                    <button
                                                        onClick={() => openRejectModal(task.id)}
                                                        disabled={processingId === task.id}
                                                        className="px-3 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-bold rounded-lg flex items-center gap-2"
                                                    >
                                                        <X className="w-4 h-4" />
                                                        {user?.role === 'SUBADMIN' && !task.collaboratorId && !task.destinationUserId
                                                            ? 'Pre-Rechazar'
                                                            : 'Rechazar'}
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

                    {selectedProofReference && (
                        <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                            <p className="text-sm text-gray-400">Número de referencia:</p>
                            <p className="text-lg font-mono text-white select-all">{selectedProofReference}</p>
                        </div>
                    )}

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
                        </>
                    ) : (
                        <p className="text-gray-400 text-center py-4">No hay datos disponibles</p>
                    )}
                </div>
            </Modal>

            {/* Received Amount Modal */}
            <Modal isOpen={showReceivedAmountModal} onClose={() => setShowReceivedAmountModal(false)} title="Monto recibido">
                <div className="space-y-4">
                    {taskToApprove && (() => {
                        const task = tasks.find(t => t.id === taskToApprove);
                        return (
                            <>
                                <div className="bg-blue-900/20 border border-blue-700 p-3 rounded-lg">
                                    <p className="text-sm text-gray-300">
                                        El usuario solicitó un aporte de <span className="text-accent font-bold">${task?.amountUSD}</span>.
                                    </p>
                                    <p className="text-sm text-gray-300 mt-2">
                                        Por favor verifica la dirección BTC asignada e ingresa el monto realmente recibido:
                                    </p>
                                    {task?.assignedAddress && (
                                        <p className="text-xs text-gray-400 mt-2 font-mono break-all">
                                            {task.assignedAddress}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Monto recibido (USDT)
                                    </label>
                                    <input
                                        type="number"
                                        value={receivedAmount}
                                        onChange={(e) => setReceivedAmount(e.target.value)}
                                        placeholder="Ej: 45.50"
                                        step="0.01"
                                        min="0"
                                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-accent focus:outline-none"
                                        autoFocus
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        Este será el monto asignado al capital del usuario
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        onClick={() => {
                                            setShowReceivedAmountModal(false);
                                            setTaskToApprove(null);
                                            setReceivedAmount('');
                                        }}
                                        className="px-4 py-2 text-gray-400 hover:text-white transition"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleApproveWithReceivedAmount}
                                        disabled={!receivedAmount || parseFloat(receivedAmount) <= 0}
                                        className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold rounded-lg transition"
                                    >
                                        Aprobar con monto recibido
                                    </button>
                                </div>
                            </>
                        );
                    })()}
                </div>
            </Modal>

            {/* Collaborator Proof Modal */}
            {taskToApproveWithProof && (
                <CollaboratorProofModal
                    isOpen={showCollaboratorProofModal}
                    onClose={() => {
                        setShowCollaboratorProofModal(false);
                        setTaskToApproveWithProof(null);
                    }}
                    onSubmit={handleCollaboratorProofSubmit}
                    taskType={taskToApproveWithProof.type}
                    taskAmount={taskToApproveWithProof.amountUSD}
                />
            )}
        </div>
    );
};
