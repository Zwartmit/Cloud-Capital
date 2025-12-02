import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { BalanceCard } from '../components/dashboard/BalanceCard';
import { StatsCards } from '../components/dashboard/StatsCards';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { TransactionTable } from '../components/dashboard/TransactionTable';
import { Modal } from '../components/common/Modal';
import { useAuthStore } from '../store/authStore';
import { getUserClass } from '../utils/investmentClasses';
import { userService } from '../services/userService';
import { TransactionDTO } from '@cloud-capital/shared';

export const DashboardPage: React.FC = () => {
    const { user } = useAuthStore();
    const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
    const [isReinvestModalOpen, setIsReinvestModalOpen] = useState(false);
    const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
    const [loading, setLoading] = useState(true);

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
    const btcPrice = 108025.3; // TODO: Fetch from API
    const capitalUSDT = user?.capitalUSDT || 0;
    const currentBalanceUSDT = user?.currentBalanceUSDT || 0;
    const profitUSDT = currentBalanceUSDT - capitalUSDT;
    const weeklyRate = 7.5; // TODO: Calculate from actual data

    const userClass = getUserClass(currentBalanceUSDT);

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-secondary pb-4">
                        <h2 className="text-3xl font-extrabold text-white flex items-center mb-3 sm:mb-0">
                            Resumen Global.
                            <span className="text-xl ml-4 text-gray-400 font-medium">
                                Hola, {user?.name || 'Usuario'}.
                            </span>
                        </h2>

                        <button
                            onClick={() => { }}
                            className={`flex items-center space-x-2 py-2 px-4 rounded-lg text-sm font-bold transition-all ${userClass.color} border border-gray-700 hover:border-accent`}
                        >
                            <span>CLASE {userClass.name}: {userClass.dailyProfit}</span>
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Main Content */}
                        <section className="flex-grow lg:w-3/5 space-y-6">
                            {/* Balance Card */}
                            <BalanceCard
                                capitalUSDT={capitalUSDT}
                                currentBalanceUSDT={currentBalanceUSDT}
                                btcPrice={btcPrice}
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
                        <aside className="lg:w-2/5 lg:max-w-xs space-y-6">
                            <ActivityFeed />

                            {/* Progress Card */}
                            <div className="card p-4 rounded-xl border-l-4 border-gray-400">
                                <h4 className="font-bold text-lg mb-4 text-gray-400">
                                    Progreso a Nivel <span className="text-sky-300">PLATINUM</span>
                                </h4>
                                <p className="text-xs text-gray-500 mb-4">
                                    Meta para un rendimiento de **2.0% diario**.
                                </p>
                                <div className="text-sm space-y-3">
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-gray-400">Cartera Mínima ($2,500 USD)</span>
                                            <span className="text-profit font-bold">
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
