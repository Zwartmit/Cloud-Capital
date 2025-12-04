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
        <aside className="w-14 sm:w-20 bg-primary p-2 sm:p-4 flex flex-col items-center border-r border-secondary transition-all duration-300">
            {/* Logo */}
            <div className="mb-4 sm:mb-8 mt-2">
                <img src="/logo.png" alt="Cloud Capital" className="w-8 sm:w-12 h-auto object-contain" />
            </div>
            {/* Logout */}
            <button
                onClick={handleLogoutClick}
                className="nav-link p-2 sm:p-3 rounded-xl transition duration-150 mb-8 bg-red-600 hover:bg-red-500"
                title="Cerrar Sesión"
            >
                <LogOut className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-white" />
            </button>

            <div className="space-y-6 flex flex-col flex-grow">
                {/* Dashboard - Only for Users */}
                {!isAdmin && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`nav-link p-2 sm:p-3 rounded-xl transition duration-150 ${isActive('/dashboard') ? 'active bg-accent text-white' : 'text-gray-400 hover:bg-secondary'
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
                        className={`nav-link p-2 sm:p-3 rounded-xl transition duration-150 ${isActive('/classes') ? 'active bg-accent text-white' : 'text-gray-400 hover:bg-secondary'
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
                        className={`nav-link p-2 sm:p-3 rounded-xl transition duration-150 ${isActive('/profile') ? 'active bg-accent text-white' : 'text-gray-400 hover:bg-secondary'
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
                        className={`nav-link p-2 sm:p-3 rounded-xl transition duration-150 ${isActive('/admin') ? 'active bg-admin text-white' : 'text-gray-400 hover:bg-secondary'
                            }`}
                        title="Panel Admin"
                    >
                        <ShieldHalf className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-admin text-black" />
                    </button>
                )}
            </div>


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
                            className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-500 transition"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={confirmLogout}
                            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition"
                        >
                            Sí, cerrar sesión
                        </button>
                    </div>
                </div>
            </Modal>
        </aside >
    );
};
