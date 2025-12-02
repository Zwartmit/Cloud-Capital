import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';
import { getUserClass } from '../utils/investmentClasses';
import { User, Mail, Shield, Calendar, TrendingUp, Wallet } from 'lucide-react';
import { TransactionDTO } from '@cloud-capital/shared';

export const ProfilePage: React.FC = () => {
    const { user } = useAuthStore();
    const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
    const [loading, setLoading] = useState(true);

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

    if (!user) {
        return null;
    }

    const userClass = getUserClass(user.currentBalanceUSDT);
    const totalProfit = user.currentBalanceUSDT - user.capitalUSDT;
    const profitPercentage = user.capitalUSDT > 0
        ? ((totalProfit / user.capitalUSDT) * 100).toFixed(2)
        : '0.00';

    const roleColors = {
        USER: 'text-profit',
        SUBADMIN: 'text-admin',
        SUPERADMIN: 'text-pink-400',
    };

    const roleLabels = {
        USER: 'Usuario',
        SUBADMIN: 'Sub Administrador',
        SUPERADMIN: 'Super Administrador',
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 border-b border-secondary pb-4">
                        <h1 className="text-4xl font-black text-white mb-2">
                            Mi Perfil
                        </h1>
                        <p className="text-gray-400">
                            Información de tu cuenta y estadísticas de inversión.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Profile Card */}
                        <div className="lg:col-span-1">
                            <div className="card p-6 rounded-xl border border-secondary">
                                <div className="flex flex-col items-center text-center mb-6">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center mb-4">
                                        <User className="w-12 h-12 text-white" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white mb-1">
                                        {user.name}
                                    </h2>
                                    <p className="text-sm text-gray-400 mb-3">
                                        @{user.username}
                                    </p>
                                    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-secondary border ${user.role === 'SUPERADMIN' ? 'border-pink-400' :
                                            user.role === 'SUBADMIN' ? 'border-admin' :
                                                'border-profit'
                                        }`}>
                                        <Shield className={`w-4 h-4 ${roleColors[user.role]}`} />
                                        <span className={`text-xs font-bold ${roleColors[user.role]}`}>
                                            {roleLabels[user.role]}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Mail className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-300">{user.email}</span>
                                    </div>
                                    <div className="flex items-center space-x-3 text-sm">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <span className="text-gray-300">
                                            Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', {
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>
                                </div>

                                {/* Investment Class Badge */}
                                <div className="mt-6 pt-6 border-t border-secondary">
                                    <h3 className="text-xs text-gray-500 mb-2">CLASE DE INVERSIÓN</h3>
                                    <div className={`text-center py-3 px-4 rounded-lg bg-secondary border border-gray-700`}>
                                        <span className={`text-lg font-black ${userClass.color}`}>
                                            {userClass.name}
                                        </span>
                                        <p className="text-xs text-gray-400 mt-1">
                                            {userClass.dailyProfit}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats and Activity */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Account Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="card p-4 rounded-xl border-l-4 border-accent">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs text-gray-500">CAPITAL INICIAL</h4>
                                        <Wallet className="w-5 h-5 text-accent" />
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        ${user.capitalUSDT.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">USDT</p>
                                </div>

                                <div className="card p-4 rounded-xl border-l-4 border-profit">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs text-gray-500">BALANCE ACTUAL</h4>
                                        <TrendingUp className="w-5 h-5 text-profit" />
                                    </div>
                                    <p className="text-2xl font-bold text-white">
                                        ${user.currentBalanceUSDT.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">USDT</p>
                                </div>

                                <div className="card p-4 rounded-xl border-l-4 border-yellow-400">
                                    <div className="flex items-center justify-between mb-2">
                                        <h4 className="text-xs text-gray-500">GANANCIA TOTAL</h4>
                                        <TrendingUp className="w-5 h-5 text-yellow-400" />
                                    </div>
                                    <p className="text-2xl font-bold text-profit">
                                        ${totalProfit.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        +{profitPercentage}%
                                    </p>
                                </div>
                            </div>

                            {/* Recent Transactions */}
                            <div className="card p-6 rounded-xl border border-secondary">
                                <h3 className="text-xl font-bold text-white mb-4">
                                    Transacciones Recientes
                                </h3>

                                {loading ? (
                                    <div className="text-center py-8 text-gray-400">
                                        Cargando transacciones...
                                    </div>
                                ) : transactions.length === 0 ? (
                                    <div className="text-center py-8 text-gray-400">
                                        No hay transacciones registradas
                                    </div>
                                ) : (
                                    <div className="space-y-3">
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
                                                    className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-gray-700 hover:border-gray-600 transition"
                                                >
                                                    <div className="flex items-center space-x-3">
                                                        <div className={`w-2 h-2 rounded-full ${typeColors[transaction.type as keyof typeof typeColors] || 'bg-gray-400'}`} />
                                                        <div>
                                                            <p className="text-sm font-semibold text-white">
                                                                {typeLabels[transaction.type as keyof typeof typeLabels] || transaction.type}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {new Date(transaction.createdAt).toLocaleDateString('es-ES')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className={`text-sm font-bold ${typeColors[transaction.type as keyof typeof typeColors] || 'text-white'}`}>
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
