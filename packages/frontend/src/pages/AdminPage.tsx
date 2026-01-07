import { useState, useEffect, useMemo, useRef } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Search, Users, TrendingUp, User, DollarSign, Building, Shield, Copy, Check } from 'lucide-react';
import { InvestmentPlanManager } from '../components/admin/InvestmentPlanManager';
import { ProfitManager } from '../components/admin/ProfitManager';
import { BankManager } from '../components/admin/BankManager';
import { CollaboratorsManager } from '../components/admin/CollaboratorsManager';
import { ConfirmModal } from '../components/modals/ConfirmModal';
import { ReferralsModal } from '../components/modals/ReferralsModal';
import { PasswordInput } from '../components/common/PasswordInput';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';
import { adminService } from '../services/adminService';
import { userService } from '../services/userService';
import { investmentPlanService } from '../services/investmentPlanService';
import { UserDTO } from '@cloud-capital/shared';
import { useAuthStore } from '../store/authStore';

export const AdminPage: React.FC = () => {
    const { user, updateUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'profile' | 'profit' | 'banks' | 'collabs'>('profile');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState<UserDTO[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [userListMessage, setUserListMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [btcAddressMessage, setBtcAddressMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [btcWithdrawAddr, setBtcWithdrawAddr] = useState(user?.btcWithdrawAddress || '');
    const [whatsappNum, setWhatsappNum] = useState(user?.whatsappNumber || '');
    const [contactMessage, setContactMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [whatsappMessage, setWhatsappMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [contactEmail, setContactEmail] = useState(user?.contactEmail || '');
    const [contactTelegram, setContactTelegram] = useState(user?.contactTelegram || '');
    const isSelectionEvent = useRef(false);

    // User list state
    const [allUsers, setAllUsers] = useState<UserDTO[]>([]);
    const [usersTotal, setUsersTotal] = useState(0);
    const [usersPage, setUsersPage] = useState(1);
    const [usersLimit, setUsersLimit] = useState(25);
    const [usersTotalPages, setUsersTotalPages] = useState(0);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // User list filters
    const [classFilter, setClassFilter] = useState<string>('ALL');
    const [accountStatusFilter, setAccountStatusFilter] = useState<string>('ALL');
    const [minCapital, setMinCapital] = useState('');
    const [maxCapital, setMaxCapital] = useState('');

    // Investment plans for filter
    const [investmentPlans, setInvestmentPlans] = useState<any[]>([]);

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<{ id: string, name: string } | null>(null);


    const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
    const [isUserReferralsModalOpen, setIsUserReferralsModalOpen] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);

    // Generate invitation link
    const invitationLink = `${window.location.origin}/register?ref=${user?.referralCode || ''}`;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(invitationLink);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    // Capital modification state
    const [newCapital, setNewCapital] = useState('');
    const [capitalMessage, setCapitalMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profit modification state
    const [newProfit, setNewProfit] = useState('');
    const [profitMessage, setProfitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Inside render:
    // {activeTab === 'tasks' && <TaskManager onTaskProcessed={fetchStats} />}

    // Live search effect
    useEffect(() => {
        if (isSelectionEvent.current) {
            isSelectionEvent.current = false;
            return;
        }

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

    const handleSelectUser = async (user: UserDTO, updateSearch = true) => {
        try {
            // Fetch full user details including referredBy
            const fullUserDetails = await adminService.getUserById(user.id);
            setSelectedUser(fullUserDetails);
            if (updateSearch) {
                isSelectionEvent.current = true;
                setSearchEmail(fullUserDetails.name); // Update search input with selected user's name
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
            setSelectedUser(user); // Fallback to table user data if full details fail
            if (updateSearch) {
                isSelectionEvent.current = true;
                setSearchEmail(user.name); // Update search input with selected user's name
            }
        } finally {
            setShowSuggestions(false);
            setError('');
        }
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

    // Filter and sort users
    const filteredUsers = useMemo(() => {
        return allUsers.filter((user) => {
            // Class filter
            let matchesClass = true;
            if (classFilter === 'NONE') {
                matchesClass = !user.investmentClass || user.investmentClass === null;
            } else if (classFilter !== 'ALL') {
                matchesClass = user.investmentClass === classFilter;
            }

            // Account status filter
            let matchesStatus = true;
            if (accountStatusFilter === 'ACTIVE') {
                matchesStatus = !!user.isBlocked === false;
            } else if (accountStatusFilter === 'BLOCKED') {
                matchesStatus = !!user.isBlocked === true;
            }

            // Capital range filter
            const capital = user.capitalUSDT || 0;
            const matchesMinCapital = !minCapital || capital >= parseFloat(minCapital);
            const matchesMaxCapital = !maxCapital || capital <= parseFloat(maxCapital);

            return matchesClass && matchesStatus && matchesMinCapital && matchesMaxCapital;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [allUsers, classFilter, accountStatusFilter, minCapital, maxCapital]);

    // Pagination for filtered users
    const totalFilteredPages = Math.ceil(filteredUsers.length / usersLimit);
    const paginatedUsers = filteredUsers.slice(
        (usersPage - 1) * usersLimit,
        usersPage * usersLimit
    );

    // Reset to page 1 when filters change
    useEffect(() => {
        setUsersPage(1);
    }, [classFilter, accountStatusFilter, minCapital, maxCapital]);

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

    const handleUnblockUser = async (userId: string, userName: string) => {
        if (confirm(`¿Deseas desbloquear la cuenta de ${userName}? El usuario podrá volver a acceder al sistema.`)) {
            try {
                await adminService.unblockUser(userId);
                loadAllUsers();
                setUserListMessage({ type: 'success', text: 'Usuario desbloqueado exitosamente' });
                setTimeout(() => setUserListMessage(null), 5000);
            } catch (err: any) {
                setUserListMessage({ type: 'error', text: err.response?.data?.error || 'Error al desbloquear usuario' });
            }
        }
    };

    const handleBlockUser = async (userId: string, userName: string) => {
        const reason = prompt(`Motivo de bloqueo para ${userName}:`, 'Bloqueado manualmente por administrador');
        if (reason !== null) {
            try {
                await adminService.blockUser(userId, reason);
                loadAllUsers();
                setUserListMessage({ type: 'success', text: 'Usuario bloqueado exitosamente' });
                setTimeout(() => setUserListMessage(null), 5000);
            } catch (err: any) {
                setUserListMessage({ type: 'error', text: err.response?.data?.error || 'Error al bloquear usuario' });
            }
        }
    };

    // Load users when tab changes or pagination changes
    useEffect(() => {
        if (activeTab === 'users') {
            loadAllUsers();
        }
    }, [activeTab, usersPage, usersLimit]);

    // Load investment plans for filter
    useEffect(() => {
        const loadPlans = async () => {
            try {
                const plans = await investmentPlanService.getAllPlans();
                setInvestmentPlans(plans);
            } catch (err) {
                console.error('Error loading investment plans:', err);
            }
        };
        loadPlans();
    }, []);

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-4 sm:p-8 overflow-y-auto w-full">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-2xl sm:text-4xl font-extrabold text-admin mb-6">
                        Panel de administración
                    </h2>

                    {/* Tabs Navigation */}
                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 mb-8 border-b border-gray-700 pb-2 sm:pb-0 overflow-x-auto">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`pb-2 sm:pb-4 px-1 font-bold transition-colors text-left sm:text-center whitespace-nowrap ${activeTab === 'profile'
                                ? 'text-accent border-b-2 border-accent'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <User className="w-5 h-5 inline mr-2" />
                            Perfil
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
                        {user?.role === 'SUPERADMIN' && (
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
                        )}
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
                        {user?.role === 'SUPERADMIN' && (
                            <button
                                onClick={() => setActiveTab('collabs')}
                                className={`pb-2 sm:pb-4 px-1 font-bold transition-colors text-left sm:text-center ${activeTab === 'collabs'
                                    ? 'text-accent border-b-2 border-accent'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Shield className="w-5 h-5 inline mr-2" />
                                Colaboradores
                            </button>
                        )}
                        {user?.role === 'SUBADMIN' && (
                            <button
                                onClick={() => setActiveTab('banks')}
                                className={`pb-2 sm:pb-4 px-1 font-bold transition-colors text-left sm:text-center ${activeTab === 'banks'
                                    ? 'text-accent border-b-2 border-accent'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Building className="w-5 h-5 inline mr-2" />
                                Bancos
                            </button>
                        )}
                    </div>

                    {user?.role === 'SUBADMIN' && activeTab === 'banks' && <BankManager />}

                    {user?.role === 'SUPERADMIN' && activeTab === 'collabs' && <CollaboratorsManager />}

                    {activeTab === 'users' && (
                        <div className="card p-6 rounded-xl border-t-4 border-blue-500">
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
                                                <div>
                                                    <p className="text-xs sm:text-sm text-gray-400">WhatsApp</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-semibold text-white text-sm sm:text-base">
                                                            {selectedUser.whatsappNumber || 'No registrado'}
                                                        </p>
                                                        {selectedUser.whatsappNumber && (
                                                            <a
                                                                href={`https://wa.me/${selectedUser.whatsappNumber.replace(/\+/g, '')}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold transition-colors flex items-center gap-1"
                                                                title="Abrir WhatsApp"
                                                            >
                                                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                                                </svg>
                                                                Chat
                                                            </a>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-700 pt-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-gray-400">Capital invertido</p>
                                                        <p className="text-xl sm:text-2xl font-black text-accent">
                                                            ${selectedUser.capitalUSDT.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-gray-400">Profit</p>
                                                        <p className="text-xl sm:text-2xl font-black text-profit">
                                                            +${(selectedUser.currentBalanceUSDT - selectedUser.capitalUSDT).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-gray-400">Profit manual</p>
                                                        <p className="text-xl sm:text-2xl font-black text-white">
                                                            ${(selectedUser as any).manualProfit?.toFixed(2) || '0.00'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-gray-400">Capital manual</p>
                                                        <p className="text-xl sm:text-2xl font-black text-white">
                                                            ${(selectedUser as any).manualCapital?.toFixed(2) || '0.00'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-gray-400">Balance total</p>
                                                        <p className="text-xl sm:text-2xl font-black text-white">
                                                            ${selectedUser.currentBalanceUSDT.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-700 pt-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-gray-400">Código de referido</p>
                                                        <p className="font-semibold text-white text-sm sm:text-base">
                                                            {(selectedUser as any).referralCode || 'N/A'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs sm:text-sm text-gray-400">Total referidos</p>
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
                                                {(selectedUser as any).referredBy && (
                                                    <div className="mt-3 pt-3 border-t border-gray-700">
                                                        <p className="text-xs sm:text-sm text-gray-400 mb-1">Referido por:</p>
                                                        <p className="font-semibold text-white text-sm sm:text-base">
                                                            {(selectedUser as any).referredBy.name} <span className="text-gray-500">(@{(selectedUser as any).referredBy.username})</span>
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Blocked Status Section */}
                                            {selectedUser.isBlocked && (
                                                <div className="border-t border-gray-700 pt-4">
                                                    <div className="p-3 bg-red-900/20 border border-red-700/30 rounded-lg">
                                                        <div className="flex items-start gap-2">
                                                            <span className="text-red-400 text-lg">🔒</span>
                                                            <div className="flex-1">
                                                                <h4 className="text-sm font-bold text-red-400 mb-1">Cuenta bloqueada</h4>

                                                                {/* Check if reason contains profit info */}
                                                                {selectedUser.blockedReason && selectedUser.blockedReason.includes('Profit retenido') ? (
                                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                                                                        <div>
                                                                            <p className="text-xs text-gray-400 mb-1 font-semibold uppercase tracking-wider">Motivo</p>
                                                                            <p className="text-sm text-white">Liquidación Aprobada</p>
                                                                        </div>
                                                                        <div className="bg-red-900/40 p-2 rounded border border-red-500/20">
                                                                            <p className="text-xs text-red-300 mb-1 font-semibold uppercase tracking-wider">Profit Retenido</p>
                                                                            <p className="text-sm text-red-100 font-mono font-bold">
                                                                                {selectedUser.blockedReason.split('Profit retenido: ')[1]}
                                                                            </p>
                                                                            <p className="text-[10px] text-red-400 mt-1">
                                                                                Ganancia al momento del retiro
                                                                            </p>
                                                                        </div>
                                                                    </div>
                                                                ) : (
                                                                    <p className="text-xs text-gray-300">
                                                                        <span className="font-semibold">Motivo:</span> {selectedUser.blockedReason === 'LIQUIDATION_APPROVED' ? 'Liquidación Aprobada' : (selectedUser.blockedReason || 'No especificado')}
                                                                    </p>
                                                                )}

                                                                {selectedUser.blockedAt && (
                                                                    <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-red-900/30">
                                                                        Bloqueada el: {new Date(selectedUser.blockedAt).toLocaleDateString('es-ES', {
                                                                            day: '2-digit',
                                                                            month: '2-digit',
                                                                            year: 'numeric',
                                                                            hour: '2-digit',
                                                                            minute: '2-digit'
                                                                        })}
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Capital and Profit Modification Section - Only for SUPERADMIN */}
                                            {user?.role === 'SUPERADMIN' && (
                                                <div className="border-t border-gray-700 pt-4">
                                                    <h4 className="text-sm font-bold text-accent mb-3">Modificar capital y profit del usuario:</h4>
                                                    {selectedUser.isBlocked && (
                                                        <div className="mb-3 p-2 bg-yellow-900/20 border border-yellow-700/30 rounded text-xs text-yellow-400">
                                                            ⚠️ Actualmente no se puede modificar el capital ni el profit de esta cuenta ya que está bloqueada.
                                                        </div>
                                                    )}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Capital Modification - Left Column */}
                                                        <form onSubmit={async (e) => {
                                                            e.preventDefault();
                                                            if (!selectedUser) return;

                                                            const addedCapital = parseFloat(newCapital);

                                                            if (!addedCapital || isNaN(addedCapital)) {
                                                                setCapitalMessage({ type: 'error', text: 'Ingresa un valor válido' });
                                                                return;
                                                            }

                                                            try {
                                                                // Calculate current profit
                                                                const currentProfit = selectedUser.currentBalanceUSDT - selectedUser.capitalUSDT;

                                                                // Calculate new totals
                                                                const newTotalCapital = selectedUser.capitalUSDT + addedCapital;

                                                                if (newTotalCapital < 0) {
                                                                    setCapitalMessage({ type: 'error', text: 'El capital resultante no puede ser negativo' });
                                                                    return;
                                                                }

                                                                // New balance = new capital + current profit (profit stays constant)
                                                                const newBalance = newTotalCapital + currentProfit;

                                                                const updated = await adminService.updateUserBalance(
                                                                    selectedUser.id,
                                                                    newTotalCapital,
                                                                    newBalance
                                                                );
                                                                setSelectedUser(updated);
                                                                setCapitalMessage({ type: 'success', text: 'Capital sumado/restado exitosamente' });
                                                                setNewCapital('');
                                                                setTimeout(() => setCapitalMessage(null), 5000);
                                                            } catch (err: any) {
                                                                setCapitalMessage({
                                                                    type: 'error',
                                                                    text: err.response?.data?.error || 'Error al actualizar capital'
                                                                });
                                                            }
                                                        }} className="space-y-3">
                                                            <div>
                                                                <label className="block text-xs text-gray-400 mb-1">Sumar al capital (usar negativo para restar)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={newCapital}
                                                                    onChange={(e) => setNewCapital(e.target.value)}
                                                                    placeholder="0.00"
                                                                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-accent focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    disabled={selectedUser.isBlocked}
                                                                    required
                                                                />
                                                                <p className="text-xs text-gray-500 mt-1 italic">
                                                                    Este valor se sumará al capital actual. El profit se mantiene igual.
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="submit"
                                                                className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-2 text-sm rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                disabled={selectedUser.isBlocked}
                                                            >
                                                                Actualizar capital
                                                            </button>
                                                            {capitalMessage && (
                                                                <div className={`p-2 rounded-lg text-xs ${capitalMessage.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                                    {capitalMessage.text}
                                                                </div>
                                                            )}
                                                        </form>

                                                        {/* Profit Modification - Right Column */}
                                                        <form onSubmit={async (e) => {
                                                            e.preventDefault();
                                                            if (!selectedUser) return;

                                                            const profitVal = parseFloat(newProfit);

                                                            if (isNaN(profitVal)) {
                                                                setProfitMessage({ type: 'error', text: 'Ingresa un valor válido' });
                                                                return;
                                                            }

                                                            try {
                                                                // Change: Add to current balance instead of setting absolute profit
                                                                const newBalance = selectedUser.currentBalanceUSDT + profitVal;

                                                                if (newBalance < 0) {
                                                                    setProfitMessage({ type: 'error', text: 'El balance resultante no puede ser negativo' });
                                                                    return;
                                                                }

                                                                const updated = await adminService.updateUserBalance(
                                                                    selectedUser.id,
                                                                    selectedUser.capitalUSDT, // Keep capital
                                                                    newBalance // Update balance with added profit
                                                                );
                                                                setSelectedUser(updated);
                                                                setAllUsers(prevUsers => prevUsers.map(u => u.id === updated.id ? updated : u));
                                                                setProfitMessage({ type: 'success', text: 'Profit agregado exitosamente' });
                                                                setNewProfit('');
                                                                setTimeout(() => setProfitMessage(null), 5000);
                                                            } catch (err: any) {
                                                                setProfitMessage({
                                                                    type: 'error',
                                                                    text: err.response?.data?.error || 'Error al actualizar profit'
                                                                });
                                                            }
                                                        }} className="space-y-3">
                                                            <div>
                                                                <label className="block text-xs text-gray-400 mb-1">Agregar al profit (Suma)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    value={newProfit}
                                                                    onChange={(e) => setNewProfit(e.target.value)}
                                                                    placeholder="0.00"
                                                                    className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    disabled={selectedUser.isBlocked}
                                                                    required
                                                                />
                                                                <p className="text-xs text-gray-500 mt-1 italic">
                                                                    Este valor se sumará al balance actual
                                                                </p>
                                                            </div>
                                                            <button
                                                                type="submit"
                                                                className="w-full bg-profit hover:bg-green-500 text-white font-bold py-2 text-sm rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                disabled={selectedUser.isBlocked}
                                                            >
                                                                Agregar profit
                                                            </button>
                                                            {profitMessage && (
                                                                <div className={`p-2 rounded-lg text-xs ${profitMessage.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                                    {profitMessage.text}
                                                                </div>
                                                            )}
                                                        </form>
                                                    </div>
                                                </div>
                                            )}

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

                                {/* Filters Section */}
                                <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 mb-4 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {/* Investment Class Filter */}
                                        <select
                                            value={classFilter}
                                            onChange={(e) => setClassFilter(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                                        >
                                            <option value="ALL">Todas las clases</option>
                                            <option value="NONE">Ninguna</option>
                                            {investmentPlans.map((plan) => (
                                                <option key={plan.id} value={plan.name}>
                                                    {plan.name}
                                                </option>
                                            ))}
                                        </select>

                                        {/* Account Status Filter */}
                                        <select
                                            value={accountStatusFilter}
                                            onChange={(e) => setAccountStatusFilter(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                                        >
                                            <option value="ALL">Todos los estados</option>
                                            <option value="ACTIVE">Activas</option>
                                            <option value="BLOCKED">Bloqueadas</option>
                                        </select>

                                        {/* Min Capital Filter */}
                                        <input
                                            type="number"
                                            placeholder="Capital mínimo"
                                            value={minCapital}
                                            onChange={(e) => setMinCapital(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                                            min="0"
                                            step="0.01"
                                        />

                                        {/* Max Capital Filter */}
                                        <input
                                            type="number"
                                            placeholder="Capital máximo"
                                            value={maxCapital}
                                            onChange={(e) => setMaxCapital(e.target.value)}
                                            className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:border-accent focus:outline-none"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    {/* Results Counter */}
                                    {(classFilter !== 'ALL' || accountStatusFilter !== 'ALL' || minCapital || maxCapital) && (
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-400">
                                                Mostrando <span className="text-white font-semibold">{filteredUsers.length}</span> de {allUsers.length} usuarios
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setClassFilter('ALL');
                                                    setAccountStatusFilter('ALL');
                                                    setMinCapital('');
                                                    setMaxCapital('');
                                                }}
                                                className="text-sm text-gray-400 hover:text-white transition-colors"
                                            >
                                                Limpiar filtros
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {userListMessage && (
                                    <div className={`mb-4 p-3 rounded-lg text-sm ${userListMessage.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {userListMessage.text}
                                    </div>
                                )}

                                {loadingUsers ? (
                                    <div className="text-center text-gray-500 py-8">Cargando usuarios...</div>
                                ) : filteredUsers.length === 0 ? (
                                    <div className="text-center text-gray-500 py-8">
                                        {allUsers.length === 0
                                            ? 'No hay usuarios registrados'
                                            : 'No se encontraron usuarios con los filtros aplicados'
                                        }
                                    </div>
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
                                                        <th className="text-center p-2 sm:p-3 text-gray-400 font-semibold whitespace-nowrap">Estado</th>
                                                        <th className="text-center p-2 sm:p-3 text-gray-400 font-semibold whitespace-nowrap">Acciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {paginatedUsers.map((tableUser) => (
                                                        <tr key={tableUser.id} className="border-b border-gray-700 hover:bg-gray-800/50 transition-colors">
                                                            <td className="p-2 sm:p-3 text-white whitespace-nowrap">{tableUser.name}</td>
                                                            <td className="p-2 sm:p-3 text-gray-300 whitespace-nowrap">{tableUser.email}</td>
                                                            <td className="p-2 sm:p-3 text-gray-300 whitespace-nowrap">{tableUser.username}</td>
                                                            <td className="p-2 sm:p-3 text-profit whitespace-nowrap">{tableUser.investmentClass || 'N/A'}</td>
                                                            <td className="p-2 sm:p-3 text-right text-accent font-semibold whitespace-nowrap">
                                                                ${tableUser.capitalUSDT?.toFixed(2) || '0.00'}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-right text-profit font-semibold whitespace-nowrap">
                                                                ${tableUser.currentBalanceUSDT?.toFixed(2) || '0.00'}
                                                            </td>
                                                            <td className="p-2 sm:p-3 text-center">
                                                                {tableUser.isBlocked ? (
                                                                    <span className="inline-flex items-center gap-1 text-xs bg-red-900/20 text-red-400 px-2 py-1 rounded border border-red-700/30" title={tableUser.blockedReason || 'Bloqueada'}>
                                                                        🔒 Bloqueada
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-xs text-green-500">✓ Activa</span>
                                                                )}
                                                            </td>
                                                            <td className="p-2 sm:p-3">
                                                                <div className="flex gap-2 justify-center">
                                                                    <button
                                                                        onClick={() => handleSelectUser(tableUser, false)}
                                                                        className="bg-blue-600 hover:bg-blue-500 text-white px-2 sm:px-3 py-1 rounded text-xs font-semibold transition-colors"
                                                                        title="Ver detalles"
                                                                    >
                                                                        Ver
                                                                    </button>
                                                                    {user?.role === 'SUPERADMIN' && !tableUser.isBlocked && (
                                                                        <button
                                                                            onClick={() => handleBlockUser(tableUser.id, tableUser.name)}
                                                                            className="bg-orange-600 hover:bg-orange-500 text-white px-2 sm:px-3 py-1 rounded text-xs font-semibold transition-colors"
                                                                            title="Bloquear cuenta"
                                                                        >
                                                                            Bloquear
                                                                        </button>
                                                                    )}
                                                                    {user?.role === 'SUPERADMIN' && tableUser.isBlocked && (
                                                                        <button
                                                                            onClick={() => handleUnblockUser(tableUser.id, tableUser.name)}
                                                                            className="bg-yellow-600 hover:bg-yellow-500 text-white px-2 sm:px-3 py-1 rounded text-xs font-semibold transition-colors"
                                                                            title="Desbloquear cuenta"
                                                                        >
                                                                            Desbloquear
                                                                        </button>
                                                                    )}
                                                                    {user?.role === 'SUPERADMIN' &&
                                                                        tableUser.capitalUSDT === 0 &&
                                                                        tableUser.currentBalanceUSDT === 0 && (
                                                                            <button
                                                                                onClick={() => handleDeleteUser(tableUser.id, tableUser.name)}
                                                                                className="bg-red-600 hover:bg-red-500 text-white px-2 sm:px-3 py-1 rounded text-xs font-semibold transition-colors"
                                                                                title="Eliminar usuario (solo disponible con balance en $0)"
                                                                            >
                                                                                Eliminar
                                                                            </button>
                                                                        )}
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
                                                Página {usersPage} de {totalFilteredPages} ({filteredUsers.length} usuarios{(classFilter !== 'ALL' || accountStatusFilter !== 'ALL' || minCapital || maxCapital) ? ' filtrados' : ''})
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
                                                    onClick={() => setUsersPage(Math.min(totalFilteredPages, usersPage + 1))}
                                                    disabled={usersPage >= totalFilteredPages}
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

                    {activeTab === 'profile' && (
                        // Profile Tab
                        <div className="card p-6 rounded-xl border-t-4 border-purple-500 space-y-6">
                            <div className="card-s p-8 rounded-xl border-t-4 border-accent">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Profile Information - Left Column - Compact Layout */}
                                    {/* Profile Information */}
                                    <div className={`${user?.role === 'SUBADMIN' ? 'lg:col-span-2' : ''}`}>
                                        <h3 className="text-xl font-bold text-white mb-6">Información del perfil</h3>

                                        {/* Layout for SUBADMIN: Grid 4 up, 3 down */}
                                        {user?.role === 'SUBADMIN' ? (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                                {/* Row 1 */}
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Nombre</p>
                                                    <p className="text-base font-semibold text-white">{user?.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Email</p>
                                                    <p className="text-base font-semibold text-white break-all">{user?.email}</p>
                                                </div>
                                                <div className="lg:col-span-1">
                                                    <p className="text-sm text-gray-400 mb-1">WhatsApp</p>
                                                    <form onSubmit={async (e) => {
                                                        e.preventDefault();
                                                        try {
                                                            const updatedUser = await userService.updateProfile({
                                                                whatsappNumber: whatsappNum || undefined
                                                            });
                                                            updateUser(updatedUser);
                                                            setWhatsappMessage({ type: 'success', text: 'Actualizado' });
                                                            setTimeout(() => setWhatsappMessage(null), 3000);
                                                        } catch (error: any) {
                                                            setWhatsappMessage({ type: 'error', text: 'Error' });
                                                        }
                                                    }} className="flex flex-col gap-2">
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <PhoneInput
                                                                value={whatsappNum}
                                                                onChange={(phone) => setWhatsappNum(phone)}
                                                                defaultCountry="us"
                                                                placeholder="Selecciona país y escribe número"
                                                                className="flex-grow w-full"
                                                                inputClassName="w-full p-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:ring-accent focus:border-accent focus:outline-none"
                                                                countrySelectorStyleProps={{
                                                                    buttonClassName: "bg-white hover:bg-gray-100 border-gray-300"
                                                                }}
                                                            />
                                                            <button
                                                                type="submit"
                                                                className="w-full sm:w-auto px-3 py-1.5 bg-gray-700 hover:bg-accent text-white rounded text-xs font-bold transition-colors whitespace-nowrap"
                                                            >
                                                                Guardar
                                                            </button>
                                                        </div>
                                                        {whatsappMessage && (
                                                            <p className={`text-xs ${whatsappMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                                                {whatsappMessage.text}
                                                            </p>
                                                        )}
                                                    </form>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Usuario</p>
                                                    <p className="text-base font-semibold text-white">{user?.username}</p>
                                                </div>

                                                {/* Row 2 */}
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Rol</p>
                                                    <p className="text-base font-semibold text-admin">{user?.role}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Código de referido</p>
                                                    <p className="text-base font-semibold text-accent">{user?.referralCode || 'N/A'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400 mb-1">Usuarios referidos</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-base font-semibold text-white">{user?.referralsCount || 0}</p>
                                                        <button
                                                            onClick={() => setIsReferralsModalOpen(true)}
                                                            className="p-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                                                            title="Ver referidos"
                                                        >
                                                            <Search className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Referral Link and BTC Address Section for SUBADMIN - Two Columns */}
                                                <div className="lg:col-span-4 mt-6 pt-6 border-t border-gray-700">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                                        {/* Link de invitación - Left Column */}
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                                                                Link de invitación
                                                            </label>
                                                            <div className="flex flex-col sm:flex-row gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={invitationLink}
                                                                    readOnly
                                                                    className="w-full sm:flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-sm text-gray-300 font-mono focus:outline-none focus:border-accent"
                                                                />
                                                                <button
                                                                    onClick={handleCopyLink}
                                                                    className="px-4 py-2 bg-accent hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                                                                    title="Copiar link"
                                                                >
                                                                    {copiedLink ? (
                                                                        <>
                                                                            <Check className="w-4 h-4" />
                                                                            <span className="hidden sm:inline">Copiado</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Copy className="w-4 h-4" />
                                                                            <span className="hidden sm:inline">Copiar</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                            <p className="text-xs text-gray-500 mt-2">
                                                                Comparte este link para invitar a nuevos usuarios.
                                                            </p>
                                                        </div>

                                                        {/* Dirección BTC personal - Right Column */}
                                                        <div>
                                                            <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                                                                Dirección BTC personal
                                                            </label>
                                                            <form onSubmit={async (e) => {
                                                                e.preventDefault();
                                                                // Validate BTC address format
                                                                const btcAddressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
                                                                if (btcWithdrawAddr && !btcAddressRegex.test(btcWithdrawAddr)) {
                                                                    setBtcAddressMessage({ type: 'error', text: 'Formato de dirección BTC inválido' });
                                                                    return;
                                                                }

                                                                try {
                                                                    const updatedUser = await userService.updateProfile({
                                                                        btcWithdrawAddress: btcWithdrawAddr || undefined
                                                                    });
                                                                    updateUser(updatedUser);
                                                                    setBtcAddressMessage({ type: 'success', text: 'Dirección BTC actualizada' });
                                                                    setTimeout(() => setBtcAddressMessage(null), 3000);
                                                                } catch (error: any) {
                                                                    setBtcAddressMessage({ type: 'error', text: error.response?.data?.error || 'Error' });
                                                                }
                                                            }} className="flex flex-col sm:flex-row gap-2">
                                                                <input
                                                                    type="text"
                                                                    value={btcWithdrawAddr}
                                                                    onChange={(e) => setBtcWithdrawAddr(e.target.value)}
                                                                    placeholder="bc1q... o 1... o 3..."
                                                                    className="w-full sm:flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-sm focus:ring-accent focus:border-accent focus:outline-none"
                                                                />
                                                                <button
                                                                    type="submit"
                                                                    className="px-4 py-2 bg-accent hover:bg-blue-500 text-white font-bold rounded-lg transition text-sm"
                                                                >
                                                                    Guardar
                                                                </button>
                                                            </form>
                                                            {btcAddressMessage && (
                                                                <p className={`text-xs mt-2 ${btcAddressMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                                                    {btcAddressMessage.text}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Original Vertical Layout for SUPERADMIN */
                                            <div className="space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                                    <p className="text-sm text-gray-400 sm:min-w-[140px]">Nombre</p>
                                                    <p className="text-base font-semibold text-white">{user?.name}</p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                                    <p className="text-sm text-gray-400 sm:min-w-[140px]">Email</p>
                                                    <p className="text-base font-semibold text-white break-all">{user?.email}</p>
                                                </div>

                                                {/* WhatsApp Edit Field */}
                                                <div className="py-2">
                                                    <form onSubmit={async (e) => {
                                                        e.preventDefault();
                                                        try {
                                                            const updatedUser = await userService.updateProfile({
                                                                whatsappNumber: whatsappNum || undefined
                                                            });
                                                            updateUser(updatedUser);
                                                            setWhatsappMessage({ type: 'success', text: 'WhatsApp actualizado' });
                                                            setTimeout(() => setWhatsappMessage(null), 3000);
                                                        } catch (error: any) {
                                                            setWhatsappMessage({ type: 'error', text: error.response?.data?.error || 'Error' });
                                                        }
                                                    }} className="flex flex-col gap-2">
                                                        <p className="text-sm text-gray-400">WhatsApp</p>
                                                        <div className="flex flex-col sm:flex-row gap-2">
                                                            <PhoneInput
                                                                value={whatsappNum}
                                                                onChange={(phone) => setWhatsappNum(phone)}
                                                                defaultCountry="us"
                                                                placeholder="Selecciona país y escribe número"
                                                                className="flex-grow w-full"
                                                                inputClassName="w-full p-1.5 bg-gray-800 border border-gray-700 rounded text-white text-sm focus:ring-accent focus:border-accent focus:outline-none"
                                                            />
                                                            <button type="submit" className="w-full sm:w-auto px-3 py-1.5 bg-gray-700 hover:bg-accent text-white rounded text-xs font-bold transition-colors whitespace-nowrap">
                                                                Guardar
                                                            </button>
                                                        </div>
                                                    </form>
                                                    {whatsappMessage && (
                                                        <p className={`text-xs mt-1 ml-0 sm:ml-[148px] ${whatsappMessage.type === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                                                            {whatsappMessage.text}
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                                    <p className="text-sm text-gray-400 sm:min-w-[140px]">Usuario</p>
                                                    <p className="text-base font-semibold text-white">{user?.username}</p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                                    <p className="text-sm text-gray-400 sm:min-w-[140px]">Rol</p>
                                                    <p className="text-base font-semibold text-admin">{user?.role}</p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                                    <p className="text-sm text-gray-400 sm:min-w-[140px]">Código de referido</p>
                                                    <p className="text-base font-semibold text-accent">{user?.referralCode || 'N/A'}</p>
                                                </div>
                                                <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-2">
                                                    <p className="text-sm text-gray-400 sm:min-w-[140px]">Usuarios referidos</p>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-base font-semibold text-white">{user?.referralsCount || 0}</p>
                                                        <button
                                                            onClick={() => setIsReferralsModalOpen(true)}
                                                            className="p-1 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white transition-colors"
                                                            title="Ver referidos"
                                                        >
                                                            <Search className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Contact Information - Right Column (Only for Superadmins) */}
                                    {user?.role === 'SUPERADMIN' && (
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-6">Información de contacto pública</h3>
                                            <p className="text-sm text-gray-400 mb-6">
                                                Esta información se mostrará en la sección de contacto de la landing page
                                            </p>
                                            <form onSubmit={async (e) => {
                                                e.preventDefault();

                                                // Validate email format if provided
                                                if (contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)) {
                                                    setContactMessage({ type: 'error', text: 'Formato de email inválido' });
                                                    return;
                                                }

                                                try {
                                                    const updatedUser = await userService.updateProfile({
                                                        contactEmail: contactEmail || undefined,
                                                        contactTelegram: contactTelegram || undefined
                                                    });
                                                    updateUser(updatedUser);
                                                    setContactMessage({ type: 'success', text: 'Información de contacto actualizada exitosamente' });
                                                    setTimeout(() => setContactMessage(null), 5000);
                                                } catch (error: any) {
                                                    setContactMessage({ type: 'error', text: error.response?.data?.error || 'Error al actualizar información de contacto' });
                                                }
                                            }} className="space-y-4">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm text-gray-400 mb-2">Email de contacto</label>
                                                        <input
                                                            type="email"
                                                            value={contactEmail}
                                                            onChange={(e) => setContactEmail(e.target.value)}
                                                            placeholder="contacto@cloudcapital.com"
                                                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent focus:outline-none"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm text-gray-400 mb-2">Usuario de Telegram</label>
                                                        <input
                                                            type="text"
                                                            value={contactTelegram}
                                                            onChange={(e) => setContactTelegram(e.target.value)}
                                                            placeholder="@cloudcapital"
                                                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent focus:outline-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="pt-2">
                                                    <button
                                                        type="submit"
                                                        className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                                                    >
                                                        Guardar información de contacto
                                                    </button>
                                                </div>
                                            </form>
                                            {/* Reuse message state, might need separation later if concurrent edits happen */}
                                            {contactMessage && (
                                                <div className={`mt-4 p-3 rounded-lg text-sm ${contactMessage.type === 'success'
                                                    ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                                                    : 'bg-red-500/10 border border-red-500/20 text-red-500'
                                                    }`}>
                                                    {contactMessage.text}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Password Section - Full Width */}
                                <div className="mt-8 pt-6 border-t border-gray-700">


                                    {/* Change Password Section - Right Column */}
                                    <div>
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
                                        }} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                                            </div>
                                            <div className="pt-2">
                                                <button
                                                    type="submit"
                                                    className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                                                >
                                                    Cambiar contraseña
                                                </button>
                                            </div>
                                        </form>
                                        {passwordMessage && (
                                            <div className={`mt-4 p-3 rounded-lg text-sm ${passwordMessage.type === 'success'
                                                ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                                                : 'bg-red-500/10 border border-red-500/20 text-red-500'
                                                }`}>
                                                {passwordMessage.text}
                                            </div>
                                        )}
                                    </div>

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
