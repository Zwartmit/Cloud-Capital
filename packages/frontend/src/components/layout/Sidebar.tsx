import { LayoutDashboard, Layers3, User, LogOut, ShieldHalf } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const Sidebar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isAdmin = user?.role === 'SUBADMIN' || user?.role === 'SUPERADMIN';

    return (
        <aside className="w-20 bg-primary p-4 flex flex-col items-center border-r border-secondary">
            {/* Logo */}
            <div className="mb-8 text-2xl font-black text-accent mt-2">CC</div>

            <div className="space-y-6 flex flex-col flex-grow">
                {/* Dashboard - Only for Users */}
                {!isAdmin && (
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`nav-link p-3 rounded-xl transition duration-150 ${isActive('/dashboard') ? 'active bg-accent text-white' : 'text-gray-400 hover:bg-secondary'
                            }`}
                        title="Dashboard"
                    >
                        <LayoutDashboard className="w-6 h-6 mx-auto" />
                    </button>
                )}

                {/* Investment Classes - Only for Users */}
                {!isAdmin && (
                    <button
                        onClick={() => navigate('/classes')}
                        className={`nav-link p-3 rounded-xl transition duration-150 ${isActive('/classes') ? 'active bg-accent text-white' : 'text-gray-400 hover:bg-secondary'
                            }`}
                        title="Planes de Inversión"
                    >
                        <Layers3 className="w-6 h-6 mx-auto" />
                    </button>
                )}

                {/* Profile */}
                <button
                    onClick={() => navigate('/profile')}
                    className={`nav-link p-3 rounded-xl transition duration-150 ${isActive('/profile') ? 'active bg-accent text-white' : 'text-gray-400 hover:bg-secondary'
                        }`}
                    title="Perfil"
                >
                    <User className="w-6 h-6 mx-auto" />
                </button>

                {/* Admin Panel (only for admins) */}
                {isAdmin && (
                    <button
                        onClick={() => navigate('/admin')}
                        className={`nav-link p-3 rounded-xl transition duration-150 ${isActive('/admin') ? 'active bg-admin text-white' : 'text-gray-400 hover:bg-secondary'
                            }`}
                        title="Panel Admin"
                    >
                        <ShieldHalf className="w-6 h-6 mx-auto text-admin" />
                    </button>
                )}
            </div>

            {/* Logout */}
            <button
                onClick={handleLogout}
                className="nav-link p-3 rounded-xl transition duration-150 mt-auto bg-red-600 hover:bg-red-500"
                title="Cerrar Sesión"
            >
                <LogOut className="w-6 h-6 mx-auto text-white" />
            </button>
        </aside>
    );
};
