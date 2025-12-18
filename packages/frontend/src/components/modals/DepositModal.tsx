import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Copy, Upload, MessageCircle } from 'lucide-react';
import { investmentService, Bank } from '../../services/investmentService';

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
    const [collaborators, setCollaborators] = useState<Array<{
        id: string;
        name: string;
        whatsappNumber?: string;
        role: string;
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
                proof: proof, // Updated to send File object
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
        <Modal isOpen={isOpen} onClose={onClose} title="Realizar aporte" maxWidth="xl">
            {!showManualOrder ? (
                <>
                    {/* Tabs */}
                    <div className="flex flex-col sm:flex-row gap-2 mb-4">
                        <button
                            onClick={() => setActiveTab('direct')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${activeTab === 'direct'
                                ? 'bg-accent text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Aporte directo (BTC)
                        </button>
                        <button
                            onClick={() => setActiveTab('collaborator')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition ${activeTab === 'collaborator'
                                ? 'bg-profit text-black'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            Con colaborador (FIAT)
                        </button>
                    </div>

                    {/* Direct Deposit Tab */}
                    {activeTab === 'direct' && (
                        <div className="space-y-3">
                            <div className="bg-blue-900/20 border border-blue-700 p-3 rounded-lg">
                                <h4 className="font-bold text-blue-400 mb-2 text-sm">Instrucciones:</h4>
                                <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside">
                                    <li>Copia la dirección BTC que aparece abajo</li>
                                    <li>Envía BTC desde tu wallet personal a esa dirección</li>
                                    <li>Ingresa el monto equivalente en USDT que aportaste</li>
                                    <li>Proporciona el TXID de la transacción (recomendado para procesamiento rápido)</li>
                                    <li>Adjunta un comprobante de la transacción (captura de pantalla)</li>
                                    <li>Envía la solicitud y espera la confirmación</li>
                                </ol>
                            </div>

                            <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                                <p className="text-xs text-gray-400 mb-1">Tu dirección de aporte BTC:</p>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-gray-900 p-2 rounded text-accent text-xs break-all font-mono">
                                        {userDepositAddress}
                                    </code>
                                    <button
                                        onClick={handleCopyAddress}
                                        className="p-2 bg-accent hover:bg-blue-500 rounded transition shrink-0"
                                        title="Copiar dirección"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Monto aportado (USDT)
                                </label>
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="Ej: 1000"
                                    className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-accent transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    TXID (Opcional)
                                </label>
                                <input
                                    type="text"
                                    value={txid}
                                    onChange={(e) => setTxid(e.target.value)}
                                    placeholder="ID de transacción blockchain"
                                    className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-accent transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-300 mb-1">
                                    Comprobante
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
                                        className="flex-1 p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm cursor-pointer hover:border-accent hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Upload className="w-4 h-4" />
                                        <span className="truncate">{proof ? proof.name : 'Seleccionar archivo'}</span>
                                    </label>
                                </div>
                            </div>

                            <button
                                onClick={handleDirectDeposit}
                                disabled={loading}
                                className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 shadow-lg shadow-accent/20 hover:shadow-accent/40 text-sm"
                            >
                                {loading ? 'Enviando...' : 'Enviar solicitud'}
                            </button>
                        </div>
                    )}

                    {/* Collaborator Tab */}
                    {activeTab === 'collaborator' && (
                        <div className="space-y-3">
                            <div className="bg-blue-900/20 border border-blue-700 p-3 rounded-lg">
                                <h4 className="font-bold text-blue-400 mb-2 text-sm">Instrucciones:</h4>
                                <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside">
                                    <li>Selecciona un colaborador de la lista y contáctalo vía WhatsApp</li>
                                    <li>Acuerda el monto a aportar y el método de pago (transferencia, efectivo, etc.)</li>
                                    <li>Realiza la transferencia de dinero FIAT al colaborador según sus instrucciones</li>
                                    <li>El colaborador comprará BTC y lo enviará a tu dirección de aporte</li>
                                    <li>El colaborador te proporcionará el TXID de la transacción BTC</li>
                                    <li>Haz clic en "Crear orden manual" y completa los datos de la transacción</li>
                                    <li>Espera la confirmación para que se acredite tu saldo</li>
                                </ol>
                            </div>

                            <div>
                                <h4 className="font-semibold text-white mb-2 text-sm">Colaboradores disponibles:</h4>
                                <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
                                    {collaborators.length === 0 ? (
                                        <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
                                            <p className="text-gray-400 text-sm">
                                                Lo sentimos, en este momento no hay colaboradores disponibles.
                                                <br />
                                                Por favor utiliza el aporte directo.
                                            </p>
                                        </div>
                                    ) : (
                                        collaborators.map((collab) => (
                                            <div
                                                key={collab.id}
                                                className="flex items-center justify-between p-2.5 bg-gray-800 rounded-lg border border-gray-700 gap-2 hover:border-gray-600 transition-colors"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-sm font-bold text-gray-300">
                                                        {collab.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white text-sm">{collab.name}</p>
                                                        <p className="text-[10px] text-gray-400">{collab.role}</p>
                                                        {collab.collaboratorConfig && (
                                                            <div className="flex gap-2 mt-1">
                                                                <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-1 rounded border border-yellow-500/30">
                                                                    Comisión: {collab.collaboratorConfig.commission}%
                                                                </span>
                                                                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1 rounded border border-blue-500/30">
                                                                    Tiempo: {collab.collaboratorConfig.processingTime}
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                <a
                                                    href={`https://wa.me/${collab.whatsappNumber?.replace(/[^0-9]/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center justify-center gap-1.5 bg-green-600 hover:bg-green-500 text-white px-3 py-1.5 rounded-lg transition shadow-md shadow-green-600/20 hover:shadow-green-600/40"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                    <span className="text-xs font-medium">WhatsApp</span>
                                                </a>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {collaborators.length > 0 && (
                                <button
                                    onClick={() => setShowManualOrder(true)}
                                    className="w-full bg-profit hover:bg-emerald-500 text-black font-bold py-2.5 rounded-lg transition shadow-lg shadow-profit/20 hover:shadow-profit/40 mt-1 text-sm"
                                >
                                    Ya realicé el aporte - Crear orden manual
                                </button>
                            )}
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
                    banks={banks}
                />
            )}
        </Modal>
    );
};

// Manual Order Form Component
interface ManualOrderFormProps {
    onBack: () => void;
    onSuccess: () => void;
    collaborators: Array<{
        id: string;
        name: string;
        collaboratorConfig?: { commission: number; processingTime: string; minAmount: number; maxAmount: number };
    }>;
    banks: Bank[];
}

const ManualOrderForm: React.FC<ManualOrderFormProps> = ({ onBack, onSuccess, collaborators, banks }) => {
    const [amount, setAmount] = useState('');
    const [txid, setTxid] = useState('');
    const [collaboratorId, setCollaboratorId] = useState('');
    const [bankName, setBankName] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    const selectedCollaborator = collaborators.find(c => c.id === collaboratorId);

    const handleSubmit = async () => {
        if (!amount || !txid || !collaboratorId || !bankName) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        const amountVal = parseFloat(amount);
        if (selectedCollaborator?.collaboratorConfig) {
            const { minAmount, maxAmount } = selectedCollaborator.collaboratorConfig;
            if (minAmount > 0 && amountVal < minAmount) {
                alert(`El monto mínimo con este colaborador es $${minAmount}`);
                return;
            }
            if (maxAmount > 0 && amountVal > maxAmount) {
                alert(`El monto máximo con este colaborador es $${maxAmount}`);
                return;
            }
        }

        setLoading(true);
        try {
            await investmentService.createManualDepositOrder({
                amountUSDT: amountVal,
                txid,
                collaboratorName: selectedCollaborator?.name || '',
                notes,
                bankName,
                collaboratorId,
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

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monto aportado (USDT) *
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
                    TXID de la transacción BTC *
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
                    Colaborador que gestionó el aporte *
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
                {selectedCollaborator?.collaboratorConfig && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                            Min: ${selectedCollaborator.collaboratorConfig.minAmount}
                        </span>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                            Max: ${selectedCollaborator.collaboratorConfig.maxAmount}
                        </span>
                        <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20">
                            Comisión: {selectedCollaborator.collaboratorConfig.commission}%
                        </span>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Banco de preferencia *
                </label>
                <select
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                    <option value="">Selecciona un banco</option>
                    {banks.map((bank) => (
                        <option key={bank.id} value={bank.name}>
                            {bank.name}
                        </option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Notas adicionales (Opcional)
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
                    {loading ? 'Creando...' : 'Crear orden de aporte'}
                </button>
            </div>
        </div>
    );
};
