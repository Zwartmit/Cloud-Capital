import { formatUSDT } from '../../utils/formatters';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { ChevronsUp, ChevronsDown, TrendingUp } from 'lucide-react';
import { InvestmentPlan } from '../../services/investmentPlanService';
import { getPlanColor } from '../../utils/planStyles';

interface BalanceCardProps {
    capitalUSDT: number;
    currentBalanceUSDT: number;
    btcPrice: number;
    btcChange?: number;
    currentPlan: InvestmentPlan | null;
    onReinvest: () => void;
    onWithdraw: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
    capitalUSDT,
    currentBalanceUSDT,
    btcPrice,
    btcChange = 0,
    currentPlan,
    onReinvest,
    onWithdraw,
}) => {
    const profitUSDT = currentBalanceUSDT - capitalUSDT;
    const profitPercent = capitalUSDT > 0 ? (profitUSDT / capitalUSDT) * 100 : 0;

    const [balanceHistory, setBalanceHistory] = useState<{ date: string; balance: number }[]>([]);

    // Fetch real balance history from API
    useEffect(() => {
        const fetchBalanceHistory = async () => {
            try {
                const history = await userService.getBalanceHistory(30);
                setBalanceHistory(history);
            } catch (error) {
                console.error('Error fetching balance history:', error);
                setBalanceHistory([]);
            }
        };

        fetchBalanceHistory();
    }, []);

    const planColor = getPlanColor(currentPlan?.name || '');

    return (
        <div className="card main-balance-card p-4 sm:p-5 lg:p-6 rounded-2xl relative overflow-hidden">
            {/* Sparkline background */}
            {balanceHistory.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-full opacity-10 z-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={balanceHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke="#00d4ff"
                                strokeWidth={2}
                                fill="url(#balanceGradient)"
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="z-10 relative">
                <p className="text-xs sm:text-sm font-semibold text-gray-400 mb-2 sm:mb-3 uppercase tracking-wider">
                    Balance Total de Cartera
                </p>

                {/* Main Balance */}
                <div className="mb-4 sm:mb-6">
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black gradient-text-primary data-metric mb-2">
                        ${formatUSDT(currentBalanceUSDT)}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                        <p className="text-sm sm:text-base text-gray-300">
                            Precio BTC: <span className="font-bold text-white">${formatUSDT(btcPrice)}</span>
                        </p>
                        {btcChange !== 0 && (
                            <div className={`flex items-center gap-1 text-xs font-bold ${btcChange >= 0 ? 'text-profit' : 'text-red-500'}`}>
                                {btcChange >= 0 ? <ChevronsUp className="w-3 h-3" /> : <ChevronsDown className="w-3 h-3" />}
                                <span>{Math.abs(btcChange).toFixed(2)}%</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-700/50">
                    {/* PROFIT Section */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-profit" />
                            <h3 className="text-lg sm:text-xl font-black gradient-text-profit data-metric">
                                +${formatUSDT(profitUSDT)} PROFIT
                            </h3>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                            +{profitPercent.toFixed(2)}% Rendimiento Total
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={onReinvest}
                                className="bg-profit hover:bg-emerald-400 text-black font-bold py-1.5 px-4 rounded-lg transition-all duration-200 text-xs shadow-lg hover:shadow-profit/50"
                            >
                                REINVERTIR
                            </button>
                            <button
                                onClick={onWithdraw}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-4 rounded-lg transition-all duration-200 text-xs shadow-lg hover:shadow-red-500/50"
                            >
                                RETIRAR
                            </button>
                        </div>
                    </div>

                    {/* Plan Section */}
                    <div className="flex-1 flex items-center justify-end">
                        {currentPlan ? (
                            <div className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all ${planColor} bg-opacity-10 border border-gray-700 hover:border-accent w-full sm:w-auto`}>
                                <span>PLAN {currentPlan.name}: {currentPlan.minDailyReturn}% - {currentPlan.maxDailyReturn}% Diario</span>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-xs sm:text-sm font-bold text-gray-400 border border-gray-700 w-full sm:w-auto bg-gray-800/50">
                                <span>Aún no tienes un plan activo</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
