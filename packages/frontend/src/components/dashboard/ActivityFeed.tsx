import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';
import { apiClient } from '../../services/api';

interface Transaction {
    id: string;
    type: string;
    amountUSDT: number;
    createdAt: string;
    user: {
        username: string;
    };
}

interface Activity {
    user: string;
    message: string;
    icon: string;
    color: string;
}

const getActivityConfig = (type: string) => {
    const configs: Record<string, { icon: string; color: string; label: string }> = {
        DEPOSIT: { icon: 'download', color: 'text-amber-600', label: 'Depósito' },
        REINVEST: { icon: 'repeat-2', color: 'text-profit', label: 'Reinversión' },
        WITHDRAWAL: { icon: 'log-out', color: 'text-red-500', label: 'Retiro' },
        PROFIT: { icon: 'trending-up', color: 'text-accent', label: 'Pago de Rendimiento' },
        REFERRAL_COMMISSION: { icon: 'users', color: 'text-purple-500', label: 'Comisión por Referido' },
    };
    return configs[type] || { icon: 'circle', color: 'text-gray-500', label: type };
};

const maskUsername = (username: string): string => {
    if (username.length <= 4) {
        return username.substring(0, 1) + '***' + username.slice(-1);
    }
    return username.substring(0, 3) + '***' + username.slice(-1);
};

const formatTransaction = (transaction: Transaction): Activity => {
    const config = getActivityConfig(transaction.type);
    const maskedUser = maskUsername(transaction.user.username);
    const amount = transaction.amountUSDT.toFixed(2);

    return {
        user: maskedUser,
        message: `${config.label} $${amount} USD`,
        icon: config.icon,
        color: config.color,
    };
};

export const ActivityFeed: React.FC = () => {
    const [activityList, setActivityList] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchRecentActivity = async () => {
        try {
            const response = await apiClient.get('/user/recent-activity?limit=10');
            const transactions: Transaction[] = response.data;
            const activities = transactions.map(formatTransaction);
            setActivityList(activities);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching recent activity:', err);
            setError('No se pudo cargar la actividad reciente');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch
        fetchRecentActivity();

        // Poll every 5 seconds for updates
        const interval = setInterval(fetchRecentActivity, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card p-3 sm:p-4 rounded-xl shadow-lg border-l-4 border-profit">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-base sm:text-lg text-profit">Movimiento global</h4>
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-profit animate-pulse" />
            </div>

            <div className="text-xs text-white">
                {loading && activityList.length === 0 ? (
                    <p className="text-center text-gray-400 py-4">Cargando actividad...</p>
                ) : error && activityList.length === 0 ? (
                    <p className="text-center text-red-400 py-4">{error}</p>
                ) : activityList.length === 0 ? (
                    <p className="text-center text-gray-400 py-4">No hay actividad reciente</p>
                ) : (
                    <ul className="space-y-1.5 sm:space-y-2">
                        {activityList.map((activity, index) => (
                            <li
                                key={index}
                                className="flex items-center space-x-2 p-1 border-b border-gray-700 last:border-b-0"
                            >
                                <span className={`font-semibold ${activity.color}`}>●</span>
                                <span className="truncate">
                                    <span className="font-semibold">{activity.user}</span>: {activity.message}
                                </span>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};
