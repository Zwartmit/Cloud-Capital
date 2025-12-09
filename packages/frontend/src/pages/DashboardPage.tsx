import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { StatsCards } from '../components/dashboard/StatsCards';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { TransactionTable } from '../components/dashboard/TransactionTable';
import { DepositModal } from '../components/modals/DepositModal';
import { WithdrawalModal } from '../components/modals/WithdrawalModal';
import { ReinvestModal } from '../components/modals/ReinvestModal';
import { ProjectionsModal } from '../components/modals/ProjectionsModal';
import { useAuthStore } from '../store/authStore';
import { getPlanColor } from '../utils/planStyles';
import { userService } from '../services/userService';
import { investmentPlanService, InvestmentPlan } from '../services/investmentPlanService';
import { cryptoService } from '../services/cryptoService';
import { TransactionDTO } from '@cloud-capital/shared';

export const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isReinvestModalOpen, setIsReinvestModalOpen] = useState(false);
    const [isProjectionsModalOpen, setIsProjectionsModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [btcPrice, setBtcPrice] = useState<number>(96500); // Default fallback price
    const [currentPlan, setCurrentPlan] = useState<InvestmentPlan | null>(null);

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


    // Get user's actual investment class from database
    const userInvestmentClass = user?.investmentClass;
    const hasInvestmentPlan = userInvestmentClass && userInvestmentClass !== null;

    const [nextPlan, setNextPlan] = useState<InvestmentPlan | null>(null);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const plans = await investmentPlanService.getAllPlans();
                // Sort plans by minCapital to ensure correct order
                const sortedPlans = plans.sort((a, b) => a.minCapital - b.minCapital);


                if (hasInvestmentPlan && userInvestmentClass) {
                    const plan = sortedPlans.find(p => p.name === userInvestmentClass);
                    if (plan) {
                        setCurrentPlan(plan);
                        // Find next plan
                        const currentIndex = sortedPlans.indexOf(plan);
                        if (currentIndex < sortedPlans.length - 1) {
                            setNextPlan(sortedPlans[currentIndex + 1]);
                        } else {
                            setNextPlan(null); // Max level reached
                        }
                    } else {
                        // If user has a class name but it's not in the list (edge case), default to first plan as next?
                        // Or maybe they are below the first plan?
                        // For now, let's assume if they have a class, it matches a plan.
                        // If they don't have a plan, the next plan is the first one (BRONZE usually)
                        setNextPlan(sortedPlans[0]);
                    }
                } else {
                    // No active plan, next target is the first plan
                    setNextPlan(sortedPlans[0]);
                }
            } catch (error) {
                console.error('Error fetching plans:', error);
            }
        };
        fetchPlans();
    }, [hasInvestmentPlan, userInvestmentClass]);

    // Calculate dynamic weekly rate
    const weeklyRate = currentPlan ? currentPlan.dailyAverage * 7 : 0;



    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-3 sm:p-4 lg:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 border-b border-secondary pb-3 sm:pb-4">
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-white flex flex-col sm:flex-row sm:items-center mb-2 sm:mb-0">
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
                                currentPlan={currentPlan}
                                onReinvest={() => setIsReinvestModalOpen(true)}
                                onWithdraw={() => setIsWithdrawModalOpen(true)}
                            />

                            {/* Stats Cards */}
                            <StatsCards
                                capitalUSDT={capitalUSDT}
                                weeklyRate={weeklyRate}
                                onDeposit={() => setIsDepositModalOpen(true)}
                                onProjections={() => setIsProjectionsModalOpen(true)}
                            />
                        </section>

                        {/* Sidebar */}
                        <aside className="lg:w-2/5 lg:max-w-xs space-y-4 sm:space-y-6">
                            <ActivityFeed />

                            {/* Progress Card */}
                            {nextPlan ? (
                                <div className="card p-3 sm:p-4 rounded-xl border-l-4 border-gray-400">
                                    <h4 className="font-bold text-sm sm:text-base lg:text-lg mb-2 sm:mb-4 text-gray-400">
                                        Progreso a Nivel <span className={`${getPlanColor(nextPlan.name)}`}>{nextPlan.name}</span>
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-2 sm:mb-4">
                                        Meta para un rendimiento de **{nextPlan.minDailyReturn}% - {nextPlan.maxDailyReturn}% diario**.
                                    </p>
                                    <div className="text-xs sm:text-sm space-y-2 sm:space-y-3">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-gray-400 text-xs sm:text-sm">Cartera Mínima (${nextPlan.minCapital.toLocaleString()} USD)</span>
                                                <span className="text-profit font-bold text-xs sm:text-sm">
                                                    {currentBalanceUSDT >= nextPlan.minCapital ? 'COMPLETADO' : `${((currentBalanceUSDT / nextPlan.minCapital) * 100).toFixed(1)}%`}
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full ${currentBalanceUSDT >= nextPlan.minCapital ? 'bg-profit' : 'bg-red-500'}`}
                                                    style={{ width: `${Math.min(100, (currentBalanceUSDT / nextPlan.minCapital) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="card p-3 sm:p-4 rounded-xl border-l-4 border-accent">
                                    <h4 className="font-bold text-sm sm:text-base lg:text-lg mb-2 text-accent">
                                        ¡Nivel Máximo Alcanzado!
                                    </h4>
                                    <p className="text-xs text-gray-400">
                                        Has alcanzado el plan de inversión más alto. Disfruta de los máximos beneficios.
                                    </p>
                                </div>
                            )}
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
            <DepositModal
                isOpen={isDepositModalOpen}
                onClose={() => setIsDepositModalOpen(false)}
                userDepositAddress={user?.btcDepositAddress}
                onSuccess={async () => {
                    const data = await userService.getTransactions();
                    setTransactions(data);
                }}
            />

            <WithdrawalModal
                isOpen={isWithdrawModalOpen}
                onClose={() => setIsWithdrawModalOpen(false)}
                availableProfit={profitUSDT}
                btcPrice={btcPrice}
                onSuccess={async () => {
                    const data = await userService.getTransactions();
                    setTransactions(data);
                }}
            />

            <ReinvestModal
                isOpen={isReinvestModalOpen}
                onClose={() => setIsReinvestModalOpen(false)}
                availableProfit={profitUSDT}
                currentCapital={capitalUSDT}
                onSuccess={async () => {
                    const data = await userService.getTransactions();
                    setTransactions(data);
                }}
            />

            <ProjectionsModal
                isOpen={isProjectionsModalOpen}
                onClose={() => setIsProjectionsModalOpen(false)}
            />
        </div>
    );
};
