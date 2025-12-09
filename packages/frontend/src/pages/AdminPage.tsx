import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Search, Users, ListChecks, TrendingUp, User, DollarSign, Book } from 'lucide-react';
import { InvestmentPlanManager } from '../components/admin/InvestmentPlanManager';
import { ProfitManager } from '../components/admin/ProfitManager';
import { AdminGuide } from '../components/admin/AdminGuide';
import { TaskManager } from '../components/admin/TaskManager';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { ReferralsModal } from '../components/modals/ReferralsModal';
import { PasswordInput } from '../components/common/PasswordInput';
import { adminService } from '../services/adminService';
import { userService } from '../services/userService';
import { UserDTO } from '@cloud-capital/shared';
import { useAuthStore } from '../store/authStore';

export const AdminPage: React.FC = () => {
    const { user } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'profile' | 'tasks' | 'profit' | 'guide'>('tasks');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState<UserDTO[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
    const [balanceModAmount, setBalanceModAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [balanceMessage, setBalanceMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [userListMessage, setUserListMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // User list state
    const [allUsers, setAllUsers] = useState<UserDTO[]>([]);
    const [usersTotal, setUsersTotal] = useState(0);
    const [usersPage, setUsersPage] = useState(1);
    const [usersLimit, setUsersLimit] = useState(25);
    const [usersTotalPages, setUsersTotalPages] = useState(0);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);


    const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
    const [isUserReferralsModalOpen, setIsUserReferralsModalOpen] = useState(false);

    const [pendingTasksCount, setPendingTasksCount] = useState(0);

    // Fetch stats to get pending tasks count
    const fetchStats = async () => {
        try {
            const stats = await adminService.getStats();
            setPendingTasksCount(stats.pendingTasks);
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    useEffect(() => {
        fetchStats();
        // Refresh every minute
        const interval = setInterval(fetchStats, 60000);
        return () => clearInterval(interval);
    }, []);

    // ... (rest of the file until render)

    // Inside render:
    // {activeTab === 'tasks' && <TaskManager onTaskProcessed={fetchStats} />}

    // Live search effect
    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchEmail.length >= 2) {
                setLoading(true);
                try {
                    const users = await adminService.searchUsers(searchEmail);
                    setSearchResults(users);
                    setShowSuggestions(true);
                    setError('');
                } catch (err) {
                    console.error('Error searching users:', err);
                } finally {
                    setLoading(false);
                }
            } else {
                setSearchResults([]);
                setShowSuggestions(false);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchEmail]);

    const handleSelectUser = (user: UserDTO) => {
        setSelectedUser(user);
        setSearchEmail(user.name);
        setShowSuggestions(false);
        setError('');
    };

    // Keep manual search as fallback or for specific exact match
    const handleManualSearch = async () => {
        if (!searchEmail) return;

        setLoading(true);
        setError('');
        try {
            const users = await adminService.searchUsers(searchEmail);
            if (users.length > 0) {
                // If multiple, show suggestions, otherwise select first
                if (users.length === 1) {
                    handleSelectUser(users[0]);
                } else {
                    setSearchResults(users);
                    setShowSuggestions(true);
                }
            } else {
                setError('Este usuario no está registrado o está mal escrito, intenta nuevamente');
                setSelectedUser(null);
            }
        } catch (err) {
            console.error('Error searching user:', err);
            setError('Error al buscar usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateBalance = async (type: 'add' | 'subtract') => {
        if (!selectedUser || !balanceModAmount) return;

        const amount = parseFloat(balanceModAmount);
        if (isNaN(amount) || amount <= 0) {
            setBalanceMessage({ type: 'error', text: 'Por favor ingresa un monto válido' });
            return;
        }

        setLoading(true);
        setBalanceMessage(null);

        try {
            const currentBalance = selectedUser.currentBalanceUSDT;
            const newBalance = type === 'add'
                ? currentBalance + amount
                : currentBalance - amount;

            if (newBalance < 0) {
                setBalanceMessage({ type: 'error', text: 'El balance no puede ser negativo' });
                setLoading(false);
                return;
            }

            const updatedUser = await adminService.updateUserBalance(
                selectedUser.id,
                selectedUser.capitalUSDT, // Keep capital same, only modifying balance/profit
                newBalance
            );

            setSelectedUser(updatedUser);
            setBalanceModAmount('');
            setBalanceMessage({ type: 'success', text: 'Balance actualizado exitosamente' });
            setTimeout(() => setBalanceMessage(null), 5000);
        } catch (err) {
            console.error('Error updating balance:', err);
            setBalanceMessage({ type: 'error', text: 'Error al actualizar el balance' });
        } finally {
            setLoading(false);
        }
    };

    // Load all users for the list
    const loadAllUsers = async () => {
        try {
            setLoadingUsers(true);
            const result = await adminService.getAllUsers(usersLimit, usersPage);
            setAllUsers(result.users);
            setUsersTotal(result.total);
            setUsersTotalPages(result.totalPages);
        } catch (err) {
            console.error('Error loading users:', err);
        } finally {
            setLoadingUsers(false);
        }
    };

    // Delete user (opens modal)
    const handleDeleteUser = (userId: string, userName: string) => {
        setUserToDelete({ id: userId, name: userName });
        setShowDeleteModal(true);
    };

    // Confirm delete from modal
    const confirmDeleteUser = async () => {
        if (!userToDelete) return;

        try {
            await adminService.deleteUser(userToDelete.id);
            loadAllUsers(); // Reload the list
            setUserListMessage({ type: 'success', text: 'Usuario eliminado exitosamente' });
            setTimeout(() => setUserListMessage(null), 5000);
        } catch (err: any) {
            setUserListMessage({ type: 'error', text: err.response?.data?.error || 'Error al eliminar usuario' });
        } finally {
            setShowDeleteModal(false);
            setUserToDelete(null);
        }
    };



    // Load users when tab changes to users or pagination changes
    useEffect(() => {
        if (activeTab === 'users') {
            loadAllUsers();
        }
    }, [activeTab, usersPage, usersLimit]);

    // Helper to refresh stats when necessary (e.g. after a task is processed)
    // We can pass this down or just rely on the interval/refresh trigger

    // ... rest of the code ...

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-admin mb-8 flex items-center">
                        <Users className="w-8 h-8 mr-3" />
                        Panel de administración
                    </h2>

                    {/* Tabs Navigation */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-8 border-b border-gray-700 pb-2 sm:pb-0">
                        <button
                            onClick={() => setActiveTab('guide')}
                            className={`pb-2 sm:pb-4 px-1 font-bold transition-colors text-left sm:text-center ${activeTab === 'guide'
                                ? 'text-blue-400 border-b-2 border-blue-400'
                                : 'text-gray-400 hover:text-blue-300'
                                }`}
                        >
                            <Book className="w-5 h-5 inline mr-2" />
                            Guía
                        </button>
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`pb-2 sm:pb-4 px-1 font-bold transition-colors text-left sm:text-center ${activeTab === 'profile'
                                ? 'text-accent border-b-2 border-accent'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <User className="w-5 h-5 inline mr-2" />
                            Perfil
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`pb-2 sm:pb-4 px-1 font-bold transition-colors text-left sm:text-center ${activeTab === 'users'
                                ? 'text-accent border-b-2 border-accent'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Users className="w-5 h-5 inline mr-2" />
                            Gestión de usuarios
                        </button>
                        <button
                            onClick={() => setActiveTab('plans')}
                            className={`pb-2 sm:pb-4 px-1 font-bold transition-colors text-left sm:text-center ${activeTab === 'plans'
                                ? 'text-accent border-b-2 border-accent'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <TrendingUp className="w-5 h-5 inline mr-2" />
                            Planes de inversión
                        </button>
                        <button
                            onClick={() => setActiveTab('profit')}
                            className={`pb-2 sm:pb-4 px-1 font-bold transition-colors text-left sm:text-center ${activeTab === 'profit'
                                ? 'text-accent border-b-2 border-accent'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <DollarSign className="w-5 h-5 inline mr-2" />
                            Rentabilidad
                        </button>
                        <button
                            onClick={() => setActiveTab('tasks')}
                            className={`relative pb-2 sm:pb-4 px-1 font-bold transition-colors text-left sm:text-center ${activeTab === 'tasks'
                                ? 'text-accent border-b-2 border-accent'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <ListChecks className="w-5 h-5 inline mr-2" />
                            Tareas
                            {pendingTasksCount > 0 && (
                                <span className="absolute top-0 right-0 sm:-top-3 sm:-right-3 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full animate-pulse">
                                    {pendingTasksCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {activeTab === 'tasks' && <TaskManager onTaskProcessed={fetchStats} />}

                    {activeTab === 'users' && (
                        <div className="card p-6 rounded-xl border-t-4 border-blue-500">
                            {/* Section Header */}
                            <div className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
                                <h3 className="text-xl font-bold text-white mb-2">Gestión de usuarios</h3>
                                <p className="text-gray-400">
                                    Administra la base de usuarios de la plataforma. Puedes buscar usuarios específicos, ver sus detalles financieros,
                                    modificar sus balances manualmente, restablecer contraseñas y eliminar cuentas si es necesario.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                                {/* Search Card */}
                                <div className="lg:col-span-1 card-s p-6 rounded-xl border-t-4 border-accent relative">
                                    <h3 className="text-xl font-bold mb-4 text-white">1. Buscar usuario</h3>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={searchEmail}
                                            onChange={(e) => setSearchEmail(e.target.value)}
                                            onFocus={() => searchEmail.length >= 2 && setShowSuggestions(true)}
                                            placeholder="Email, nombre o usuario"
                                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent focus:outline-none mb-4"
                                        />

                                        {/* Dropdown Suggestions */}
                                        {showSuggestions && searchResults.length > 0 && (
                                            <div className="absolute z-10 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-xl max-h-60 overflow-y-auto top-14 left-0">
                                                {searchResults.map((user) => (
                                                    <div
                                                        key={user.id}
                                                        onClick={() => handleSelectUser(user)}
                                                        className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-0 transition-colors"
                                                    >
                                                        <p className="font-bold text-white text-sm">{user.name}</p>
                                                        <p className="text-xs text-gray-400">{user.email}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={handleManualSearch}
                                        disabled={loading}
                                        className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition duration-200 disabled:opacity-50"
                                    >
                                        <Search className="w-4 h-4 inline mr-2" />
                                        {loading ? 'Buscando...' : 'Buscar'}
                                    </button>
                                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                                </div>

                                {/* User Info Card */}
                                <div className="lg:col-span-2 card-s p-4 sm:p-6 rounded-xl border-t-4 border-profit">
                                    <h3 className="text-lg sm:text-xl font-bold mb-4 text-white">
                                        2. Información del usuario
                                    </h3>
                                    {selectedUser ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-400">Email</p>
                                                    <p className="font-semibold text-white text-sm sm:text-base break-all">{selectedUser.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-400">Nombre</p>
                                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedUser.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-400">Username</p>
                                                    <p className="font-semibold text-white text-sm sm:text-base">{selectedUser.username}</p>
                                                </div>
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-400">Clase</p>
                                                    <p className="font-semibold text-profit text-sm sm:text-base">
                                                        {selectedUser.investmentClass || 'N/A'}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-700 pt-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-gray-400">Capital invertido</p>
                                                        <p className="text-xl sm:text-2xl font-black text-accent">
                                                            ${selectedUser.capitalUSDT.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-gray-400">Balance total</p>
                                                        <p className="text-xl sm:text-2xl font-black text-profit">
                                                            ${selectedUser.currentBalanceUSDT.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-700 pt-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-gray-400">Código de Referido</p>
                                                        <p className="font-semibold text-white text-sm sm:text-base">
                                                            {(selectedUser as any).referralCode || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-gray-400">Total Referidos</p>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-white text-sm sm:text-base">
                                                                {(selectedUser as any).referralsCount || 0}
                                                            </p>
                                                            <button
                                                                onClick={() => setIsUserReferralsModalOpen(true)}
                                                                className="text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded transition"
                                                            >
                                                                Ver lista
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-700 pt-4">
                                                <h4 className="text-xs sm:text-sm font-bold text-white mb-3">
                                                    Modificar balance (Profit/Wallet)
                                                </h4>
                                                <div className="flex flex-col sm:flex-row gap-2">
                                                    <input
                                                        type="number"
                                                        value={balanceModAmount}
                                                        onChange={(e) => setBalanceModAmount(e.target.value)}
                                                        placeholder="Monto"
                                                        className="flex-grow p-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                                                    />
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleUpdateBalance('add')}
                                                            disabled={loading}
                                                            className="flex-1 sm:flex-none bg-profit hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                                        >
                                                            Añadir
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpdateBalance('subtract')}
                                                            disabled={loading}
                                                            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                                        >
                                                            Restar
                                                        </button>
                                                    </div>
                                                </div>
                                                {balanceMessage && (
                                                    <div className={`mt-2 p-2 rounded text-sm ${balanceMessage.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                        {balanceMessage.text}
                                                    </div>
                                                )}
                                            </div>


                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            Busca un usuario para ver su información
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* User List Section */}
                            <div className="card-s p-4 sm:p-6 rounded-xl border-t-4 border-accent mb-8">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                                    <h3 className="text-lg sm:text-xl font-bold text-white flex items-center">
                                        <Users className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                        Lista de usuarios ({usersTotal} total)
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-400">Mostrar:</label>
                                        <select
                                            value={usersLimit}
                                            onChange={(e) => {
                                                setUsersLimit(Number(e.target.value));
                                                setUsersPage(1); // Reset to first page
                                            }}
                                            className="p-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-accent focus:border-accent"
                                        >
                                            <option value={10}>10</option>
                                            <option value={25}>25</option>
                                            <option value={50}>50</option>
                                            <option value={100}>100</option>
                                        </select>
                                    </div>
                                </div>

                                {userListMessage && (
                                    <div className={`mb-4 p-3 rounded-lg text-sm ${userListMessage.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {userListMessage.text}
                                    </div>
                                )}

                                {loadingUsers ? (
                                    <div className="text-center text-gray-500 py-8">Cargando usuarios...</div>
                                ) : allUsers.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">No hay usuarios registrados</div>
                                ) : (
                                    <>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-xs sm:text-sm">
                                                <thead>
                                                    <tr className="border-b border-gray-700">
                                                        <th className="text-left p-2 sm:p-3 text-gray-400 font-semibold whitespace-nowrap">Nombre</th>
                                                        <th className="text-left p-2 sm:p-3 text-gray-400 font-semibold whitespace-nowrap">Email</th>
                                                        <th className="text-left p-2 sm:p-3 text-gray-400 font-semibold whitespace-nowrap">Username</th>
                                                        <th className="text-left p-2 sm:p-3 text-gray-400 font-semibold whitespace-nowrap">Clase</th>
                                                        <th className="text-right p-2 sm:p-3 text-gray-400 font-semibold whitespace-nowrap">Capital</th>
                                                        <th className="text-right p-2 sm:p-3 text-gray-400 font-semibold whitespace-nowrap">Balance</th>
                                                        <th className="text-center p-2 sm:p-3 text-gray-400 font-semibold whitespace-nowrap">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {allUsers.map((user) => (
                                                        <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                                                            <td className="p-2 sm:p-3 text-white whitespace-nowrap">{user.name}</td>
                                                            <td className="p-2 sm:p-3 text-gray-300 whitespace-nowrap">{user.email}</td>
                                                            <td className="p-2 sm:p-3 text-gray-300 whitespace-nowrap">{user.username}</td>
                                                            <td className="p-2 sm:p-3 text-profit whitespace-nowrap">{user.investmentClass || 'N/A'}</td>
                                                            <td className="p-2 sm:p-3 text-right text-accent font-semibold whitespace-nowrap">
                                                                ${user.capitalUSDT?.toFixed(2) || '0.00'}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-right text-profit font-semibold whitespace-nowrap">
                                                                ${user.currentBalanceUSDT?.toFixed(2) || '0.00'}
                                                            </td>
                                                            <td className="p-2 sm:p-3">
                                                                <div className="flex gap-2 justify-center">
                                                                    <button
                                                                        onClick={() => handleSelectUser(user)}
                                                                        className="bg-blue-600 hover:bg-blue-500 text-white px-2 sm:px-3 py-1 rounded text-xs font-semibold transition-colors"
                                                                        title="Ver detalles"
                                                                    >
                                                                        Ver
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                                                        className="bg-red-600 hover:bg-red-500 text-white px-2 sm:px-3 py-1 rounded text-xs font-semibold transition-colors"
                                                                        title="Eliminar usuario"
                                                                    >
                                                                        Eliminar
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        {/* Pagination */}
                                        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                                            <div className="text-sm text-gray-400">
                                                Página {usersPage} de {usersTotalPages} ({usersTotal} usuarios)
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setUsersPage(Math.max(1, usersPage - 1))}
                                                    disabled={usersPage === 1}
                                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    Anterior
                                                </button>
                                                <button
                                                    onClick={() => setUsersPage(Math.min(usersTotalPages, usersPage + 1))}
                                                    disabled={usersPage >= usersTotalPages}
                                                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    Siguiente
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'plans' && <InvestmentPlanManager />}

                    {activeTab === 'profit' && <ProfitManager />}

                    {activeTab === 'guide' && <AdminGuide />}

                    {activeTab === 'profile' && (
                        // Profile Tab
                        <div className="card p-6 rounded-xl border-t-4 border-purple-500 space-y-6">
                            {/* Section Header */}
                            <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                                <h3 className="text-xl font-bold text-white mb-2">Perfil de administrador</h3>
                                <p className="text-gray-400">
                                    Gestiona tu información personal y seguridad. Aquí puedes ver tus estadísticas de referido (si aplica)
                                    y actualizar tu contraseña de acceso al panel.
                                </p>
                            </div>

                            <div className="card-s p-8 rounded-xl border-t-4 border-accent">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Nombre</p>
                                        <p className="text-lg font-semibold text-white">{user?.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Email</p>
                                        <p className="text-lg font-semibold text-white">{user?.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Usuario</p>
                                        <p className="text-lg font-semibold text-white">{user?.username}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Rol</p>
                                        <p className="text-lg font-semibold text-admin">{user?.role}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Código de referido</p>
                                        <p className="text-lg font-semibold text-accent">{user?.referralCode || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-400 mb-1">Usuarios referidos</p>
                                        <div className="flex items-center gap-2">
                                            <p className="text-lg font-semibold text-white">{user?.referralsCount || 0}</p>
                                            <button
                                                onClick={() => setIsReferralsModalOpen(true)}
                                                className="p-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                                                title="Ver referidos"
                                            >
                                                <Search className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Change Password Section - Simplified UI */}
                                <div className="mt-8 pt-6 border-t border-gray-700">
                                    <h3 className="text-xl font-bold text-white mb-6">Cambiar contraseña</h3>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const form = e.currentTarget;
                                        const formData = new FormData(form);
                                        const currentPassword = formData.get('currentPassword') as string;
                                        const newPassword = formData.get('newPassword') as string;
                                        const confirmPassword = formData.get('confirmPassword') as string;

                                        if (newPassword !== confirmPassword) {
                                            setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
                                            return;
                                        }

                                        if (newPassword.length < 6) {
                                            setPasswordMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
                                            return;
                                        }

                                        try {
                                            await userService.changePassword(currentPassword, newPassword);
                                            setPasswordMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' });
                                            form.reset();
                                            setTimeout(() => setPasswordMessage(null), 5000);
                                        } catch (error: any) {
                                            setPasswordMessage({ type: 'error', text: error.response?.data?.error || 'Error al cambiar la contraseña' });
                                        }
                                    }} className="max-w-xl space-y-4">
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Contraseña actual</label>
                                            <PasswordInput
                                                name="currentPassword"
                                                placeholder=""
                                                required
                                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Nueva contraseña</label>
                                            <PasswordInput
                                                name="newPassword"
                                                placeholder=""
                                                required
                                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm text-gray-400 mb-2">Confirmar nueva contraseña</label>
                                            <PasswordInput
                                                name="confirmPassword"
                                                placeholder=""
                                                required
                                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent focus:outline-none"
                                            />
                                        </div>
                                        <div className="pt-2 flex justify-center sm:justify-start">
                                            <button
                                                type="submit"
                                                className="bg-accent hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                                            >
                                                Cambiar contraseña
                                            </button>
                                        </div>
                                    </form>
                                    {passwordMessage && (
                                        <div className={`mt-4 p-3 rounded-lg text-sm max-w-xl ${passwordMessage.type === 'success'
                                            ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                                            : 'bg-red-500/10 border border-red-500/20 text-red-500'
                                            }`}>
                                            {passwordMessage.text}
                                        </div>
                                    )}
                                </div>


                            </div>
                        </div>
                    )}
                </div>
            </main >

            {/* Delete Confirmation Modal */}
            < ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeleteUser}
                title="Confirmar eliminación"
                message={`¿Deseas eliminar al usuario "${userToDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                confirmButtonClass="bg-red-600 hover:bg-red-500"
            />
            <ReferralsModal
                isOpen={isReferralsModalOpen}
                onClose={() => setIsReferralsModalOpen(false)}
            />
            {/* User Referrals Modal (Admin view) */}
            {
                selectedUser && (
                    <ReferralsModal
                        isOpen={isUserReferralsModalOpen}
                        onClose={() => setIsUserReferralsModalOpen(false)}
                        userId={selectedUser.id}
                    />
                )
            }
        </div >
    );
};
