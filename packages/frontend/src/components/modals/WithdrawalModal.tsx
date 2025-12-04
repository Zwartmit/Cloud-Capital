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
        <Modal isOpen={isOpen} onClose={onClose} title="Retirar Ganancias" maxWidth="xl">
            {/* Balance Info */}
            <div className="bg-profit/10 border border-profit p-4 rounded-lg mb-6">
                <p className="text-sm text-gray-400">Profit Disponible para Retiro:</p>
                <p className="text-3xl font-black text-profit">${availableProfit.toFixed(2)} USDT</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('direct')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'direct'
                            ? 'bg-accent text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    <Wallet className="w-4 h-4" />
                    Mi Wallet Personal
                </button>
                <button
                    onClick={() => setActiveTab('collaborator')}
                    className={`flex-1 py-2 px-4 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${activeTab === 'collaborator'
                            ? 'bg-profit text-black'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                >
                    <Users className="w-4 h-4" />
                    Intercambio con Colaborador
                </button>
            </div>

            {/* Direct Withdrawal Tab */}
            {activeTab === 'direct' && (
                <div className="space-y-4">
                    <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
                        <p className="text-sm text-blue-400">
                            Retira tus ganancias directamente a tu wallet personal de BTC
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Monto a Retirar (USDT)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ej: 500"
                            max={availableProfit}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Equivalente: {btcEquivalent} BTC
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Dirección BTC de Destino
                        </label>
                        <input
                            type="text"
                            value={btcAddress}
                            onChange={(e) => setBtcAddress(e.target.value)}
                            placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Asegúrate de que la dirección sea correcta. Las transacciones BTC son irreversibles.
                        </p>
                    </div>

                    <button
                        onClick={handleWithdrawal}
                        disabled={loading}
                        className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Enviando...' : 'Solicitar Retiro'}
                    </button>
                </div>
            )}

            {/* Collaborator Withdrawal Tab */}
            {activeTab === 'collaborator' && (
                <div className="space-y-4">
                    <div className="bg-green-900/20 border border-green-700 p-4 rounded-lg">
                        <h4 className="font-bold text-green-400 mb-2">Intercambio BTC → FIAT:</h4>
                        <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                            <li>Selecciona un colaborador</li>
                            <li>Ingresa el monto a retirar</li>
                            <li>El sistema enviará BTC a la wallet del colaborador</li>
                            <li>El colaborador te entregará el equivalente en FIAT (USD, etc.)</li>
                        </ol>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Monto a Retirar (USDT)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ej: 500"
                            max={availableProfit}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            Equivalente: {btcEquivalent} BTC
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Colaborador que Realizará el Cambio
                        </label>
                        <select
                            value={collaboratorId}
                            onChange={(e) => setCollaboratorId(e.target.value)}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        >
                            <option value="">Selecciona un colaborador</option>
                            {collaborators.map((collab) => (
                                <option key={collab.id} value={collab.id}>
                                    {collab.name}
                                </option>
                            ))}
                        </select>
                        {collaboratorId && (
                            <div className="mt-2 p-3 bg-gray-800 rounded border border-gray-700">
                                <p className="text-xs text-gray-400">Wallet del colaborador:</p>
                                <code className="text-xs text-accent break-all">
                                    {collaborators.find(c => c.id === collaboratorId)?.btcDepositAddress}
                                </code>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={handleWithdrawal}
                        disabled={loading}
                        className="w-full bg-profit hover:bg-emerald-500 text-black font-bold py-3 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'Enviando...' : 'Solicitar Retiro con Colaborador'}
                    </button>
                </div>
            )}

            {/* Warnings */}
            <div className="mt-4 bg-yellow-900/20 border border-yellow-700 p-3 rounded-lg">
                <p className="text-xs text-yellow-400">
                    ⚠️ Monto mínimo de retiro: $50 USDT. Las solicitudes serán revisadas y aprobadas por un administrador.
                </p>
            </div>
        </Modal>
    );
};
