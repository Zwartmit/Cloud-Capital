import { formatUSDT, formatBTC } from '../../utils/formatters';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { Bitcoin, ChevronsUp, ChevronsDown } from 'lucide-react';
import { InvestmentClassData } from '../../utils/investmentClasses';

interface BalanceCardProps {
    capitalUSDT: number;
    currentBalanceUSDT: number;
    btcPrice: number;
    userClassData: InvestmentClassData | null;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
    capitalUSDT,
    currentBalanceUSDT,
    btcPrice,
    userClassData,
}) => {
    const profitUSDT = currentBalanceUSDT - capitalUSDT;
    const profitPercent = capitalUSDT > 0 ? (profitUSDT / capitalUSDT) * 100 : 0;
    const totalBTC = currentBalanceUSDT / btcPrice;

    const [balanceHistory, setBalanceHistory] = useState<{ date: string; balance: number }[]>([]);

    // Calculate trend from balance history (comparing last day vs 7 days ago)
    const hasTrendData = balanceHistory.length > 7;
    const trend = hasTrendData
        ? balanceHistory[balanceHistory.length - 1].balance - balanceHistory[balanceHistory.length - 8].balance
        : 0;
    const isPositiveTrend = trend >= 0;

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
                        <div className="flex items-center justify-end">
                            <span className="text-sm sm:text-base lg:text-lg font-black text-white data-metric">
                                $ {formatUSDT(btcPrice)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                    {/* PROFIT */}
                    <div>
                        <p className="text-xs font-medium text-gray-400">Ganancia total</p>
                        <div className="flex items-center space-x-1 mt-1">
                            <h3 className="text-lg sm:text-xl font-black text-profit data-metric">
                                + ${formatUSDT(profitUSDT)}
                            </h3>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-400">
                            +{profitPercent.toFixed(2)}% Rendimiento
                        </p>
                    </div>

                    {/* BALANCE EN BTC */}
                    <div className="text-left sm:text-right">
                        <p className="text-xs font-medium text-gray-400">Equivalente del balance en BTC:</p>
                        <div className="flex items-center sm:justify-end space-x-1 mt-1">
                            <Bitcoin className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
                            <span className="font-black text-base sm:text-lg lg:text-xl text-white data-metric">
                                {formatBTC(totalBTC)} BTC
                            </span>
                            {hasTrendData && (
                                isPositiveTrend ? (
                                    <ChevronsUp className="w-4 h-4 text-profit" />
                                ) : (
                                    <ChevronsDown className="w-4 h-4 text-red-500" />
                                )
                            )}
                        </div>
                    </div>
                </div>

                {/* Investment Plan Info */}
                <div className="pt-3 sm:pt-4 border-t border-gray-700">
                    {userClassData ? (
                        <div className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-xs sm:text-sm font-bold transition-all ${userClassData.color} bg-opacity-10 border border-gray-700 hover:border-accent w-full`}>
                            <span>PLAN {userClassData.name}: {userClassData.dailyProfit}</span>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center space-x-2 py-2 px-4 rounded-lg text-xs sm:text-sm font-bold text-gray-400 border border-gray-700 w-full bg-gray-800/50">
                            <span>Sin plan activo - Realiza tu primer depósito</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
