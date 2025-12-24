import { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import { adminService } from '../services/adminService';
import { useAuthStore } from '../store/authStore';

export const useNotificationCount = () => {
    const { user } = useAuthStore();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (!user) return;

        const fetchCount = async () => {
            try {
                const tasks = await userService.getUserTasks();
                // Count tasks that are PENDING or PRE_APPROVED (not completed/rejected)
                const count = tasks.filter((task: any) =>
                    task.status === 'PENDING' || task.status === 'PRE_APPROVED'
                ).length;
                setPendingCount(count);
            } catch (error) {
                console.error('Error fetching notification count:', error);
            }
        };

        fetchCount();

        // Refresh every 5 seconds for real-time updates
        const interval = setInterval(fetchCount, 5000);
        return () => clearInterval(interval);
    }, [user]);

    return pendingCount;
};

export const useTaskCount = () => {
    const { user } = useAuthStore();
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        if (!user || (user.role !== 'SUPERADMIN' && user.role !== 'SUBADMIN')) return;

        const fetchCount = async () => {
            try {
                const tasks = await adminService.getAllTasks();
                // Count tasks that are PENDING or PRE_APPROVED
                const count = tasks.filter((task: any) =>
                    task.status === 'PENDING' || task.status === 'PRE_APPROVED'
                ).length;
                setPendingCount(count);
            } catch (error) {
                console.error('Error fetching task count:', error);
            }
        };

        fetchCount();

        // Refresh every 5 seconds for real-time updates
        const interval = setInterval(fetchCount, 5000);
        return () => clearInterval(interval);
    }, [user]);

    return pendingCount;
};
