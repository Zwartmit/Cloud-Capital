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
                // Fallback to empty array if API fails
                setBalanceHistory([]);
            }
        };

        fetchBalanceHistory();
    }, []);

    const planColor = getPlanColor(currentPlan?.name || '');

    return (
        <div className="card main-balance-card p-3 sm:p-4 lg:p-6 rounded-xl relative overflow-hidden">
            {/* Sparkline background */}
            {balanceHistory.length > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-full opacity-20 z-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={balanceHistory} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Area
                                type="monotone"
                                dataKey="balance"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#balanceGradient)"
                                isAnimationActive={false}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            <div className="z-10 relative">
                <p className="text-xs sm:text-sm font-medium text-gray-400 mb-2 sm:mb-3 uppercase">
                    Balance Total de la Cartera (USDT)
                </p>

                <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-gray-700 pb-3 sm:pb-4 mb-3 sm:mb-4 gap-2 sm:gap-0">
                    <h3 className="text-3xl sm:text-5xl lg:text-7xl font-black leading-none text-white data-metric">
                        <span className="text-2xl sm:text-4xl lg:text-5xl mr-1 text-accent font-extrabold">$</span>
                        <span className="text-accent">{formatUSDT(currentBalanceUSDT)}</span>
                        <span className="text-white text-xl sm:text-2xl lg:text-3xl font-extrabold ml-1">USD</span>
                    </h3>

                    <div className="text-left sm:text-right flex flex-col items-start sm:items-end">
                        <span className="text-xs font-semibold text-gray-400">Precio actual BTC/USD:</span>
                        <div className="flex items-center justify-end gap-2">
                            <span className="text-sm sm:text-base lg:text-lg font-black text-white data-metric">
                                $ {formatUSDT(btcPrice)}
                            </span>
                            {btcChange !== 0 && (
                                <div className={`flex items-center text-xs font-bold ${btcChange >= 0 ? 'text-profit' : 'text-red-500'}`}>
                                    {btcChange >= 0 ? <ChevronsUp className="w-3 h-3" /> : <ChevronsDown className="w-3 h-3" />}
                                    <span>{Math.abs(btcChange).toFixed(2)}%</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-3 sm:pt-4 border-t border-gray-700">
                    {/* PROFIT Section */}
                    <div className="flex-1 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-profit" />
                            <h3 className="text-lg sm:text-xl font-black text-profit data-metric">
                                + ${formatUSDT(profitUSDT)} PROFIT
                            </h3>
                        </div>
                        <p className="text-xs text-gray-400 mb-2">
                            +{profitPercent.toFixed(2)}% Rendimiento Total
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={onReinvest}
                                className="bg-profit hover:bg-emerald-400 text-black font-bold py-1 px-3 rounded-lg transition duration-200 text-xs"
                            >
                                REINVERTIR
                            </button>
                            <button
                                onClick={onWithdraw}
                                className="bg-red-600 hover:bg-red-500 text-white font-bold py-1 px-3 rounded-lg transition duration-200 text-xs"
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
