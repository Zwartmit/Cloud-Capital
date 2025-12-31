import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Countdown } from '../common/Countdown';
import { Copy, Upload, Building2 } from 'lucide-react';
import investmentService from '../../services/investmentService';
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
    const [selectedMethod, setSelectedMethod] = useState<null | 'direct' | 'collaborator'>(null);
    const [amount, setAmount] = useState('');
    const [txid, setTxid] = useState('');
    const [proof, setProof] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);

    // NEW: Dynamic address assignment state
    const [assignedAddress, setAssignedAddress] = useState<string | null>(null);
    const [addressExpiration, setAddressExpiration] = useState<string | null>(null);
    const [addressLoading, setAddressLoading] = useState(false);
    const [reservedAddressId, setReservedAddressId] = useState<string | null>(null); // Store address ID
    const [isReuseNotification, setIsReuseNotification] = useState(false);

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
        setSelectedMethod(null);
        setIsReuseNotification(false);
    };

    // Handle back button click with cleanup
    const handleBack = () => {
        // Save state before resetting
        const addressToRelease = reservedAddressId;
        const wasReused = isReuseNotification;

        resetForm();

        // Only release if it exists and wasn't a reused historical address
        if (addressToRelease && !wasReused) {
            investmentService.releaseReservedAddress(addressToRelease)
                .catch(err => console.error('Error releasing address:', err));
        }
    };

    // Reset form when modal closes
    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            // Save the addressId BEFORE resetting
            const addressToRelease = reservedAddressId;
            const wasReused = isReuseNotification;

            resetForm();

            // Only release if it exists and wasn't a reused historical address
            if (addressToRelease && !wasReused) {
                investmentService.releaseReservedAddress(addressToRelease)
                    .catch(err => console.error('Error releasing address:', err));
            }
        }
    }, [isOpen, reservedAddressId, isReuseNotification]);

    // Check for active reservation when selecting 'direct' method
    useEffect(() => {
        if (selectedMethod === 'direct') {
            const checkReservation = async () => {
                setAddressLoading(true);
                try {
                    const reservation = await investmentService.getReservedAddress();
                    if (reservation) {
                        setAssignedAddress(reservation.address);
                        setReservedAddressId(reservation.reservationId);
                        setAddressExpiration(reservation.expiresAt);
                        setIsReuseNotification(true);
                    }
                } catch (error) {
                    console.error('Error checking reservation:', error);
                } finally {
                    setAddressLoading(false);
                }
            };
            checkReservation();
        }
    }, [selectedMethod]);

    // Fetch collaborators on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const collabData = await investmentService.getCollaborators();
                setCollaborators(collabData);
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
        setIsReuseNotification(false);

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

    const handleCopyAddress = async () => {
        const addressToCopy = assignedAddress || userDepositAddress;

        try {
            // Try modern clipboard API first
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(addressToCopy);
                alert('Dirección copiada al portapapeles');
                return;
            }
        } catch (err) {
            console.log('Clipboard API failed, trying fallback');
        }

        // Fallback method for mobile/older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = addressToCopy;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();

            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);

            if (successful) {
                alert('Dirección copiada al portapapeles');
            } else {
                throw new Error('execCommand failed');
            }
        } catch (err) {
            console.error('Copy failed:', err);
            // Last resort: show the address in an alert so user can copy manually
            alert(`Copia esta dirección manualmente:\n\n${addressToCopy}`);
        }
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
            {/* Selection Screen */}
            {selectedMethod === null && (
                <div className="space-y-4">
                    <div className="p-2 rounded-lg">
                        <p className="text-sm text-gray-300 text-center">
                            Selecciona el método de aporte que prefieras:
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Direct Deposit Button */}
                        <button
                            onClick={() => setSelectedMethod('direct')}
                            className="group relative p-6 bg-gradient-to-br from-blue-900/40 to-blue-800/20 hover:from-blue-800/60 hover:to-blue-700/40 border-2 border-blue-700/50 hover:border-accent rounded-xl transition-all duration-300 text-left"
                        >
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                                    <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Aporte directo (BTC)</h3>
                                    <p className="text-xs text-gray-400">Envía Bitcoin directamente desde tu wallet</p>
                                </div>
                            </div>
                        </button>

                        {/* Collaborator Deposit Button */}
                        <button
                            onClick={() => setSelectedMethod('collaborator')}
                            className="group relative p-6 bg-gradient-to-br from-emerald-900/40 to-emerald-800/20 hover:from-emerald-800/60 hover:to-emerald-700/40 border-2 border-emerald-700/50 hover:border-profit rounded-xl transition-all duration-300 text-left"
                        >
                            <div className="flex flex-col items-center text-center space-y-3">
                                <div className="w-16 h-16 rounded-full bg-profit/20 flex items-center justify-center group-hover:bg-profit/30 transition-colors">
                                    <svg className="w-8 h-8 text-profit" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-1">Con colaborador (FIAT)</h3>
                                    <p className="text-xs text-gray-400">Deposita en moneda local a través de un colaborador</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {/* Direct Deposit Form */}
            {selectedMethod === 'direct' && (
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
                                {/* Reused Address Message */}
                                {isReuseNotification && (
                                    <div className="bg-blue-900/30 border border-blue-500/50 p-3 rounded-lg text-center mb-4">
                                        <p className="text-xs text-blue-200 leading-relaxed">
                                            <span className="font-bold block mb-1">ℹ️ Dirección Vigente Encontrada</span>
                                            Ya habías solicitado una dirección recientemente. Esta dirección aún está reservada para ti, por lo que puedes utilizarla para tu nuevo aporte.
                                        </p>
                                    </div>
                                )}

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
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleCopyAddress();
                                        }}
                                        onTouchEnd={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleCopyAddress();
                                        }}
                                        className="p-3 bg-accent hover:bg-blue-500 active:bg-blue-600 rounded transition shrink-0 touch-manipulation"
                                        title="Copiar dirección"
                                        type="button"
                                    >
                                        <Copy className="w-5 h-5" />
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

                    <div className="flex gap-3">
                        <button
                            onClick={handleBack}
                            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 rounded-lg transition text-sm"
                        >
                            Volver
                        </button>
                        <button
                            onClick={handleDirectDeposit}
                            disabled={loading || !assignedAddress}
                            className="flex-1 bg-accent hover:bg-blue-500 text-white font-bold py-2.5 rounded-lg transition disabled:opacity-50 shadow-lg shadow-accent/20 hover:shadow-accent/40 text-sm"
                        >
                            {loading ? 'Enviando...' : 'Enviar solicitud'}
                        </button>
                    </div>
                </div>
            )}

            {/* Collaborator Form */}
            {selectedMethod === 'collaborator' && (
                <ManualOrderForm
                    onBack={() => setSelectedMethod(null)}
                    onSuccess={() => {
                        onSuccess();
                        onClose();
                    }}
                    collaborators={collaborators}
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
    userData: { name: string; username: string };
}

const ManualOrderForm: React.FC<ManualOrderFormProps> = ({ onBack, onSuccess, collaborators, userData }) => {
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
            const message = `Hola, Soy ${userData.name} (@${userData.username}).
Deseo realizar un aporte de $${amount} a su cuenta en ${bankName}.

Monto a aportar: $${amount}
${notes ? `Nota adicional: ${notes}` : ''}

Quedo atento a los datos de la cuenta para realizar la transferencia. Gracias.`;

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
