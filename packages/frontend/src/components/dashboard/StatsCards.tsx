import { Wallet, TrendingUp } from 'lucide-react';
import { formatUSDT } from '../../utils/formatters';

interface StatsCardsProps {
    capitalUSDT: number;
    weeklyRate: number;
    onDeposit: () => void;
    onProjections: () => void;
}

export const StatsCards: React.FC<StatsCardsProps> = ({
    capitalUSDT,
    weeklyRate,
    onDeposit,
    onProjections,
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            {/* CAPITAL INICIAL */}
            <div className="card p-4 sm:p-5 rounded-2xl border-l-4 border-accent hover:border-l-[6px] transition-all duration-300 group">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wider">Capital Inicial</h3>
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                        <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black gradient-text-primary data-metric mb-1">
                    ${formatUSDT(capitalUSDT)}
                </p>
                <p className="text-xs text-gray-400 mb-3 sm:mb-4">Capital base USDT</p>
                <button
                    onClick={onDeposit}
                    className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-200 text-xs w-full shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                    AÑADIR (+)
                </button>
            </div>

            {/* TASA SEMANAL */}
            <div className="card p-4 sm:p-5 rounded-2xl border-l-4 border-accent hover:border-l-[6px] transition-all duration-300 group">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wider">Tasa Semanal</h3>
                    <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                    </div>
                </div>
                <p className="text-2xl sm:text-3xl font-black gradient-text-primary data-metric mb-1">
                    +{weeklyRate.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-400 mb-3 sm:mb-4">Ganancia esperada</p>
                <button
                    onClick={onProjections}
                    className="bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-bold py-2 rounded-lg transition-all duration-200 text-xs w-full shadow-lg hover:shadow-xl hover:scale-[1.02]"
                >
                    Ver proyecciones
                </button>
            </div>
        </div>
    );
};
