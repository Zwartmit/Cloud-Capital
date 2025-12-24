import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import * as btcPoolService from '../services/btcPool.service';
import { adminService } from '../services/adminService';
import '../styles/DepositValidationPage.css';

interface Task {
    id: string;
    userId: string;
    type: string;
    status: string;
    amountUSD: number;
    assignedAddress?: string;
    txid?: string;
    proof?: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
        username: string;
    };
}

interface BlockchainData {
    verified: boolean;
    balance: number;
    totalReceived: number;
    confirmations: number;
    message: string;
    explorerLink?: string;
}

export default function DepositValidationPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [blockchainData, setBlockchainData] = useState<BlockchainData | null>(null);
    const [verifying, setVerifying] = useState(false);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadPendingDeposits();
    }, []);

    const loadPendingDeposits = async () => {
        try {
            setLoading(true);
            const response = await adminService.getAllTasks('PENDING');

            // Filter only deposit tasks
            const depositTasks = response.filter(
                (task: Task) => task.type === 'DEPOSIT_AUTO' || task.type === 'DEPOSIT_MANUAL'
            );

            setTasks(depositTasks);
        } catch (error: any) {
            console.error('Error loading deposits:', error);
            alert('Error al cargar depósitos pendientes');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyDeposit = async (task: Task) => {
        if (!task.assignedAddress) {
            alert('Esta tarea no tiene dirección asignada');
            return;
        }

        setSelectedTask(task);
        setVerifying(true);
        setBlockchainData(null);

        try {
            const result = await btcPoolService.verifyDeposit({
                address: task.assignedAddress,
                expectedAmountBTC: undefined, // We'll check manually
                minConfirmations: 1,
            });

            const explorerLink = `https://mempool.space/${process.env.VITE_BTC_NETWORK === 'mainnet' ? '' : 'testnet/'
                }address/${task.assignedAddress}`;

            setBlockchainData({
                ...result,
                explorerLink,
            });
        } catch (error: any) {
            console.error('Error verifying deposit:', error);
            alert('Error al verificar depósito en blockchain');
        } finally {
            setVerifying(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedTask) return;

        if (!confirm(`¿Aprobar depósito de ${selectedTask.user.name} por $${selectedTask.amountUSD}?`)) {
            return;
        }

        setProcessing(true);
        try {
            await adminService.approveTask(selectedTask.id);
            alert('Depósito aprobado exitosamente');
            setSelectedTask(null);
            setBlockchainData(null);
            loadPendingDeposits();
        } catch (error: any) {
            console.error('Error approving deposit:', error);
            alert(`Error: ${error.response?.data?.error || error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!selectedTask) return;

        const reason = prompt('Motivo del rechazo:');
        if (!reason) return;

        setProcessing(true);
        try {
            await adminService.rejectTask(selectedTask.id, reason);
            alert('Depósito rechazado');
            setSelectedTask(null);
            setBlockchainData(null);
            loadPendingDeposits();
        } catch (error: any) {
            console.error('Error rejecting deposit:', error);
            alert(`Error: ${error.response?.data?.error || error.message}`);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 border-b border-gray-700 pb-4">
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-admin mb-2">
                            Validación de Depósitos
                        </h2>
                    </div>

                    {loading ? (
                        <div className="loading">Cargando depósitos...</div>
                    ) : (
                        <div className="content-grid">
                            {/* Task List */}
                            <div className="task-list">
                                <h2>Depósitos Pendientes ({tasks.length})</h2>
                                {tasks.length === 0 ? (
                                    <p className="no-tasks">No hay depósitos pendientes</p>
                                ) : (
                                    tasks.map((task) => (
                                        <div
                                            key={task.id}
                                            className={`task-card ${selectedTask?.id === task.id ? 'selected' : ''}`}
                                            onClick={() => setSelectedTask(task)}
                                        >
                                            <div className="task-header">
                                                <h3>{task.user.name}</h3>
                                                <span className="amount">${task.amountUSD}</span>
                                            </div>
                                            <p className="email">{task.user.email}</p>
                                            <p className="date">
                                                {new Date(task.createdAt).toLocaleString()}
                                            </p>
                                            {task.assignedAddress && (
                                                <code className="address">{task.assignedAddress.substring(0, 20)}...</code>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Validation Panel */}
                            <div className="validation-panel">
                                {!selectedTask ? (
                                    <div className="empty-state">
                                        <p>Selecciona un depósito para verificar</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="task-details">
                                            <h2>Detalles del depósito</h2>
                                            <div className="detail-row">
                                                <span>Usuario:</span>
                                                <strong>{selectedTask.user.name}</strong>
                                            </div>
                                            <div className="detail-row">
                                                <span>Email:</span>
                                                <span>{selectedTask.user.email}</span>
                                            </div>
                                            <div className="detail-row">
                                                <span>Monto:</span>
                                                <strong className="amount-large">${selectedTask.amountUSD} USDT</strong>
                                            </div>
                                            <div className="detail-row">
                                                <span>Tipo:</span>
                                                <span>{selectedTask.type === 'DEPOSIT_AUTO' ? 'Automático' : 'Manual'}</span>
                                            </div>
                                            {selectedTask.assignedAddress && (
                                                <div className="detail-row">
                                                    <span>Dirección BTC:</span>
                                                    <code className="address-full">{selectedTask.assignedAddress}</code>
                                                </div>
                                            )}
                                            {selectedTask.txid && (
                                                <div className="detail-row">
                                                    <span>TXID:</span>
                                                    <code className="address-full">{selectedTask.txid}</code>
                                                </div>
                                            )}
                                        </div>

                                        {/* Verification Section */}
                                        <div className="verification-section">
                                            <button
                                                className="btn-verify"
                                                onClick={() => handleVerifyDeposit(selectedTask)}
                                                disabled={verifying || !selectedTask.assignedAddress}
                                            >
                                                {verifying ? '🔄 Verificando...' : '🔍 Verificar en Blockchain'}
                                            </button>

                                            {blockchainData && (
                                                <div className={`blockchain-result ${blockchainData.verified ? 'verified' : 'pending'}`}>
                                                    <h3>{blockchainData.verified ? '✅ Verificado' : '⚠️ Pendiente'}</h3>
                                                    <div className="result-details">
                                                        <div className="result-row">
                                                            <span>Balance:</span>
                                                            <strong>{blockchainData.balance} BTC</strong>
                                                        </div>
                                                        <div className="result-row">
                                                            <span>Total recibido:</span>
                                                            <strong>{blockchainData.totalReceived} BTC</strong>
                                                        </div>
                                                        <div className="result-row">
                                                            <span>Confirmaciones:</span>
                                                            <strong>{blockchainData.confirmations}</strong>
                                                        </div>
                                                        <p className="message">{blockchainData.message}</p>
                                                        {blockchainData.explorerLink && (
                                                            <a
                                                                href={blockchainData.explorerLink}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="explorer-link"
                                                            >
                                                                🔗 Ver en explorador de bloques
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="actions">
                                            <button
                                                className="btn-approve"
                                                onClick={handleApprove}
                                                disabled={processing}
                                            >
                                                {processing ? 'Procesando...' : '✅ Aprobar depósito'}
                                            </button>
                                            <button
                                                className="btn-reject"
                                                onClick={handleReject}
                                                disabled={processing}
                                            >
                                                {processing ? 'Procesando...' : '❌ Rechazar'}
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
