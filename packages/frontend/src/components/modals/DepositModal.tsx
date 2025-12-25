import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Countdown } from '../common/Countdown';
import { Copy, Upload, Building2 } from 'lucide-react';
import { investmentService, Bank } from '../../services/investmentService';
import { collaboratorBankService, CollaboratorBankAccount } from '../../services/collaboratorBankService';
import { QRCodeSVG } from 'qrcode.react';

interface DepositModalProps {
    isOpen: boolean;
    onClose: () => void;
    userDepositAddress?: string;
    onSuccess: () => void;
    userData: { name: string; username: string };
}

export const DepositModal: React.FC<DepositModalProps> = ({
    isOpen,
    onClose,
    userDepositAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa', // Fallback only
    onSuccess,
    userData,
}) => {
    const [activeTab, setActiveTab] = useState<'direct' | 'collaborator'>('direct');
    const [amount, setAmount] = useState('');
    const [txid, setTxid] = useState('');
    const [proof, setProof] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // NEW: Dynamic address assignment state
    const [assignedAddress, setAssignedAddress] = useState<string | null>(null);
    const [addressExpiration, setAddressExpiration] = useState<string | null>(null);
    const [addressLoading, setAddressLoading] = useState(false);
    const [reservedAddressId, setReservedAddressId] = useState<string | null>(null); // Store address ID

    const [collaborators, setCollaborators] = useState<Array<{
        id: string;
        name: string;
        whatsappNumber?: string;
        role: string;
        btcDepositAddress?: string;
        collaboratorConfig?: {
            commission: number;
            processingTime: string;
            minAmount: number;
            maxAmount: number;
        };
    }>>([]);

    // Reset form function
    const resetForm = () => {
        setAmount('');
        setTxid('');
        setProof(null);
        setAssignedAddress(null);
        setAddressExpiration(null);
        setReservedAddressId(null);
        setActiveTab('direct');
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Save the addressId BEFORE resetting
            const addressToRelease = reservedAddressId;

            // Reset the form first
            resetForm();

            // Then release the address if it exists
            if (addressToRelease) {
                investmentService.releaseReservedAddress(addressToRelease)
                    .catch(err => console.error('Error releasing address:', err));
            }
        }
    }, [isOpen, reservedAddressId]);

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

    // Address is requested manually by clicking "Solicitar Dirección" button

    const requestDepositAddress = async () => {
        if (!amount || parseFloat(amount) <= 0) {
            alert('Por favor ingrese un monto válido primero');
            return;
        }

        setAddressLoading(true);

        try {
            // Use NEW service that only reserves address (no task created)
            const response = await investmentService.reserveBtcAddress(parseFloat(amount));

            if (response.address && response.reservationId) {
                setAssignedAddress(response.address);
                setReservedAddressId(response.reservationId); // Store address ID

                // Calculate expiration (24 hours from now)
                const expirationDate = new Date();
                expirationDate.setHours(expirationDate.getHours() + 24);
                setAddressExpiration(expirationDate.toISOString());
            } else {
                alert('No se pudo asignar una dirección. Por favor contacte al soporte.');
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.error || 'Error al obtener dirección de depósito';
            console.error('[Request Address Error]:', errorMessage);
            alert(errorMessage);
        } finally {
            setAddressLoading(false);
        }
    };

    const handleCopyAddress = () => {
        const addressToCopy = assignedAddress || userDepositAddress;
        navigator.clipboard.writeText(addressToCopy);
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

        const amountNum = parseFloat(amount);
        if (amountNum < 50) {
            alert('El monto mínimo de aporte es $50 USDT');
            return;
        }

        if (!assignedAddress) {
            alert('Por favor solicita una dirección BTC primero');
            return;
        }

        setLoading(true);
        try {
            // Update address amount if it changed after requesting
            if (reservedAddressId) {
                await investmentService.updateReservedAddressAmount(reservedAddressId, amountNum);
            }

            // Create task with reserved address ID
            await investmentService.createAutoDeposit({
                amountUSDT: amountNum,
                txid,
                proof: proof,
                reservedAddressId: reservedAddressId || undefined,
            });
            alert('Solicitud de depósito enviada. Pendiente de aprobación.');
            resetForm(); // Clear form after successful submission
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
                            <li>Ingresa el monto en USDT que deseas aportar</li>
                            <li>Haz clic en "Solicitar dirección BTC" para obtener una dirección única</li>
                            <li>Copia la dirección BTC que aparecerá abajo</li>
                            <li>Envía BTC desde tu wallet personal a esa dirección</li>
                            <li>Proporciona el TXID de la transacción (recomendado para procesamiento rápido)</li>
                            <li>Adjunta un comprobante de la transacción (captura de pantalla)</li>
                            <li>Haz clic en "Enviar solicitud" y espera la confirmación</li>
                        </ol>
                    </div>

                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                        <p className="text-xs text-gray-400 mb-2">Dirección de depósito BTC:</p>

                        {addressLoading ? (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-400">Solicitando dirección...</p>
                            </div>
                        ) : assignedAddress ? (
                            <>
                                {/* QR Code */}
                                <div className="flex justify-center mb-3">
                                    <div className="bg-white p-3 rounded-lg">
                                        <QRCodeSVG value={assignedAddress} size={160} />
                                    </div>
                                </div>

                                {/* Address */}
                                <div className="flex items-center gap-2 mb-2">
                                    <code className="flex-1 bg-gray-900 p-2 rounded text-accent text-xs break-all font-mono">
                                        {assignedAddress}
                                    </code>
                                    <button
                                        onClick={handleCopyAddress}
                                        className="p-2 bg-accent hover:bg-blue-500 rounded transition shrink-0"
                                        title="Copiar dirección"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Expiration Timer */}
                                {addressExpiration && (
                                    <div className="bg-yellow-900/20 border border-yellow-700 p-2 rounded text-center">
                                        <p className="text-xs text-yellow-400">
                                            ⏱️ Esta dirección expira en: <Countdown targetDate={addressExpiration} />
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Envía tu depósito antes de la expiración
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-gray-400 mb-2">Ingrese un monto para obtener dirección</p>
                                <button
                                    onClick={requestDepositAddress}
                                    className="bg-accent hover:bg-blue-500 text-white px-4 py-2 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!amount || parseFloat(amount) < 50}
                                >
                                    Solicitar dirección
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                            Monto a aportar (USDT)
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Ej: 1000"
                            className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-accent transition-colors"
                        />
                        {amount && parseFloat(amount) < 50 && (
                            <p className="text-[10px] text-yellow-400 mt-1 flex items-center gap-1">
                                <span>⚠️</span>
                                <span>Monto mínimo de aporte: $50 USDT</span>
                            </p>
                        )}
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
                        disabled={loading || !assignedAddress}
                        className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 shadow-lg shadow-accent/20 hover:shadow-accent/40 text-sm"
                    >
                        {loading ? 'Enviando...' : 'Enviar solicitud'}
                    </button>
                </div>
            )}

            {/* Collaborator Tab */}
            {activeTab === 'collaborator' && (
                <ManualOrderForm
                    onBack={() => setActiveTab('direct')}
                    onSuccess={() => {
                        onSuccess();
                        onClose();
                    }}
                    collaborators={collaborators}
                    banks={banks}
                    userData={userData}
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
        whatsappNumber?: string;
        collaboratorConfig?: { commission: number; processingTime: string; minAmount: number; maxAmount: number };
    }>;
    banks: Bank[];
    userData: { name: string; username: string };
}

const ManualOrderForm: React.FC<ManualOrderFormProps> = ({ onBack, onSuccess, collaborators, banks: _systemBanks, userData }) => {
    const [amount, setAmount] = useState('');
    const [collaboratorId, setCollaboratorId] = useState('');
    const [bankName, setBankName] = useState('');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    // New state for collaborator banks
    const [activeCollaboratorBanks, setActiveCollaboratorBanks] = useState<CollaboratorBankAccount[]>([]);
    const [loadingBanks, setLoadingBanks] = useState(false);
    const [selectedBankId, setSelectedBankId] = useState('');

    const selectedCollaborator = collaborators.find(c => c.id === collaboratorId);

    // Fetch banks when collaborator changes
    useEffect(() => {
        const fetchCollaboratorBanks = async () => {
            if (!collaboratorId) {
                setActiveCollaboratorBanks([]);
                setBankName('');
                setSelectedBankId('');
                return;
            }

            setLoadingBanks(true);
            try {
                // Fetch active banks for this collaborator
                const banks = await collaboratorBankService.getActiveCollaboratorBankAccounts(collaboratorId);
                setActiveCollaboratorBanks(banks || []);
            } catch (error) {
                console.error('Error fetching collaborator banks:', error);
                setActiveCollaboratorBanks([]);
            } finally {
                setLoadingBanks(false);
            }
        };

        fetchCollaboratorBanks();
    }, [collaboratorId]);

    const handleSubmit = async () => {
        if (!amount || !collaboratorId || !bankName) {
            alert('Por favor completa todos los campos obligatorios');
            return;
        }

        const amountVal = parseFloat(amount);
        if (amountVal < 50) {
            alert('El monto mínimo de aporte es $50 USDT');
            return;
        }
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

        if (!selectedCollaborator?.whatsappNumber) {
            alert('El colaborador seleccionado no tiene número de WhatsApp configurado');
            return;
        }

        setLoading(true);
        try {
            await investmentService.createManualDepositOrder({
                amountUSDT: amountVal,
                txid: 'MANUAL', // Placeholder as it is not required for user input anymore
                collaboratorName: selectedCollaborator?.name || '',
                notes,
                bankName,
                collaboratorId,
            });

            // Build WhatsApp Message
            let message = `Hola, Soy ${userData.name}. Mi username en la plataforma es @${userData.username}.
Deseo realizar un aporte de $${amount} a una cuenta del banco ${bankName}, por favor regálame los datos para hacer la transacción.`;

            if (notes) {
                message += `\n\nNota adicional: ${notes}`;
            }

            message += `\n\nGracias`;

            const encodedMessage = encodeURIComponent(message);
            const whatsappUrl = `https://wa.me/${selectedCollaborator.whatsappNumber}?text=${encodedMessage}`;

            // alert('Orden manual creada. Redirigiendo a WhatsApp...'); // Optional logic, removed for smoother flow or keep if desired
            window.open(whatsappUrl, '_blank');
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
            {/* Instructions */}
            <div className="bg-profit/10 border border-profit/30 p-3 rounded-lg">
                <h4 className="font-bold text-profit mb-2 text-sm">Instrucciones:</h4>
                <ol className="text-xs text-gray-300 space-y-1.5 list-decimal list-inside">
                    <li>Ingresa el monto a aportar</li>
                    <li>Selecciona un <b>colaborador</b> de la lista</li>
                    <li>Elige el <b>banco</b> de destino para tu depósito</li>
                    <li>Crea la orden y completa el proceso mediante WhatsApp</li>
                </ol>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Monto a aportar (USDT) *
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
                    Selecciona un colaborador para gestionar el aporte *
                </label>
                <select
                    value={collaboratorId}
                    onChange={(e) => {
                        setCollaboratorId(e.target.value);
                        setBankName(''); // Reset bank selection
                        setSelectedBankId('');
                    }}
                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                >
                    <option value="">---</option>
                    {collaborators.map((collab) => (
                        <option key={collab.id} value={collab.id}>
                            {collab.name}
                        </option>
                    ))}
                </select>
                {selectedCollaborator?.collaboratorConfig && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                            Aporte min: ${selectedCollaborator.collaboratorConfig.minAmount}
                        </span>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded text-gray-300">
                            Aporte max: ${selectedCollaborator.collaboratorConfig.maxAmount}
                        </span>
                        <span className="text-xs bg-yellow-500/10 text-yellow-500 px-2 py-1 rounded border border-yellow-500/20">
                            Comisión: {selectedCollaborator.collaboratorConfig.commission}%
                        </span>
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Banco de depósito (Cuenta del Colaborador) *
                </label>
                {loadingBanks ? (
                    <div className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 text-sm">
                        Cargando cuentas disponibles...
                    </div>
                ) : !collaboratorId ? (
                    <div className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-500 text-sm italic">
                        Selecciona un colaborador primero
                    </div>
                ) : activeCollaboratorBanks.length === 0 ? (
                    <div className="w-full p-3 bg-red-900/20 border border-red-700 rounded-lg text-red-400 text-sm">
                        Este colaborador no tiene cuentas bancarias activas. Por favor selecciona otro colaborador.
                    </div>
                ) : (
                    <div className="space-y-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {activeCollaboratorBanks.map((bank) => (
                                <button
                                    key={bank.id}
                                    onClick={() => {
                                        setBankName(bank.bankName);
                                        setSelectedBankId(bank.id);
                                    }}
                                    className={`relative flex items-center p-3 rounded-lg border transition-all text-left ${selectedBankId === bank.id
                                        ? 'bg-profit/10 border-profit text-white'
                                        : 'bg-gray-800 border-gray-700 text-gray-400 hover:border-gray-500'
                                        }`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center">
                                            <Building2 className={`w-4 h-4 mr-2 ${selectedBankId === bank.id ? 'text-profit' : 'text-gray-500'}`} />
                                            <span className={`font-semibold text-sm truncate ${selectedBankId === bank.id ? 'text-profit' : 'text-gray-200'}`}>
                                                {bank.bankName}
                                            </span>
                                        </div>
                                    </div>
                                    {selectedBankId === bank.id && (
                                        <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-profit shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                                    )}
                                </button>
                            ))}
                        </div>
                        <p className="text-[10px] text-gray-500 italic mt-1 ml-1">
                            * Selecciona el banco al que deseas realizar el depósito
                        </p>
                    </div>
                )}
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
