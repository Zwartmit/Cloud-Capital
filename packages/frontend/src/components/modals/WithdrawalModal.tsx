import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Wallet, Users } from 'lucide-react';
import { investmentService } from '../../services/investmentService';

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
    const [loading, setLoading] = useState(false);
    const [collaborators, setCollaborators] = useState<Array<{ id: string; name: string; btcDepositAddress?: string }>>([]);

    // Fetch collaborators on mount
    useEffect(() => {
        const fetchCollaborators = async () => {
            try {
                const data = await investmentService.getCollaborators();
                setCollaborators(data);
            } catch (error) {
                console.error('Error fetching collaborators:', error);
            }
        };
        fetchCollaborators();
    }, []);

    const btcEquivalent = amount ? (parseFloat(amount) / btcPrice).toFixed(8) : '0.00000000';

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
                : collaborators.find(c => c.id === collaboratorId)?.btcDepositAddress || '';

            await investmentService.createWithdrawal({
                amountUSDT: amountNum,
                btcAddress: finalBtcAddress,
                destinationType,
                destinationUserId: activeTab === 'collaborator' ? collaboratorId : undefined,
            });

            alert('Solicitud de retiro enviada. Pendiente de aprobación.');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.response?.data?.error || 'Error al enviar solicitud');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Retirar ganancias" maxWidth="xl">
            {/* Balance Info */}
            <div className="bg-profit/10 border border-profit p-3 rounded-lg mb-4 text-center">
                <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Profit Disponible para Retiro</p>
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
                        <p className="text-[10px] text-gray-400 mt-1">
                            Equivalente estimado: <span className="text-accent">{btcEquivalent} BTC</span>
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
                            <div className="mt-2 p-2 bg-gray-800 rounded border border-gray-700 flex flex-col gap-1">
                                <p className="text-[10px] text-gray-400">Wallet del colaborador:</p>
                                <code className="text-[10px] text-accent break-all font-mono">
                                    {collaborators.find(c => c.id === collaboratorId)?.btcDepositAddress}
                                </code>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleWithdrawal}
                        disabled={loading}
                        className="w-full bg-profit hover:bg-emerald-500 text-black font-bold py-2.5 rounded-lg transition disabled:opacity-50 shadow-lg shadow-profit/20 hover:shadow-profit/40 text-sm mt-1"
                    >
                        {loading ? 'Enviando...' : 'Solicitar retiro con colaborador'}
                    </button>
                </div>
            )}

            {/* Warnings */}
            <div className="mt-4 bg-yellow-900/20 border border-yellow-700 p-2.5 rounded-lg flex gap-2 items-center">
                <span className="text-yellow-400 text-xs">⚠️</span>
                <p className="text-[10px] text-yellow-400 leading-tight">
                    Monto mínimo: $50 USDT. Las solicitudes requieren aprobación.
                </p>
            </div>
        </Modal>
    );
};
