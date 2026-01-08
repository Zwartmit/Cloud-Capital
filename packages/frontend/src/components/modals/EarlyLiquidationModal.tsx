import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { investmentService } from '../../services/investmentService';

interface EarlyLiquidationModalProps {
    isOpen: boolean;
    onClose: () => void;
    capitalAmount: number;
    profitAmount: number;
    onSuccess: () => void;
}

export const EarlyLiquidationModal: React.FC<EarlyLiquidationModalProps> = ({
    isOpen,
    onClose,
    capitalAmount,
    profitAmount,
    onSuccess,
}) => {
    const [btcAddress, setBtcAddress] = useState('');
    const [confirmationText, setConfirmationText] = useState('');
    const [loading, setLoading] = useState(false);

    // Constants
    const PENALTY_RATE = 0.38;
    const CONFIRMATION_PHRASE = "ACEPTO LA PENALIDAD";

    // Calculations
    const penaltyAmount = capitalAmount * PENALTY_RATE;
    const netAmount = capitalAmount - penaltyAmount;

    // Reset form function
    const resetForm = () => {
        setBtcAddress('');
        setConfirmationText('');
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (loading) return;

        if (confirmationText !== CONFIRMATION_PHRASE) {
            alert('Debes escribir la frase de confirmación exactamente igual.');
            return;
        }

        if (!btcAddress) {
            alert('Ingresa una dirección de Bitcoin válida.');
            return;
        }

        if (capitalAmount < 50) {
            alert('El monto mínimo de liquidación es $50 USDT');
            return;
        }

        setLoading(true);
        try {
            await investmentService.liquidateCapital(btcAddress);
            alert('Solicitud de liquidación enviada correctamente.');
            resetForm(); // Clear form after successful submission
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Liquidation error:', error);
            alert(error.response?.data?.error || 'Error al procesar la liquidación.');
        } finally {
            setLoading(false);
        }
    };

    const isConfirmDisabled = confirmationText !== CONFIRMATION_PHRASE || !btcAddress || loading;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Liquidación anticipada de capital" maxWidth="lg">
            <div className="space-y-6">
                {/* Warning Card */}
                <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex gap-4 items-start">
                    <ShieldAlert className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                    <div>
                        <h4 className="text-red-500 font-bold text-sm mb-1">¡Advertencia de penalidad!</h4>
                        <p className="text-xs text-red-200/80 leading-relaxed">
                            Estás a punto de liquidar tu plan antes del plazo contractual. Esta acción conlleva una
                            <span className="font-bold text-white"> penalidad operativa del 38% </span>
                            sobre tu aporte total transferido, según lo estipulado en la Cláusula 3 de los Términos y Condiciones.
                            {profitAmount > 0 && (
                                <>
                                    <br /><br />
                                    Además, ten en cuenta que <span className="font-bold text-white">perderás el 100% del profit acumulado</span> generado hasta el momento.
                                </>
                            )}
                        </p>
                    </div>
                </div>

                {/* Calculation Table */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 space-y-3">
                    <div className="flex justify-between items-center text-sm text-gray-400">
                        <span>Aporte total (Capital):</span>
                        <span className="text-white font-mono">${capitalAmount.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-red-400">
                        <span>Penalidad por liquidación (38%):</span>
                        <span className="font-mono">-${penaltyAmount.toFixed(2)} USD</span>
                    </div>
                    <div className="h-px bg-gray-600 my-2"></div>
                    <div className="flex justify-between items-center text-base font-bold text-white">
                        <span>Monto neto a recibir:</span>
                        <span className="text-accent font-mono border-b border-accent border-dashed">
                            ${netAmount.toFixed(2)} USD
                        </span>
                    </div>
                </div>

                {/* Profit Loss Warning - Separated from calculation table */}
                {profitAmount > 0 && (
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-3 flex justify-between items-center">
                        <span className="text-sm text-orange-400">Profit acumulado (se perderá):</span>
                        <span className="font-mono font-bold text-orange-400">-${profitAmount.toFixed(2)} USD</span>
                    </div>
                )}

                {/* BTC Address Input */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                        Dirección BTC para recepción de fondos
                    </label>
                    <input
                        type="text"
                        value={btcAddress}
                        onChange={(e) => setBtcAddress(e.target.value)}
                        placeholder="Ingresa tu dirección de Bitcoin"
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                    />
                </div>

                {/* Confirmation Section */}
                <div className="space-y-3 pt-2">
                    <label className="block text-xs text-gray-400">
                        Para confirmar, escribe: <span className="font-mono select-all text-white font-bold">{CONFIRMATION_PHRASE}</span>
                    </label>
                    <input
                        type="text"
                        value={confirmationText}
                        onChange={(e) => setConfirmationText(e.target.value)}
                        placeholder={CONFIRMATION_PHRASE}
                        className="w-full p-3 bg-gray-900 border border-red-900/50 rounded-lg text-white text-center font-bold tracking-widest focus:border-red-500 transition-colors placeholder-gray-700"
                        onPaste={(e) => e.preventDefault()} // Force typing for safety? Maybe too annoying. Allowed for now.
                    />
                </div>

                {/* Action Buttons */}
                <div className="pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={isConfirmDisabled}
                        className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 shadow-lg
                            ${isConfirmDisabled
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-600/20 hover:shadow-red-500/40'
                            }`}
                    >
                        {loading ? 'Procesando liquidación...' : 'CONFIRMAR LIQUIDACIÓN DE CAPITAL'}
                    </button>
                    <p className="text-center text-[10px] text-gray-500 mt-3">
                        Al hacer clic, aceptas que esta operación es irreversible y aceptas la deducción de la penalidad.
                    </p>
                </div>
            </div>
        </Modal>
    );
};
