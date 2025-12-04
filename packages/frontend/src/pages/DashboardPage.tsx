import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { StatsCards } from '../components/dashboard/StatsCards';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { TransactionTable } from '../components/dashboard/TransactionTable';
import { Modal } from '../components/common/Modal';
import { useAuthStore } from '../store/authStore';
import { investmentClasses, InvestmentClass } from '../utils/investmentClasses';
import { userService } from '../services/userService';
import { cryptoService } from '../services/cryptoService';
import { TransactionDTO } from '@cloud-capital/shared';

export const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isReinvestModalOpen, setIsReinvestModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [btcPrice, setBtcPrice] = useState<number>(96500); // Default fallback price

    // Fetch BTC price from CoinGecko
    useEffect(() => {
        const fetchBTCPrice = async () => {
            try {
                const price = await cryptoService.getBitcoinPrice();
                setBtcPrice(price);
            } catch (error) {
                console.error('Error fetching BTC price:', error);
            }
        };

        // Fetch immediately
        fetchBTCPrice();

        // Update every 2 minutes
        const interval = setInterval(fetchBTCPrice, 120000);

        return () => clearInterval(interval);
    }, []);

    // Fetch transactions from backend
    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const data = await userService.getTransactions();
                setTransactions(data);
            } catch (error) {
                console.error('Error fetching transactions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTransactions();
    }, []);

    // Use real user data from backend
    const capitalUSDT = user?.capitalUSDT || 0;
    const currentBalanceUSDT = user?.currentBalanceUSDT || 0;
    const profitUSDT = currentBalanceUSDT - capitalUSDT;
    const weeklyRate = 7.5; // TODO: Calculate from actual data

    // Get user's actual investment class from database
    const userInvestmentClass = user?.investmentClass;
    const hasInvestmentPlan = userInvestmentClass && userInvestmentClass !== null;
    const userClassData = hasInvestmentPlan
        ? investmentClasses[userInvestmentClass as InvestmentClass]
        : null;

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-3 sm:p-4 lg:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 border-b border-secondary pb-3 sm:pb-4">
                        <h2 className="text-2xl sm:text-3xl lg:text-3xl font-extrabold text-white flex flex-col sm:flex-row sm:items-center mb-2 sm:mb-0">
                            Resumen general
                        </h2>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
                        {/* Main Content */}
                        <section className="flex-grow lg:w-3/5 space-y-4 sm:space-y-6">
                            {/* Balance Card */}
                            <BalanceCard
                                capitalUSDT={capitalUSDT}
                                currentBalanceUSDT={currentBalanceUSDT}
                                btcPrice={btcPrice}
                                userClassData={userClassData}
                            />

                            {/* Stats Cards */}
                            <StatsCards
                                capitalUSDT={capitalUSDT}
                                profitUSDT={profitUSDT}
                                weeklyRate={weeklyRate}
                                onDeposit={() => setIsDepositModalOpen(true)}
                                onReinvest={() => setIsReinvestModalOpen(true)}
                                onWithdraw={() => setIsWithdrawModalOpen(true)}
                            />
                        </section>

                        {/* Sidebar */}
                        <aside className="lg:w-2/5 lg:max-w-xs space-y-4 sm:space-y-6">
                            <ActivityFeed />

                            {/* Progress Card */}
                            <div className="card p-3 sm:p-4 rounded-xl border-l-4 border-gray-400">
                                <h4 className="font-bold text-sm sm:text-base lg:text-lg mb-2 sm:mb-4 text-gray-400">
                                    Progreso a Nivel <span className="text-sky-300">PLATINUM</span>
                                </h4>
                                <p className="text-xs text-gray-500 mb-2 sm:mb-4">
                                    Meta para un rendimiento de **2.0% diario**.
                                </p>
                                <div className="text-xs sm:text-sm space-y-2 sm:space-y-3">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-400 text-xs sm:text-sm">Cartera Mínima ($2,500 USD)</span>
                                            <span className="text-profit font-bold text-xs sm:text-sm">
                                                {currentBalanceUSDT >= 2500 ? 'COMPLETADO' : `${((currentBalanceUSDT / 2500) * 100).toFixed(1)}%`}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                                            <div
                                                className={`h-1.5 rounded-full ${currentBalanceUSDT >= 2500 ? 'bg-profit' : 'bg-red-500'}`}
                                                style={{ width: `${Math.min(100, (currentBalanceUSDT / 2500) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>

                    {/* Transaction Table */}
                    {loading ? (
                        <div className="text-center py-8 text-gray-400">
                            Cargando transacciones...
                        </div>
                    ) : (
                        <TransactionTable transactions={transactions} />
                    )}
                </div>
            </main>

            {/* Modals */}
            <Modal
                isOpen={isDepositModalOpen}
                onClose={() => setIsDepositModalOpen(false)}
                title="Depositar Fondos"
            >
                <p className="text-gray-400">Modal de depósito - implementación pendiente</p>
            </Modal>

            <Modal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                title="Retirar Ganancias"
            >
                <p className="text-gray-400">Modal de retiro - implementación pendiente</p>
            </Modal>

            <Modal
                isOpen={isReinvestModalOpen}
                onClose={() => setIsReinvestModalOpen(false)}
                title="Reinvertir Ganancias"
            >
                <p className="text-gray-400">Modal de reinversión - implementación pendiente</p>
            </Modal>
        </div>
    );
};
