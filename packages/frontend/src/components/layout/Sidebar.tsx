import { useState } from 'react';
import { LayoutDashboard, Layers3, User, LogOut, ShieldHalf } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Modal } from '../common/Modal';

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

    const isActive = (path: string) => location.pathname === path;

    const handleLogoutClick = () => {
        setIsLogoutModalOpen(true);
    };

    const confirmLogout = () => {
        logout();
        navigate('/login');
        setIsLogoutModalOpen(false);
    };

    const isAdmin = user?.role === 'SUBADMIN' || user?.role === 'SUPERADMIN';

    return (
        <aside className="bg-black w-16 sm:w-20 p-3 sm:p-4 flex flex-col items-center border-r border-gray-700/50 transition-all duration-300 sticky top-0 h-screen">
            {/* Logo */}
            <div className="mb-6 sm:mb-8 mt-2">
                <img src="/logo.png" alt="Cloud Capital" className="w-8 sm:w-12 h-auto object-contain" />
            </div>

            <div className="space-y-4 flex flex-col flex-grow">
                {/* Dashboard - Only for Users */}
                {!isAdmin && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`nav-link p-3 rounded-xl transition-all duration-300 group relative ${isActive('/dashboard')
                            ? 'bg-gradient-to-br from-accent to-accent/80 text-white shadow-lg shadow-accent/30'
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                            }`}
                        title="Dashboard"
                    >
                        <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
                    </button>
                )}

                {/* Investment Classes - Only for Users */}
                {!isAdmin && (
                    <button
                        onClick={() => navigate('/classes')}
                        className={`nav-link p-3 rounded-xl transition-all duration-300 group relative ${isActive('/classes')
                            ? 'bg-gradient-to-br from-accent to-accent/80 text-white shadow-lg shadow-accent/30'
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                            }`}
                        title="Planes de Inversión"
                    >
                        <Layers3 className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
                    </button>
                )}

                {/* Profile - Only for Users */}
                {!isAdmin && (
                    <button
                        onClick={() => navigate('/profile')}
                        className={`nav-link p-3 rounded-xl transition-all duration-300 group relative ${isActive('/profile')
                            ? 'bg-gradient-to-br from-accent to-accent/80 text-white shadow-lg shadow-accent/30'
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-white'
                            }`}
                        title="Perfil"
                    >
                        <User className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
                    </button>
                )}

                {/* Admin Panel (only for admins) */}
                {isAdmin && (
                    <button
                        onClick={() => navigate('/admin')}
                        className={`nav-link p-3 rounded-xl transition-all duration-300 group relative ${isActive('/admin')
                            ? 'bg-gradient-to-br from-admin to-admin/80 text-black shadow-lg shadow-admin/30'
                            : 'text-gray-400 hover:bg-gray-700/50 hover:text-admin'
                            }`}
                        title="Panel Admin"
                    >
                        <ShieldHalf className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
                    </button>
                )}
            </div>

            {/* Logout */}
            <button
                onClick={handleLogoutClick}
                className="nav-link p-3 rounded-xl transition-all duration-300 mt-auto bg-gradient-to-br from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg hover:shadow-red-500/50 hover:scale-105"
                title="Cerrar Sesión"
            >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6 mx-auto" />
            </button>

            <Modal
                isOpen={isLogoutModalOpen}
                onClose={() => setIsLogoutModalOpen(false)}
                title="¿Deseas cerrar sesión?"
                maxWidth="sm"
            >
                <div className="text-center">
                    <div className="flex justify-center space-x-4">
                        <button
                            onClick={() => setIsLogoutModalOpen(false)}
                            className="px-6 py-2.5 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition-all duration-200 font-medium shadow-lg hover:scale-105"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmLogout}
                            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 transition-all duration-200 font-medium shadow-lg hover:shadow-red-500/50 hover:scale-105"
                        >
                            Sí, cerrar sesión
                        </button>
                    </div>
                </div>
            </Modal>
        </aside>
    );
};
