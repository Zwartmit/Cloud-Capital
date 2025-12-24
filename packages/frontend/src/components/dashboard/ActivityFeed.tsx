import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface Activity {
    user: string;
    message: string;
    icon: string;
    color: string;
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

// Generate a single random activity for ticker effect
const generateSingleActivity = (): Activity => {
    const simulatedUsers = [
        'mar***a', 'car***s', 'ana***m', 'lui***p', 'sof***t',
        'die***l', 'lau***f', 'ped***s', 'car***v', 'jor***h',
        'isa***c', 'mig***a', 'ele***d', 'rob***n', 'jul***k',
        'fer***o', 'val***a', 'and***s', 'cam***n', 'ric***o',
        'pat***a', 'dav***d', 'mon***a', 'ser***o', 'cla***a',
        'ale***o', 'bea***z', 'gab***l', 'nat***a', 'est***n',
        'ros***o', 'vic***r', 'dan***a', 'pau***o', 'ire***e',
        'raf***l', 'sil***a', 'emi***o', 'ade***a', 'mat***s'
    ];

    const types = ['DEPOSIT', 'PROFIT', 'REINVEST', 'WITHDRAWAL'];
    const type = types[Math.floor(Math.random() * types.length)];
    const config = getActivityConfig(type);
    const user = simulatedUsers[Math.floor(Math.random() * simulatedUsers.length)];

    // 20% chance of high-value transaction for realism
    const isHighValue = Math.random() < 0.2;

    let amount: number;
    if (type === 'PROFIT') {
        amount = isHighValue
            ? Math.floor(Math.random() * 300) + 200  // $200-$499 (high)
            : Math.floor(Math.random() * 150) + 20;   // $20-$169 (normal)
    } else if (type === 'WITHDRAWAL') {
        amount = isHighValue
            ? Math.floor(Math.random() * 700) + 400  // $400-$1099 (high)
            : Math.floor(Math.random() * 300) + 50;   // $50-$349 (normal)
    } else {
        amount = isHighValue
            ? Math.floor(Math.random() * 1500) + 600  // $600-$2099 (high)
            : Math.floor(Math.random() * 500) + 100;   // $100-$599 (normal)
    }


    return {
        user,
        message: `${config.label} $${amount.toFixed(2)} USD`,
        icon: config.icon,
        color: config.color,
    };
};

// Generate initial batch of simulated activities
const generateSimulatedBatch = (): Activity[] => {
    // Generate 12-15 random activities and shuffle them
    const count = Math.floor(Math.random() * 4) + 12; // 12-15 items
    const activities = Array.from({ length: count }, () => generateSingleActivity());

    // Fisher-Yates shuffle for complete randomization
    for (let i = activities.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activities[i], activities[j]] = [activities[j], activities[i]];
    }

    // Return random 8 items
    return activities.slice(0, 8);
};

export const ActivityFeed: React.FC = () => {
    const [activityList, setActivityList] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    // Initial fetch - use only simulated data for consistency
    const fetchInitialActivity = async () => {
        try {
            // Only use simulated data to avoid repetitive real transactions
            setActivityList(generateSimulatedBatch());
        } catch (err: any) {
            console.error('Error generating activity:', err);
            setActivityList(generateSimulatedBatch());
        } finally {
            setLoading(false);
        }
    };

    // Add a new activity to the top and remove the last one
    const addNewActivity = () => {
        setActivityList(prev => {
            const newActivity = generateSingleActivity();
            const updated = [newActivity, ...prev];
            return updated.slice(0, 8); // Keep only 8 items
        });
    };

    useEffect(() => {
        // Initial fetch
        fetchInitialActivity();

        // Variable interval ticker for more realistic activity
        const scheduleNextUpdate = () => {
            // Random interval between 2-5 seconds
            const randomInterval = Math.floor(Math.random() * 3000) + 2000;
            return setTimeout(() => {
                addNewActivity();
                scheduleNextUpdate();
            }, randomInterval);
        };

        const timeoutId = scheduleNextUpdate();

        // Refresh all data every 60 seconds
        const refreshInterval = setInterval(fetchInitialActivity, 60000);

        return () => {
            clearTimeout(timeoutId);
            clearInterval(refreshInterval);
        };
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
                ) : activityList.length === 0 ? (
                    <p className="text-center text-gray-400 py-4">No hay actividad reciente</p>
                ) : (
                    <ul className="space-y-1.5 sm:space-y-2 overflow-hidden">
                        {activityList.map((activity, index) => (
                            <li
                                key={`${index}-${activity.user}-${activity.message.substring(0, 20)}`}
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
