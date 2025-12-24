import React from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { TaskManager } from '../components/admin/TaskManager';

export const TaskManagerPage: React.FC = () => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="border-b border-gray-700 pb-4 mb-6">
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-admin">
                            Centro de tareas
                        </h2>
                    </div>
                    <TaskManager />
                </div>
            </main>
        </div>
    );
};
