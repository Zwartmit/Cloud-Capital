import { formatUSDT, formatBTC } from '../../utils/formatters';

interface BalanceCardProps {
    capitalUSDT: number;
    currentBalanceUSDT: number;
    btcPrice: number;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
    capitalUSDT,
    currentBalanceUSDT,
    btcPrice,
}) => {
    const profitUSDT = currentBalanceUSDT - capitalUSDT;
    const profitPercent = capitalUSDT > 0 ? (profitUSDT / capitalUSDT) * 100 : 0;
    const totalBTC = currentBalanceUSDT / btcPrice;

    return (
        <div className="card main-balance-card p-6 rounded-xl relative overflow-hidden">
            {/* Sparkline placeholder */}
            <div className="absolute bottom-0 left-0 right-0 h-full opacity-30 z-0">
                <canvas className="sparkline h-full w-full" />
            </div>

            <div className="z-10 relative">
                <p className="text-sm font-medium text-gray-400 mb-3 uppercase">
                    Balance Total de la Cartera (USDT)
                </p>

                <div className="flex items-end justify-between border-b border-gray-700 pb-4 mb-4">
                    <h3 className="text-5xl sm:text-7xl font-black leading-none text-white data-metric">
                        <span className="text-4xl sm:text-5xl mr-1 text-accent font-extrabold">$</span>
                        <span className="text-accent">{formatUSDT(currentBalanceUSDT)}</span>
                        <span className="text-white text-3xl font-extrabold ml-1">USD</span>
                    </h3>

                    <div className="text-right flex flex-col items-end">
                        <span className="text-xs font-semibold text-gray-400">BTC/USD Live:</span>
                        <div className="flex items-center justify-end">
                            <span className="text-lg font-black text-white data-metric">
                                {formatUSDT(btcPrice)}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* PROFIT */}
                    <div>
                        <p className="text-xs font-medium text-gray-400">Ganancia Total</p>
                        <div className="flex items-center space-x-1 mt-1">
                            <h3 className="text-xl font-black text-profit data-metric">
                                + ${formatUSDT(profitUSDT)}
                            </h3>
                        </div>
                        <p className="text-sm text-gray-400">
                            +{profitPercent.toFixed(2)}% Rendimiento
                        </p>
                    </div>

                    {/* BALANCE EN BTC */}
                    <div className="text-right">
                        <p className="text-xs font-medium text-gray-400">Equivalente BTC</p>
                        <div className="flex items-center justify-end space-x-1 mt-1">
                            <span className="font-black text-xl text-white data-metric">
                                {formatBTC(totalBTC)} BTC
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
