import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';
import { investmentPlanService, InvestmentPlan } from '../services/investmentPlanService';
import { User, Mail, Calendar, TrendingUp, Wallet } from 'lucide-react';
import { TransactionDTO } from '@cloud-capital/shared';
import { PasswordInput } from '../components/common/PasswordInput';

export const ProfilePage: React.FC = () => {
    const { user } = useAuthStore();
    const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
    const [investmentPlan, setInvestmentPlan] = useState<InvestmentPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch transactions
                const transactionsData = await userService.getTransactions();
                setTransactions(transactionsData);

                // Fetch investment plan if user has one assigned
                if (user?.investmentClass) {
                    const plans = await investmentPlanService.getAllPlans();
                    const userPlan = plans.find(plan => plan.name === user.investmentClass);
                    setInvestmentPlan(userPlan || null);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [user?.investmentClass]);

    if (!user) {
        return null;
    }

    const totalProfit = (user.currentBalanceUSDT ?? 0) - (user.capitalUSDT ?? 0);
    const profitPercentage = (user.capitalUSDT ?? 0) > 0
        ? ((totalProfit / (user.capitalUSDT ?? 0)) * 100).toFixed(2)
        : '0.00';



    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 border-b border-secondary pb-4">
                        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2">
                            Mi Perfil
                        </h1>
                        <p className="text-gray-400 text-sm sm:text-base">
                            Información de tu cuenta y estadísticas de inversión.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="card p-4 sm:p-6 rounded-xl border border-secondary">
                                <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center mb-3 sm:mb-4">
                                        <User className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                                    </div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                                        {user.name}
                                    </h2>
                                    <p className="text-xs sm:text-sm text-gray-400 mb-2 sm:mb-3">
                                        @{user.username}
                                    </p>
                                </div>

                                <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center space-x-3 text-xs sm:text-sm">
                                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-300 break-all">{user.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-xs sm:text-sm">
                                        <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                                        <span className="text-gray-300">
                                            Te uniste el {new Date(user.createdAt).toLocaleDateString('es-ES', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Investment Class Badge */}
                                {investmentPlan ? (
                                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-secondary">
                                        <h3 className="text-xs text-gray-500 mb-2">CLASE DE INVERSIÓN</h3>
                                        <div className="text-center py-2 sm:py-3 px-3 sm:px-4 rounded-lg bg-secondary border border-gray-700">
                                            <span className="text-base sm:text-lg font-black text-profit">
                                                {investmentPlan.name}
                                            </span>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {investmentPlan.minDailyReturn}% - {investmentPlan.maxDailyReturn}% diario
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Duplicación: {investmentPlan.doublingTime}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-secondary">
                                        <h3 className="text-xs text-gray-500 mb-2">CLASE DE INVERSIÓN</h3>
                                        <div className="text-center py-2 sm:py-3 px-3 sm:px-4 rounded-lg bg-secondary border border-gray-700">
                                            <p className="text-xs text-gray-500 mt-1">
                                                Aún no tienes un plan activo
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Change Password Section */}
                                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-secondary">
                                    <h3 className="text-xs text-gray-500 mb-3">CAMBIAR CONTRASEÑA</h3>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const form = e.currentTarget;
                                        const formData = new FormData(form);
                                        const currentPassword = formData.get('currentPassword') as string;
                                        const newPassword = formData.get('newPassword') as string;
                                        const confirmPassword = formData.get('confirmPassword') as string;

                                        if (newPassword !== confirmPassword) {
                                            setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
                                            return;
                                        }

                                        if (newPassword.length < 6) {
                                            setPasswordMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
                                            return;
                                        }

                                        try {
                                            await userService.changePassword(currentPassword, newPassword);
                                            setPasswordMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' });
                                            form.reset();
                                            setTimeout(() => setPasswordMessage(null), 5000);
                                        } catch (error: any) {
                                            setPasswordMessage({ type: 'error', text: error.response?.data?.error || 'Error al cambiar la contraseña' });
                                        }
                                    }} className="space-y-3">
                                        <PasswordInput
                                            name="currentPassword"
                                            placeholder="Contraseña actual"
                                            required
                                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-accent focus:border-accent focus:outline-none"
                                        />
                                        <PasswordInput
                                            name="newPassword"
                                            placeholder="Nueva contraseña"
                                            required
                                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-accent focus:border-accent focus:outline-none"
                                        />
                                        <PasswordInput
                                            name="confirmPassword"
                                            placeholder="Confirmar nueva contraseña"
                                            required
                                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-accent focus:border-accent focus:outline-none"
                                        />
                                        <button
                                            type="submit"
                                            className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition duration-200 text-sm"
                                        >
                                            Cambiar contraseña
                                        </button>
                                    </form>
                                    {passwordMessage && (
                                        <div className={`mt-3 p-3 rounded-lg text-sm ${passwordMessage.type === 'success'
                                            ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                                            : 'bg-red-500/10 border border-red-500/20 text-red-500'
                                            }`}>
                                            {passwordMessage.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Stats and Activity */}
                        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                            {/* Account Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                                <div className="card p-3 sm:p-4 rounded-xl border-l-4 border-accent">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs text-gray-500">CAPITAL INICIAL</h4>
                                        <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-accent" />
                                    </div>
                                    <p className="text-xl sm:text-2xl font-bold text-white">
                                        ${(user.capitalUSDT ?? 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">USDT</p>
                                </div>

                                <div className="card p-3 sm:p-4 rounded-xl border-l-4 border-profit">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs text-gray-500">BALANCE ACTUAL</h4>
                                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-profit" />
                                    </div>
                                    <p className="text-xl sm:text-2xl font-bold text-white">
                                        ${(user.currentBalanceUSDT ?? 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">USDT</p>
                                </div>

                                <div className="card p-3 sm:p-4 rounded-xl border-l-4 border-yellow-400">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs text-gray-500">GANANCIA TOTAL</h4>
                                        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                                    </div>
                                    <p className="text-xl sm:text-2xl font-bold text-profit">
                                        ${totalProfit.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        +{profitPercentage}%
                                    </p>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="card p-4 sm:p-6 rounded-xl border border-secondary">
                                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
                                    Transacciones recientes
                                </h3>

                                {loading ? (
                                    <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-400">
                                        Cargando transacciones...
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <div className="text-center py-6 sm:py-8 text-sm sm:text-base text-gray-400">
                                        No hay transacciones registradas
                                    </div>
                                ) : (
                                    <div className="space-y-2 sm:space-y-3">
                                        {transactions.slice(0, 5).map((transaction) => {
                                            const typeColors = {
                                                DEPOSIT: 'text-accent',
                                                WITHDRAWAL: 'text-red-400',
                                                PROFIT: 'text-profit',
                                                REINVEST: 'text-yellow-400',
                                            };

                                            const typeLabels = {
                                                DEPOSIT: 'Depósito',
                                                WITHDRAWAL: 'Retiro',
                                                PROFIT: 'Ganancia',
                                                REINVEST: 'Reinversión',
                                            };

                                            return (
                                                <div
                                                    key={transaction.id}
                                                    className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-secondary border border-gray-700 hover:border-gray-600 transition"
                                                >
                                                    <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${typeColors[transaction.type as keyof typeof typeColors] || 'bg-gray-400'}`} />
                                                        <div className="min-w-0 flex-1">
                                                            <p className="text-xs sm:text-sm font-semibold text-white truncate">
                                                                {typeLabels[transaction.type as keyof typeof typeLabels] || transaction.type}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(transaction.createdAt).toLocaleDateString('es-ES')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 ml-2">
                                                        <p className={`text-xs sm:text-sm font-bold ${typeColors[transaction.type as keyof typeof typeColors] || 'text-white'}`}>
                                                            {transaction.type === 'WITHDRAWAL' ? '-' : '+'}
                                                            ${transaction.amountUSDT.toLocaleString()}
                                                        </p>
                                                        {transaction.amountBTC && (
                                                            <p className="text-xs text-gray-500">
                                                                {transaction.amountBTC} BTC
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};
