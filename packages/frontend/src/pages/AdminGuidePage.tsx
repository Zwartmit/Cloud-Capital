import { Sidebar } from '../components/layout/Sidebar';
import { AdminGuide } from '../components/admin/AdminGuide';
import { Book } from 'lucide-react';

export const AdminGuidePage: React.FC = () => {
    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 border-b border-secondary pb-4">
                        <h1 className="text-2xl sm:text-4xl font-black text-white mb-2 flex items-center">
                            <Book className="w-8 h-8 mr-3" />
                            Guía de administración
                        </h1>
                    </div>

                    {/* Admin Guide */}
                    <AdminGuide />
                </div>
            </main>
        </div>
    );
};
