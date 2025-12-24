import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Wallet, Users } from 'lucide-react';
import { investmentService, Bank } from '../../services/investmentService';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableProfit: number;
    btcPrice: number;
    onSuccess: () => void;
}

export const WithdrawalModal: React.FC<WithdrawalModalProps> = ({
    isOpen,
    onClose,
    availableProfit,
    btcPrice,
    onSuccess,
}) => {
    const [activeTab, setActiveTab] = useState<'direct' | 'collaborator'>('direct');
    const [amount, setAmount] = useState('');
    const [btcAddress, setBtcAddress] = useState('');
    const [collaboratorId, setCollaboratorId] = useState('');

    // Bank Details State
    const [bankName, setBankName] = useState('');
    const [accountType, setAccountType] = useState('Corriente');
    const [accountNumber, setAccountNumber] = useState('');
    const [ownerName, setOwnerName] = useState('');
    const [ownerId, setOwnerId] = useState('');

    const [loading, setLoading] = useState(false);
    const [collaborators, setCollaborators] = useState<Array<{
        id: string;
        name: string;
        btcDepositAddress?: string;
        collaboratorConfig?: { commission: number; processingTime: string; minAmount: number; maxAmount: number };
    }>>([]);
    const [banks, setBanks] = useState<Bank[]>([]);

    // Fetch collaborators and banks on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [collabData, bankData] = await Promise.all([
                    investmentService.getCollaborators(),
                    investmentService.getBanks()
                ]);
                setCollaborators(collabData);
                setBanks(bankData);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    const selectedCollaborator = collaborators.find(c => c.id === collaboratorId);

    const platformFee = amount ? parseFloat(amount) * 0.045 : 0;
    const collaboratorCommissionRate = selectedCollaborator?.collaboratorConfig?.commission || 0;
    const collaboratorFee = (activeTab === 'collaborator' && amount) ? parseFloat(amount) * (collaboratorCommissionRate / 100) : 0;

    const totalFee = platformFee + collaboratorFee;
    const netAmount = amount ? parseFloat(amount) - totalFee : 0;

    const btcEquivalent = netAmount ? (netAmount / btcPrice).toFixed(8) : '0.00000000';

    // Reset form function
    const resetForm = () => {
        setAmount('');
        setBtcAddress('');
        setCollaboratorId('');
        setBankName('');
        setAccountType('Corriente');
        setAccountNumber('');
        setOwnerName('');
        setOwnerId('');
        setActiveTab('direct');
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const handleWithdrawal = async () => {
        if (!amount) {
            alert('Por favor ingresa el monto');
            return;
        }

        const amountNum = parseFloat(amount);
        if (amountNum > availableProfit) {
            alert('El monto excede tu profit disponible');
            return;
        }

        if (amountNum < 50) {
            alert('El monto mínimo de retiro es $50 USDT');
            return;
        }

        if (activeTab === 'direct' && !btcAddress) {
            alert('Por favor ingresa una dirección BTC válida');
            return;
        }

        if (activeTab === 'collaborator' && !collaboratorId) {
            alert('Por favor selecciona un colaborador');
            return;
        }

        setLoading(true);
        try {
            const destinationType = activeTab === 'direct' ? 'PERSONAL' : 'COLLABORATOR';
            const finalBtcAddress = activeTab === 'direct'
                ? btcAddress
                : selectedCollaborator?.btcDepositAddress || '';

            const bankDetails = activeTab === 'collaborator' ? {
                bankName,
                accountType,
                accountNumber,
                ownerName,
                ownerId
            } : undefined;

            if (activeTab === 'collaborator') {
                if (!bankName || !accountNumber || !ownerName || !ownerId) {
                    alert('Por favor completa todos los datos bancarios');
                    setLoading(false);
                    return;
                }
            }

            await investmentService.createWithdrawal({
                amountUSDT: amountNum,
                btcAddress: finalBtcAddress,
                destinationType,
                destinationUserId: activeTab === 'collaborator' ? collaboratorId : undefined,
                bankDetails
            });

            alert('Solicitud de retiro enviada. Pendiente de aprobación.');
            resetForm(); // Clear form after successful submission
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.response?.data?.error || 'Error al enviar solicitud de retiro');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Retiro de ganancias" maxWidth="xl">
            {/* Balance Info */}
            <div className="bg-profit/10 border border-profit p-3 rounded-lg mb-4 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Profit Disponible para retiro</p>
                <p className="text-2xl font-black text-profit">${availableProfit.toFixed(2)} USDT</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <button
                    onClick={() => setActiveTab('direct')}
                    className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'direct'
                        ? 'bg-accent text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    <Wallet className="w-4 h-4" />
                    Mi Wallet personal
                </button>
                <button
                    onClick={() => setActiveTab('collaborator')}
                    className={`flex-1 py-2 px-3 rounded-lg font-semibold text-sm transition flex items-center justify-center gap-2 ${activeTab === 'collaborator'
                        ? 'bg-profit text-black'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Intercambio con colaborador
                </button>
            </div>

            {/* Direct Withdrawal Tab */}
            {activeTab === 'direct' && (
                <div className="space-y-3">
                    <div className="bg-blue-900/20 border border-blue-700 p-3 rounded-lg">
                        <p className="text-xs text-blue-400 text-center">
                            Retira tus ganancias directamente a tu wallet personal de BTC
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                            Monto a retirar (USDT)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ej: 500"
                            max={availableProfit}
                            className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-accent transition-colors"
                        />
                        <p className="text-[10px] text-gray-400 mt-1 flex justify-between flex-wrap gap-2">
                            <span>Comisión operativa (4.5%): <span className="text-red-400">-${platformFee.toFixed(2)}</span></span>
                            <span>Neto a recibir: <span className="text-accent font-bold">${netAmount.toFixed(2)} ({btcEquivalent} BTC)</span></span>
                        </p>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                            Dirección BTC de destino
                        </label>
                        <input
                            type="text"
                            value={btcAddress}
                            onChange={(e) => setBtcAddress(e.target.value)}
                            placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                            className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-xs focus:border-accent transition-colors"
                        />
                        <p className="text-[10px] text-gray-500 mt-1 italic">
                            Verifica bien la dirección. Las transacciones son irreversibles.
                        </p>
                    </div>

                    <button
                        onClick={handleWithdrawal}
                        disabled={loading}
                        className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 shadow-lg shadow-accent/20 hover:shadow-accent/40 text-sm mt-1"
                    >
                        {loading ? 'Enviando...' : 'Solicitar retiro'}
                    </button>
                </div>
            )}

            {/* Collaborator Withdrawal Tab */}
            {activeTab === 'collaborator' && (
                <div className="space-y-3">
                    {collaborators.length === 0 ? (
                        <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
                            <p className="text-gray-400 text-sm">
                                Lo sentimos, en este momento no hay colaboradores disponibles para gestionar retiros.
                                <br />
                                Por favor utiliza el retiro directo a tu wallet personal.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-green-900/20 border border-green-700 p-3 rounded-lg">
                                <h4 className="font-bold text-green-400 mb-1 text-xs">Intercambio BTC → FIAT:</h4>
                                <ol className="text-[10px] text-gray-300 space-y-1 list-decimal list-inside">
                                    <li>El sistema enviará BTC al colaborador</li>
                                    <li>El colaborador te entregará FIAT (USD, etc.)</li>
                                </ol>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Monto a retirar (USDT)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Ej: 500"
                                    max={availableProfit}
                                    className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-accent transition-colors"
                                />
                                <p className="text-[10px] text-gray-400 mt-1">
                                    Equivalente: {btcEquivalent} BTC
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Colaborador
                                </label>
                                <select
                                    value={collaboratorId}
                                    onChange={(e) => setCollaboratorId(e.target.value)}
                                    className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-accent transition-colors"
                                >
                                    <option value="">Selecciona un colaborador</option>
                                    {collaborators.map((collab) => (
                                        <option key={collab.id} value={collab.id}>
                                            {collab.name}
                                        </option>
                                    ))}
                                </select>
                                {collaboratorId && (
                                    <>
                                        <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-700 flex flex-col gap-1">
                                            <p className="text-[10px] text-gray-400">Wallet del colaborador:</p>
                                            <code className="text-[10px] text-accent break-all font-mono">
                                                {collaborators.find(c => c.id === collaboratorId)?.btcDepositAddress}
                                            </code>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedCollaborator?.collaboratorConfig?.minAmount !== undefined && (
                                                <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                                                    Min: ${selectedCollaborator.collaboratorConfig.minAmount}
                                                </span>
                                            )}
                                            {selectedCollaborator?.collaboratorConfig?.maxAmount !== undefined && (
                                                <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                                                    Max: ${selectedCollaborator.collaboratorConfig.maxAmount}
                                                </span>
                                            )}
                                            <span className="text-[10px] bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded border border-yellow-700/50">
                                                Comisión: {selectedCollaborator?.collaboratorConfig?.commission || 0}%
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Bank Details Form */}
                            {collaboratorId && (
                                <div className="space-y-3 pt-2 border-t border-gray-700">
                                    <h5 className="font-semibold text-white text-xs">Datos bancarios para recibir FIAT:</h5>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Banco receptor</label>
                                            <select
                                                value={bankName}
                                                onChange={e => setBankName(e.target.value)}
                                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                                            >
                                                <option value="">Selecciona un banco</option>
                                                {banks.map(bank => (
                                                    <option key={bank.id} value={bank.name}>{bank.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Tipo de cuenta</label>
                                            <select
                                                value={accountType}
                                                onChange={e => setAccountType(e.target.value)}
                                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                                            >
                                                <option value="Corriente">Corriente</option>
                                                <option value="Ahorros">Ahorros</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-gray-300 mb-1">Número de cuenta</label>
                                        <input
                                            type="text"
                                            value={accountNumber}
                                            onChange={e => setAccountNumber(e.target.value)}
                                            placeholder="xxxxxxxxxx"
                                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Nombre del titular</label>
                                            <input
                                                type="text"
                                                value={ownerName}
                                                onChange={e => setOwnerName(e.target.value)}
                                                placeholder="Nombre completo"
                                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-300 mb-1">Cédula / ID</label>
                                            <input
                                                type="text"
                                                value={ownerId}
                                                onChange={e => setOwnerId(e.target.value)}
                                                placeholder="Documento de identidad"
                                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs"
                                            />
                                        </div>
                                    </div>

                                    {/* Breakdown */}
                                    <div className="bg-gray-800 p-2 rounded text-[10px] space-y-1 mt-2">
                                        <div className="flex justify-between text-gray-400">
                                            <span>Monto a retirar:</span>
                                            <span>${amount || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-red-400">
                                            <span>Comisión Plataforma (4.5%):</span>
                                            <span>-${platformFee.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-yellow-500">
                                            <span>Comisión Colaborador ({collaboratorCommissionRate}%):</span>
                                            <span>-${collaboratorFee.toFixed(2)}</span>
                                        </div>
                                        <div className="border-t border-gray-700 pt-1 flex justify-between font-bold text-accent">
                                            <span>Neto a recibir (FIAT):</span>
                                            <span>≈ ${netAmount.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleWithdrawal}
                                disabled={loading}
                                className="w-full bg-profit hover:bg-emerald-500 text-black font-bold py-2.5 rounded-lg transition disabled:opacity-50 shadow-lg shadow-profit/20 hover:shadow-profit/40 text-sm mt-1"
                            >
                                {loading ? 'Enviando...' : 'Solicitar retiro con colaborador'}
                            </button>
                        </>
                    )}
                </div>
            )}

            {/* Warnings */}
            <div className="mt-4 bg-yellow-900/20 border border-yellow-700 p-2.5 rounded-lg flex gap-2 items-center">
                <span className="text-yellow-400 text-xs">⚠️</span>
                <p className="text-[10px] text-yellow-400 leading-tight">
                    <strong>NOTA IMPORTANTE:</strong> Todos los retiros están sujetos a un costo operativo fijo del 4.5%, independientemente de si la orden es aceptada o rechazada. Este fee corresponde a los costos de procesamiento de red, verificación interna y gestión operativa.
                </p>
            </div>
        </Modal>
    );
};
