import { Wallet, PiggyBank, TrendingUp } from 'lucide-react';
import { formatUSDT } from '../../utils/formatters';

interface StatsCardsProps {
    capitalUSDT: number;
    profitUSDT: number;
    weeklyRate: number;
    onDeposit: () => void;
    onReinvest: () => void;
    onWithdraw: () => void;
    onProjections: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
    capitalUSDT,
    profitUSDT,
    weeklyRate,
    onDeposit,
    onReinvest,
    onWithdraw,
    onProjections,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {/* CAPITAL INICIAL */}
            <div className="card p-3 sm:p-4 rounded-xl border-l-4 border-accent">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white">CAPITAL INICIAL</h3>
                    <Wallet className="w-4 h-4 text-accent" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-white mb-1 data-metric">
                    ${formatUSDT(capitalUSDT)}
                </p>
                <p className="text-xs text-gray-400 mb-2 sm:mb-3">Capital base USDT</p>
                <button
                    onClick={onDeposit}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-medium py-1.5 px-3 rounded-lg transition duration-200 text-xs w-full"
                >
                    AÑADIR (+)
                </button>
            </div>

            {/* PROFIT DISPONIBLE */}
            <div className="card p-3 sm:p-4 rounded-xl border-l-4 border-profit">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white">PROFIT DISPONIBLE</h3>
                    <PiggyBank className="w-4 h-4 text-profit" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-profit mb-1 data-metric">
                    ${formatUSDT(profitUSDT)}
                </p>
                <p className="text-xs text-gray-400 mb-2 sm:mb-3">Ganancias acumuladas</p>
                <div className="flex gap-2">
                    <button
                        onClick={onReinvest}
                        className="bg-profit hover:bg-emerald-400 text-black font-bold py-1.5 rounded-lg transition duration-200 text-xs flex-grow"
                    >
                        REINVERTIR
                    </button>
                    <button
                        onClick={onWithdraw}
                        className="bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 rounded-lg transition duration-200 text-xs flex-grow"
                    >
                        RETIRAR
                    </button>
                </div>
            </div>

            {/* TASA SEMANAL */}
            <div className="card p-3 sm:p-4 rounded-xl border-l-4 border-sky-500">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs sm:text-sm font-bold text-white">TASA SEMANAL</h3>
                    <TrendingUp className="w-4 h-4 text-sky-500" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-sky-400 mb-1 data-metric">
                    +{weeklyRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400 mb-2 sm:mb-3">Ganancia esperada</p>
                <button
                    onClick={onProjections}
                    className="bg-gray-600 hover:bg-gray-500 text-white font-medium py-1.5 rounded-lg transition duration-200 text-xs w-full"
                >
                    Ver Proyecciones
                </button>
            </div>
        </div>
    );
};
