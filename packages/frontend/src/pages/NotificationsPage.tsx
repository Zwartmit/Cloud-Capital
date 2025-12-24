import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { NotificationCenter } from '../components/profile/NotificationCenter';
import { userService } from '../services/userService';

export const NotificationsPage: React.FC = () => {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const tasksData = await userService.getUserTasks();
                setTasks(tasksData);
            } catch (error) {
                console.error('Error fetching tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 border-b border-secondary pb-4">
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-accent mb-2">
                            Notificaciones
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base">
                            Historial completo de tus transacciones y solicitudes.
                        </p>
                    </div>

                    {/* Notification Center */}
                    <NotificationCenter tasks={tasks} loading={loading} />
                </div>
            </main>
        </div>
    );
};
