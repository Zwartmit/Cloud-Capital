import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface Activity {
    user: string;
    message: string;
    icon: string;
    color: string;
}

const activities = [
    { type: 'Depósito', icon: 'download', color: 'text-amber-600', range: [50, 1234] },
    { type: 'Reinversión', icon: 'repeat-2', color: 'text-profit', range: [100, 800] },
    { type: 'Retiro', icon: 'log-out', color: 'text-red-500', range: [200, 500] },
    { type: 'Pago de Rendimiento', icon: 'trending-up', color: 'text-accent', range: [1, 50] },
];

const users = [
    'User_01',
    'Cloud_Trader',
    'Cloud_Zeky',
    'BtcGuru',
    'Inver_Pro',
    'Fidelis88',
    'Oro_King',
    'CC_TraderX',
];

const generateActivity = (): Activity => {
    const user = users[Math.floor(Math.random() * users.length)];
    const activity = activities[Math.floor(Math.random() * activities.length)];
    const amount = (
        Math.random() * (activity.range[1] - activity.range[0]) +
        activity.range[0]
    ).toFixed(2);

    return {
        user: user.substring(0, 3) + '***' + user.slice(-1),
        message: `${activity.type} $${amount} USD`,
        icon: activity.icon,
        color: activity.color,
    };
};

export const ActivityFeed: React.FC = () => {
    const [activityList, setActivityList] = useState<Activity[]>([]);

    useEffect(() => {
        // Initialize with 5 activities
        const initial = Array.from({ length: 5 }, generateActivity);
        setActivityList(initial);

        // Update every 1.7 seconds
        const interval = setInterval(() => {
            setActivityList((prev) => {
                const newActivity = generateActivity();
                const updated = [newActivity, ...prev];
                return updated.slice(0, 8); // Keep only 8 items
            });
        }, 1700);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="card p-3 sm:p-4 rounded-xl shadow-lg border-l-4 border-profit">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-base sm:text-lg text-profit">Movimiento Global Live</h4>
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-profit animate-pulse" />
            </div>

            <div className="text-xs text-white">
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
            </div>
        </div>
    );
};
