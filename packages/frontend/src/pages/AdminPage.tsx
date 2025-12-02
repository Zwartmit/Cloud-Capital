import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Search, Users, ListChecks, TrendingUp } from 'lucide-react';
import { InvestmentPlanManager } from '../components/admin/InvestmentPlanManager';
import { adminService } from '../services/adminService';
import { UserDTO } from '@cloud-capital/shared';

export const AdminPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'plans'>('users');
    const [searchEmail, setSearchEmail] = useState('');
    const [searchResults, setSearchResults] = useState<UserDTO[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserDTO | null>(null);
    const [balanceModAmount, setBalanceModAmount] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
        setSearchEmail(user.email);
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
            setError('Por favor ingresa un monto válido');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const currentBalance = selectedUser.currentBalanceUSDT;
            const newBalance = type === 'add'
                ? currentBalance + amount
                : currentBalance - amount;

            if (newBalance < 0) {
                setError('El balance no puede ser negativo');
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
            alert('Balance actualizado exitosamente');
        } catch (err) {
            console.error('Error updating balance:', err);
            setError('Error al actualizar el balance');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-4xl font-extrabold text-admin mb-8 flex items-center">
                        <Users className="w-8 h-8 mr-3" />
                        Panel de administración
                    </h2>

                    {/* Tabs Navigation */}
                    <div className="flex space-x-4 mb-8 border-b border-gray-700">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'users'
                                ? 'text-accent border-b-2 border-accent'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <Users className="w-5 h-5 inline mr-2" />
                            Gestión de usuarios
                        </button>
                        <button
                            onClick={() => setActiveTab('plans')}
                            className={`pb-4 px-4 font-bold transition-colors ${activeTab === 'plans'
                                ? 'text-accent border-b-2 border-accent'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            <TrendingUp className="w-5 h-5 inline mr-2" />
                            Planes de inversión
                        </button>
                    </div>

                    {activeTab === 'users' ? (
                        <>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                                {/* Search Card */}
                                <div className="lg:col-span-1 card p-6 rounded-xl border-t-4 border-accent relative">
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
                                <div className="lg:col-span-2 card p-6 rounded-xl border-t-4 border-profit">
                                    <h3 className="text-xl font-bold mb-4 text-white">
                                        2. Información del usuario
                                    </h3>
                                    {selectedUser ? (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <p className="text-sm text-gray-400">Email</p>
                                                    <p className="font-semibold text-white">{selectedUser.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Nombre</p>
                                                    <p className="font-semibold text-white">{selectedUser.name}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Username</p>
                                                    <p className="font-semibold text-white">{selectedUser.username}</p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-400">Clase</p>
                                                    <p className="font-semibold text-profit">
                                                        {selectedUser.investmentClass}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-700 pt-4">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-sm text-gray-400">Capital invertido</p>
                                                        <p className="text-2xl font-black text-accent">
                                                            ${selectedUser.capitalUSDT.toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-400">Balance total</p>
                                                        <p className="text-2xl font-black text-profit">
                                                            ${selectedUser.currentBalanceUSDT.toFixed(2)}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-gray-700 pt-4">
                                                <h4 className="text-sm font-bold text-white mb-3">
                                                    Modificar balance (Profit/Wallet)
                                                </h4>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="number"
                                                        value={balanceModAmount}
                                                        onChange={(e) => setBalanceModAmount(e.target.value)}
                                                        placeholder="Monto"
                                                        className="flex-grow p-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm"
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateBalance('add')}
                                                        disabled={loading}
                                                        className="bg-profit hover:bg-emerald-400 text-black font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                                    >
                                                        Añadir
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateBalance('subtract')}
                                                        disabled={loading}
                                                        className="bg-red-600 hover:bg-red-500 text-white font-bold px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                                                    >
                                                        Restar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 py-8">
                                            Busca un usuario para ver su información
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Tasks Section */}
                            <div className="card p-6 rounded-xl">
                                <h3 className="text-xl font-bold mb-4 text-white flex items-center">
                                    <ListChecks className="w-6 h-6 mr-2" />
                                    Tareas pendientes
                                </h3>
                                <div className="text-center text-gray-500 py-8">
                                    Panel de tareas - implementación pendiente
                                </div>
                            </div>
                        </>
                    ) : (
                        <InvestmentPlanManager />
                    )}
                </div>
            </main>
        </div>
    );
};
