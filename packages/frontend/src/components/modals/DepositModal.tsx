import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Copy, QrCode, Upload, MessageCircle } from 'lucide-react';
import { investmentService } from '../../services/investmentService';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    userDepositAddress?: string;
    onSuccess: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({
    isOpen,
    onClose,
    userDepositAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Placeholder
    onSuccess,
}) => {
    const [activeTab, setActiveTab] = useState<'direct' | 'collaborator'>('direct');
    const [amount, setAmount] = useState('');
    const [txid, setTxid] = useState('');
    const [proof, setProof] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [showManualOrder, setShowManualOrder] = useState(false);
    const [collaborators, setCollaborators] = useState<Array<{ id: string; name: string; whatsappNumber?: string; role: string }>>([]);

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

    const handleCopyAddress = () => {
        navigator.clipboard.writeText(userDepositAddress);
        alert('Dirección copiada al portapapeles');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setProof(e.target.files[0]);
        }
    };

    const handleDirectDeposit = async () => {
        if (!amount) {
            alert('Por favor ingresa el monto');
            return;
        }

        setLoading(true);
        try {
            await investmentService.createAutoDeposit({
                amountUSDT: parseFloat(amount),
                txid,
                proof: proof?.name, // TODO: Upload file to server
            });
            alert('Solicitud de depósito enviada. Pendiente de aprobación.');
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.response?.data?.error || 'Error al enviar solicitud');
        } finally {
            setLoading(false);
        }
    };

    // Collaborators list is now fetched from API

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Depositar Fondos" maxWidth="xl">
            {!showManualOrder ? (
                <>
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button
                            onClick={() => setActiveTab('direct')}
                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${activeTab === 'direct'
                                ? 'bg-accent text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Depósito Directo (BTC)
                        </button>
                        <button
                            onClick={() => setActiveTab('collaborator')}
                            className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${activeTab === 'collaborator'
                                ? 'bg-profit text-black'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Con Colaborador (FIAT)
                        </button>
                    </div>

                    {/* Direct Deposit Tab */}
                    {activeTab === 'direct' && (
                        <div className="space-y-4">
                            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                                <p className="text-sm text-gray-400 mb-2">Tu dirección de depósito BTC:</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-900 p-3 rounded text-accent text-sm break-all">
                                        {userDepositAddress}
                                    </code>
                                    <button
                                        onClick={handleCopyAddress}
                                        className="p-3 bg-accent hover:bg-blue-500 rounded transition"
                                        title="Copiar dirección"
                                    >
                                        <Copy className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="mt-3 flex justify-center">
                                    <div className="bg-white p-3 rounded">
                                        <QrCode className="w-32 h-32 text-gray-800" />
                                        <p className="text-xs text-gray-600 text-center mt-1">QR Code</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Monto depositado (USDT)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Ej: 1000"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    TXID (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={txid}
                                    onChange={(e) => setTxid(e.target.value)}
                                    placeholder="ID de transacción blockchain"
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    Comprobante de transacción
                                </label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="file"
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        className="hidden"
                                        id="proof-upload"
                                    />
                                    <label
                                        htmlFor="proof-upload"
                                        className="flex-1 p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 cursor-pointer hover:border-accent transition flex items-center gap-2"
                                    >
                                        <Upload className="w-5 h-5" />
                                        {proof ? proof.name : 'Seleccionar archivo'}
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleDirectDeposit}
                                disabled={loading}
                                className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50"
                            >
                                {loading ? 'Enviando...' : 'Enviar Solicitud de Depósito'}
                            </button>
                        </div>
                    )}

                    {/* Collaborator Tab */}
                    {activeTab === 'collaborator' && (
                        <div className="space-y-4">
                            <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg">
                                <h4 className="font-bold text-blue-400 mb-2">Instrucciones:</h4>
                                <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                                    <li>Contacta a un colaborador vía WhatsApp</li>
                                    <li>Entrega tu dinero FIAT (USD, etc.)</li>
                                    <li>El colaborador depositará BTC a tu wallet</li>
                                    <li>Regresa aquí y crea una orden manual</li>
                                </ol>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-3">Colaboradores Disponibles:</h4>
                                <div className="space-y-2">
                                    {collaborators.map((collab) => (
                                        <div
                                            key={collab.id}
                                            className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-gray-700"
                                        >
                                            <div>
                                                <p className="font-semibold text-white">{collab.name}</p>
                                                <p className="text-xs text-gray-400">{collab.role}</p>
                                            </div>
                                            <a
                                                href={`https://wa.me/${collab.whatsappNumber?.replace(/[^0-9]/g, '')}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg transition"
                                            >
                                                <MessageCircle className="w-4 h-4" />
                                                WhatsApp
                                            </a>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowManualOrder(true)}
                                className="w-full bg-profit hover:bg-emerald-500 text-black font-bold py-3 rounded-lg transition"
                            >
                                Ya Realicé el Depósito - Crear Orden Manual
                            </button>
                        </div>
                    )}
                </>
            ) : (
                // Manual Order Form
                <ManualOrderForm
                    onBack={() => setShowManualOrder(false)}
                    onSuccess={() => {
                        onSuccess();
                        onClose();
                    }}
                    collaborators={collaborators}
                />
            )}
        </Modal>
    );
};

// Manual Order Form Component
interface ManualOrderFormProps {
    onBack: () => void;
    onSuccess: () => void;
    collaborators: Array<{ id: string; name: string }>;
}

const ManualOrderForm: React.FC<ManualOrderFormProps> = ({ onBack, onSuccess, collaborators }) => {
    const [amount, setAmount] = useState('');
    const [txid, setTxid] = useState('');
    const [collaboratorId, setCollaboratorId] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!amount || !txid || !collaboratorId) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        setLoading(true);
        try {
            const collaborator = collaborators.find(c => c.id === collaboratorId);
            await investmentService.createManualDepositOrder({
                amountUSDT: parseFloat(amount),
                txid,
                collaboratorName: collaborator?.name || '',
                notes,
            });
            alert('Orden manual creada. Pendiente de conciliación.');
            onSuccess();
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.response?.data?.error || 'Error al crear orden');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-yellow-900/20 border border-yellow-700 p-3 rounded-lg">
                <p className="text-sm text-yellow-400">
                    Completa los datos de la transacción que el colaborador te proporcionó
                </p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monto Depositado (USDT) *
                </label>
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ej: 1000"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    TXID de la Transacción BTC *
                </label>
                <input
                    type="text"
                    value={txid}
                    onChange={(e) => setTxid(e.target.value)}
                    placeholder="ID de transacción blockchain"
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Colaborador que Realizó el Depósito *
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
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notas Adicionales (Opcional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Información adicional sobre la transacción"
                    rows={3}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                />
            </div>

            <div className="flex gap-3">
                <button
                    onClick={onBack}
                    className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
                >
                    Volver
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-profit hover:bg-emerald-500 text-black font-bold py-3 rounded-lg transition disabled:opacity-50"
                >
                    {loading ? 'Creando...' : 'Crear Orden de Depósito'}
                </button>
            </div>
        </div>
    );
};
