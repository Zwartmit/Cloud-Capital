import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Wallet, Users, AlertCircle, CheckCircle2, Building2 } from 'lucide-react';
import { investmentService, Bank } from '../../services/investmentService';
import collaboratorBankService, { CollaboratorBankAccount } from '../../services/collaboratorBankService';

interface WithdrawalModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableProfit: number;
    btcPrice: number;
    onSuccess: () => void;
}


const MIN_WITHDRAWAL_AMOUNT = 50;

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

    // New state for collaborator banks logic
    const [collaboratorBanks, setCollaboratorBanks] = useState<CollaboratorBankAccount[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [selectedCollaboratorBank, setSelectedCollaboratorBank] = useState<CollaboratorBankAccount | null>(null);
    const [bankSelectionError, setBankSelectionError] = useState('');

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

    // Fetch collaborator banks when collaborator changes
    useEffect(() => {
        const fetchCollaboratorBanks = async () => {
            if (!collaboratorId) {
                setCollaboratorBanks([]);
                setSelectedCollaboratorBank(null);
                return;
            }

            setLoadingBanks(true);
            setBankSelectionError('');
            setSelectedCollaboratorBank(null);

            // Reset form fields
            setBankName('');
            setAccountType('Corriente');
            setAccountNumber('');
            setOwnerName('');
            setOwnerId('');

            try {
                const accounts = await collaboratorBankService.getBankAccounts({ collaboratorId });
                // Filter only active accounts
                const activeAccounts = accounts.filter(acc => acc.isActive);
                setCollaboratorBanks(activeAccounts);
            } catch (error) {
                console.error('Error fetching collaborator banks:', error);
                setCollaboratorBanks([]);
            } finally {
                setLoadingBanks(false);
            }
        };

        fetchCollaboratorBanks();
    }, [collaboratorId]);

    const handleBankSelection = (bank: CollaboratorBankAccount) => {
        setSelectedCollaboratorBank(bank);
        setBankName(bank.bankName);
        // We don't autofill other fields because user must enter THEIR OWN data
        // But we lock the bank name to ensure match
    };

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
        setCollaboratorId('');
        setBankName('');
        setAccountType('Corriente');
        setAccountNumber('');
        setOwnerName('');
        setOwnerId('');
        setActiveTab('direct');
        setCollaboratorBanks([]);
        setSelectedCollaboratorBank(null);
        setBankSelectionError('');
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

        if (amountNum < MIN_WITHDRAWAL_AMOUNT) {
            alert(`El monto mínimo de retiro es $${MIN_WITHDRAWAL_AMOUNT} USDT`);
            return;
        }

        if (activeTab === 'collaborator') {
            if (!collaboratorId) {
                alert('Selecciona un colaborador');
                return;
            }
            if (!selectedCollaboratorBank) {
                alert('Debes seleccionar un banco receptor de la lista');
                return;
            }
            if (!bankName || !accountNumber || !ownerName || !ownerId) {
                alert('Por favor completa todos los datos bancarios');
                return;
            }
        } else {
            if (!btcAddress) {
                alert('Por favor ingresa una dirección BTC válida');
                return;
            }
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
            // Only log if it's NOT a 400 error (validation error)
            if (error.response?.status !== 400) {
                console.error('Error:', error);
            }
            alert(error.response?.data?.error || 'Error al enviar solicitud de retiro');
        } finally {
            setLoading(false);
        }
    };

    // Calculate next Friday for withdrawal processing
    const getNextFriday = () => {
        const today = new Date();
        const dayOfWeek = today.getDay();
        const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7; // 5 = Friday
        const nextFriday = new Date(today);
        nextFriday.setDate(today.getDate() + daysUntilFriday);
        return nextFriday.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Retiro de ganancias" maxWidth="xl">
            {/* Friday Processing Notice */}
            <div className="bg-blue-900/20 border border-blue-600 p-3 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                    <span className="text-blue-400 text-lg">📅</span>
                    <div className="flex-1">
                        <p className="text-xs text-gray-300 leading-relaxed">
                            Puedes solicitar tu retiro cualquier día de la semana, pero <strong className="text-blue-400">todos los retiros se procesan únicamente los viernes</strong>.
                        </p>
                        <p className="text-xs text-blue-300 mt-2">
                            📌 Próximo procesamiento: <strong>{getNextFriday()}</strong>
                        </p>
                    </div>
                </div>
            </div>

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
                    Retiro con colaborador
                </button>
            </div>

            {/* Direct Withdrawal Tab */}
            {activeTab === 'direct' && (
                <div className="space-y-3">
                    {/* Direct Withdrawal Instructions */}
                    <div className="bg-blue-900/20 border border-blue-700 p-3 rounded-lg">
                        <h4 className="font-bold text-blue-400 mb-2 text-sm">Instrucciones:</h4>
                        <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside">
                            <li>Ingresa el monto en USDT que deseas retirar.</li>
                            <li>Verifica la comisión operativa del 4.5% y el monto neto a recibir.</li>
                            <li>Ingresa tu dirección de billetera Bitcoin (BTC) personal.</li>
                            <li>Asegúrate de que la dirección sea correcta e irreversible.</li>
                            <li>Haz clic en "Solicitar retiro" y espera la aprobación (viernes).</li>
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
                        <p className="text-[10px] text-gray-400 mt-1 flex justify-between flex-wrap gap-2">
                            <span>Costo operativo (4.5%): <span className="text-red-400">-${platformFee.toFixed(2)}</span></span>
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
                                <h4 className="font-bold text-green-400 mb-2 text-sm">Instrucciones:</h4>
                                <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside">
                                    <li>Ingresa el monto en USDT que deseas recibir en tu banco.</li>
                                    <li>Selecciona un colaborador que tenga cuenta en TU mismo banco.</li>
                                    <li>De la lista de bancos disponibles, elige tu banco.</li>
                                    <li>Completa los datos de tu cuenta para recibir la transferencia.</li>
                                    <li>El colaborador procesará tu retiro enviándote dinero local (FIAT).</li>
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
                                        {/* <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-700 flex flex-col gap-1">
                                            <p className="text-[10px] text-gray-400">Wallet del colaborador:</p>
                                            <code className="text-[10px] text-accent break-all font-mono">
                                                {collaborators.find(c => c.id === collaboratorId)?.btcDepositAddress}
                                            </code>
                                        </div> */}
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {selectedCollaborator?.collaboratorConfig?.minAmount !== undefined && (
                                                <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                                                    Retiro min: ${selectedCollaborator.collaboratorConfig.minAmount}
                                                </span>
                                            )}
                                            {selectedCollaborator?.collaboratorConfig?.maxAmount !== undefined && (
                                                <span className="text-[10px] bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                                                    Retiro max: ${selectedCollaborator.collaboratorConfig.maxAmount}
                                                </span>
                                            )}
                                            <span className="text-[10px] bg-yellow-900/40 text-yellow-400 px-2 py-0.5 rounded border border-yellow-700/50">
                                                Comisión: {selectedCollaborator?.collaboratorConfig?.commission || 0}%
                                            </span>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Bank Details Form Logic */}
                            {collaboratorId && (
                                <div className="space-y-4 pt-4 border-t border-gray-700">
                                    <h5 className="font-semibold text-white text-sm flex items-center">
                                        <Building2 className="w-4 h-4 mr-2 text-blue-400" />
                                        Selección de Banco
                                    </h5>

                                    {loadingBanks ? (
                                        <div className="text-center py-4 text-gray-400 text-sm">Cargando bancos disponibles...</div>
                                    ) : collaboratorBanks.length === 0 ? (
                                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 flex items-start">
                                            <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                                            <div className="text-xs text-red-200">
                                                <p className="font-bold mb-1">Sin bancos disponibles</p>
                                                Este colaborador no tiene cuentas bancarias activas. Por favor selecciona otro colaborador.
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {!selectedCollaboratorBank ? (
                                                <>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                        {collaboratorBanks.map((bank) => (
                                                            <button
                                                                key={bank.id}
                                                                onClick={() => handleBankSelection(bank)}
                                                                className="p-3 bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-blue-500 rounded-lg transition text-left group relative ring-offset-2 ring-offset-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                            >
                                                                <p className="font-bold text-white text-xs mb-1">{bank.bankName}</p>
                                                                <p className="text-[10px] text-gray-400 truncate">{bank.accountType}</p>
                                                            </button>
                                                        ))}
                                                    </div>

                                                    <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                                                        <p className="text-xs text-yellow-200">
                                                            <span className="font-bold">⚠️ Importante:</span> Selecciona el banco donde tienes tu cuenta. Si tu banco no aparece en la lista, por favor selecciona otro colaborador o contacta al administrador.
                                                        </p>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                                    <div className="flex items-center justify-between bg-blue-500/10 border border-blue-500/30 p-3 rounded-lg">
                                                        <div className="flex items-center">
                                                            <CheckCircle2 className="w-5 h-5 text-blue-400 mr-2" />
                                                            <div>
                                                                <p className="text-xs text-blue-200">Banco seleccionado:</p>
                                                                <p className="text-sm font-bold text-white">{selectedCollaboratorBank.bankName}</p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setSelectedCollaboratorBank(null)}
                                                            className="text-xs text-gray-400 hover:text-white underline"
                                                        >
                                                            Cambiar
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-300 mb-1">Banco receptor</label>
                                                            <input
                                                                type="text"
                                                                value={bankName}
                                                                disabled
                                                                className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-gray-300 text-xs cursor-not-allowed"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-300 mb-1">Tipo de cuenta</label>
                                                            <select
                                                                value={accountType}
                                                                onChange={e => setAccountType(e.target.value)}
                                                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:border-accent outline-none"
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
                                                            placeholder="Ingrese su número de cuenta"
                                                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:border-accent outline-none"
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
                                                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:border-accent outline-none"
                                                            />
                                                        </div>
                                                        <div>
                                                            <label className="block text-xs font-medium text-gray-300 mb-1">Cédula / Documento</label>
                                                            <input
                                                                type="text"
                                                                value={ownerId}
                                                                onChange={e => setOwnerId(e.target.value)}
                                                                placeholder="Número de documento"
                                                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-xs focus:border-accent outline-none"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Breakdown */}
                                    <div className="bg-gray-800 p-2 rounded text-[10px] space-y-1 mt-2">
                                        <div className="flex justify-between text-gray-400">
                                            <span>Monto a retirar:</span>
                                            <span>${amount || 0}</span>
                                        </div>
                                        <div className="flex justify-between text-red-400">
                                            <span>Costo operativo (4.5%):</span>
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
        </Modal >
    );
};
