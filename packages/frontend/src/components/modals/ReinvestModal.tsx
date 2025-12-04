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
    const [percentage, setPercentage] = useState(50);
    const [loading, setLoading] = useState(false);

    const amountNum = parseFloat(amount) || 0;
    const newCapital = currentCapital + amountNum;

    const handlePercentageChange = (value: number) => {
        setPercentage(value);
        setAmount(((availableProfit * value) / 100).toFixed(2));
    };

    const handleAmountChange = (value: string) => {
        setAmount(value);
        const num = parseFloat(value) || 0;
        setPercentage(Math.min(100, (num / availableProfit) * 100));
    };

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
        <Modal isOpen={isOpen} onClose={onClose} title="Reinvertir Ganancias" maxWidth="lg">
            {/* Balance Info */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Capital Actual</p>
                    <p className="text-2xl font-bold text-white">${currentCapital.toFixed(2)}</p>
                </div>
                <div className="bg-profit/10 border border-profit p-4 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Profit Disponible</p>
                    <p className="text-2xl font-bold text-profit">${availableProfit.toFixed(2)}</p>
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-2">
                    <TrendingUp className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-blue-400 mb-1">¿Qué es reinvertir?</h4>
                        <p className="text-sm text-gray-300">
                            Convierte tus ganancias en capital de inversión para aumentar tu rendimiento futuro.
                            El monto reinvertido se sumará a tu capital inicial.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Monto a Reinvertir (USDT)
                    </label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder="Ej: 500"
                        max={availableProfit}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-lg font-semibold"
                    />
                </div>

                {/* Percentage Slider */}
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-medium text-gray-300">
                            Porcentaje del Profit
                        </label>
                        <span className="text-lg font-bold text-accent">{percentage.toFixed(0)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100"
                        value={percentage}
                        onChange={(e) => handlePercentageChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>25%</span>
                        <span>50%</span>
                        <span>75%</span>
                        <span>100%</span>
                    </div>
                </div>

                {/* Quick Percentage Buttons */}
                <div className="grid grid-cols-4 gap-2">
                    {[25, 50, 75, 100].map((pct) => (
                        <button
                            key={pct}
                            onClick={() => handlePercentageChange(pct)}
                            className="py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition text-sm font-semibold"
                        >
                            {pct}%
                        </button>
                    ))}
                </div>

                {/* Preview */}
                {amountNum > 0 && (
                    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <h4 className="text-sm font-semibold text-gray-400 mb-3">Resumen de Reinversión:</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Capital Actual:</span>
                                <span className="text-white font-semibold">${currentCapital.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Monto a Reinvertir:</span>
                                <span className="text-profit font-semibold">+${amountNum.toFixed(2)}</span>
                            </div>
                            <div className="border-t border-gray-700 pt-2 mt-2"></div>
                            <div className="flex justify-between">
                                <span className="text-white font-bold">Nuevo Capital:</span>
                                <span className="text-accent font-bold text-lg">${newCapital.toFixed(2)}</span>
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
                    className="w-full bg-profit hover:bg-emerald-500 text-black font-bold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Procesando...' : 'Confirmar Reinversión'}
                </button>

                {/* Warning */}
                <div className="bg-yellow-900/20 border border-yellow-700 p-3 rounded-lg">
                    <p className="text-xs text-yellow-400">
                        ⚠️ Monto mínimo de reinversión: $10 USDT. La reinversión es inmediata y aumentará tu capital de inversión.
                    </p>
                </div>
            </div>
        </Modal>
    );
};
