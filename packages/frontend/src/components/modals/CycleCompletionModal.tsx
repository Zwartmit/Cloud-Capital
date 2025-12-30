import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Wallet } from 'lucide-react';
import { investmentService } from '../../services/investmentService';

interface CycleCompletionModalProps {
    isOpen: boolean;
    onClose: () => void;
    totalProfit: number;
    onSuccess: () => void;
}

export const CycleCompletionModal: React.FC<CycleCompletionModalProps> = ({
    isOpen,
    onClose,
    totalProfit,
    onSuccess,
}) => {
    const [btcAddress, setBtcAddress] = useState('');
    const [loading, setLoading] = useState(false);

    // Reset form function
    const resetForm = () => {
        setBtcAddress('');
    };

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen]);

    const handleSubmit = async () => {
        if (loading) return;

        if (!btcAddress) {
            alert('Por favor ingresa una dirección de Bitcoin válida.');
            return;
        }

        if (totalProfit < 50) {
            alert('El monto mínimo de retiro es $50 USDT');
            return;
        }

        setLoading(true);
        try {
            // Use the existing enhanced withdrawal endpoint
            await investmentService.createWithdrawal({
                amountUSDT: totalProfit,
                btcAddress: btcAddress,
                destinationType: 'PERSONAL',
            });

            alert('¡Solicitud de retiro enviada correctamente! Tu profit será procesado el próximo viernes.');
            resetForm();
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Withdrawal error:', error);
            alert(error.response?.data?.error || 'Error al procesar el retiro.');
        } finally {
            setLoading(false);
        }
    };

    // Calculate platform fee (4.5%)
    const platformFee = totalProfit * 0.045;
    const netAmount = totalProfit - platformFee;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Retiro de Profit - Ciclo completado" maxWidth="lg">
            <div className="space-y-5">
                {/* Profit Display */}
                <div className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
                    <p className="text-xs text-gray-400 mb-2 uppercase tracking-wider text-center">Profit Total Generado</p>
                    <p className="text-2xl sm:text-3xl font-black text-profit text-center mb-3">
                        ${totalProfit.toFixed(2)} USDT
                    </p>

                    {/* Fee Breakdown */}
                    <div className="space-y-2 text-xs border-t border-gray-700 pt-3">
                        <div className="flex justify-between text-gray-400">
                            <span>Profit a retirar:</span>
                            <span className="text-white font-semibold">${totalProfit.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-red-400">
                            <span>Costo operativo (4.5%):</span>
                            <span>-${platformFee.toFixed(2)}</span>
                        </div>
                        <div className="border-t border-gray-700 pt-2 flex justify-between font-bold text-accent">
                            <span>Neto a recibir:</span>
                            <span>${netAmount.toFixed(2)} USDT</span>
                        </div>
                    </div>
                </div>

                {/* Important Notice */}
                <div className="bg-blue-900/20 border border-blue-600 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                        <Wallet className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <h4 className="font-bold text-blue-400 mb-1 text-xs">Importante:</h4>
                            <ul className="text-xs text-gray-300 leading-relaxed space-y-1">
                                <li>• Este retiro es <strong>solo de profit</strong>, tu capital permanece intacto</li>
                                <li>• Puedes continuar invirtiendo o solicitar liquidación desde tu perfil</li>
                                <li>• Los retiros se procesan únicamente los viernes</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* BTC Address Input */}
                <div>
                    <label className="block text-xs font-medium text-gray-400 mb-1">
                        Dirección BTC para recepción de fondos
                    </label>
                    <input
                        type="text"
                        value={btcAddress}
                        onChange={(e) => setBtcAddress(e.target.value)}
                        placeholder="bc1q... o 1... o 3..."
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg text-white font-mono text-sm focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                    />
                    <p className="text-[10px] text-gray-500 mt-1 italic">
                        Verifica bien la dirección. Las transacciones son irreversibles.
                    </p>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                    <button
                        onClick={handleSubmit}
                        disabled={loading || !btcAddress}
                        className={`w-full py-3 px-4 rounded-lg font-bold text-sm transition-all duration-200 shadow-lg
                            ${loading || !btcAddress
                                ? 'bg-gray-800 text-gray-500 cursor-not-allowed opacity-50'
                                : 'bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-800 text-white shadow-green-600/20 hover:shadow-green-500/40'
                            }`}
                    >
                        {loading ? 'Procesando retiro...' : 'Confirmar retiro de Profit'}
                    </button>
                    <p className="text-center text-[10px] text-gray-500 mt-3">
                        Al confirmar, aceptas el costo operativo del 4.5% sobre el monto a retirar.
                    </p>
                </div>
            </div>
        </Modal>
    );
};
