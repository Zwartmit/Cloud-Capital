import { useState } from 'react';
import { Modal } from '../common/Modal';
import { TrendingUp } from 'lucide-react';
import { investmentService } from '../../services/investmentService';

interface ReinvestModalProps {
    isOpen: boolean;
    onClose: () => void;
    availableProfit: number;
    currentCapital: number;
    onSuccess: () => void;
}

export const ReinvestModal: React.FC<ReinvestModalProps> = ({
    isOpen,
    onClose,
    availableProfit,
    currentCapital,
    onSuccess,
}) => {
    const [amount, setAmount] = useState('');
    const [loading, setLoading] = useState(false);

    const amountNum = parseFloat(amount) || 0;
    const newCapital = currentCapital + amountNum;

    const handleReinvest = async () => {
        if (!amount || amountNum <= 0) {
            alert('Por favor ingresa un monto válido');
            return;
        }

        if (amountNum > availableProfit) {
            alert('El monto excede tu profit disponible');
            return;
        }

        if (amountNum < 10) {
            alert('El monto mínimo de reinversión es $10 USDT');
            return;
        }

        setLoading(true);
        try {
            await investmentService.reinvestProfit({
                amountUSD: amountNum,
            });
            alert(`Reinversión exitosa! Nuevo capital: $${newCapital.toFixed(2)}`);
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error('Error:', error);
            alert(error.response?.data?.error || 'Error al reinvertir');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Reinvertir ganancias" maxWidth="lg">
            {/* Balance Info */}
            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Capital Actual</p>
                    <p className="text-xl font-bold text-white">${currentCapital.toFixed(2)}</p>
                </div>
                <div className="bg-profit/10 border border-profit p-3 rounded-lg">
                    <p className="text-[10px] text-gray-400 mb-1 uppercase tracking-wider">Profit Disponible</p>
                    <p className="text-xl font-bold text-profit">${availableProfit.toFixed(2)}</p>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-900/20 border border-blue-700 p-3 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                    <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-blue-400 mb-1 text-xs">¿Qué es reinvertir?</h4>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            Convierte tus ganancias en capital de inversión para aumentar tu rendimiento futuro.
                        </p>
                    </div>
                </div>
            </div>


            <div className="space-y-4">
                {/* Amount Input */}
                <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                        Monto a reinvertir (USDT)
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Ej: 500"
                        max={availableProfit}
                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-base font-semibold focus:border-accent transition-colors"
                    />
                </div>

                {/* Preview */}
                {amountNum > 0 && (
                    <div className="bg-gray-800 p-3 rounded-lg border border-gray-700">
                        <h4 className="text-xs font-semibold text-gray-400 mb-2">Resumen:</h4>
                        <div className="space-y-1.5 text-xs">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Capital Actual:</span>
                                <span className="text-white font-semibold">${currentCapital.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Monto a Reinvertir:</span>
                                <span className="text-profit font-semibold">+${amountNum.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-700 pt-1.5 mt-1.5"></div>
                            <div className="flex justify-between items-center">
                                <span className="text-white font-bold">Nuevo Capital:</span>
                                <span className="text-accent font-bold text-base">${newCapital.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Profit Restante:</span>
                                <span className="text-gray-300">${(availableProfit - amountNum).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button
                    onClick={handleReinvest}
                    disabled={loading || amountNum <= 0}
                    className="w-full bg-profit hover:bg-emerald-500 text-black font-bold py-2.5 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-profit/20 hover:shadow-profit/40 text-sm mt-2"
                >
                    {loading ? 'Procesando...' : 'Confirmar reinversión'}
                </button>

                {/* Warning */}
                <div className="bg-yellow-900/20 border border-yellow-700 p-2.5 rounded-lg flex gap-2 items-start">
                    <span className="text-yellow-400 text-xs mt-0.5">⚠️</span>
                    <p className="text-[10px] text-yellow-400 leading-tight">
                        Monto mínimo: $10 USDT. La reinversión es inmediata y aumentará tu capital de inversión.
                    </p>
                </div>
            </div>
        </Modal>
    );
};
