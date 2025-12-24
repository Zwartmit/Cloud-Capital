import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminService, CollaboratorConfig } from '../../services/adminService';
import collaboratorBankService, { CollaboratorBankAccount } from '../../services/collaboratorBankService';
import { UserDTO } from '@cloud-capital/shared';
import { Settings, XCircle, Plus, Trash2, Wallet, Phone, CreditCard } from 'lucide-react';

// Collaborators Manager Component
export const CollaboratorsManager: React.FC = () => {
    const [staff, setStaff] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal state for editing config
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [selectedCollaborator, setSelectedCollaborator] = useState<UserDTO | null>(null);
    const [modalError, setModalError] = useState('');
    const [modalSuccess, setModalSuccess] = useState('');

    // Config form
    const [commission, setCommission] = useState(5);
    const [processingTime, setProcessingTime] = useState('10-30 minutos');
    const [minAmount, setMinAmount] = useState(10);
    const [maxAmount, setMaxAmount] = useState(10000);
    const [isActive, setIsActive] = useState(true);
    const [walletAddress, setWalletAddress] = useState('');
    const [whatsappNumber, setWhatsappNumber] = useState('');

    // Create modal state
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm, setCreateForm] = useState({
        name: '',
        email: '',
        username: '',
        password: '',
        whatsappNumber: ''
    });

    // Bank info modal state
    const [isBankInfoModalOpen, setIsBankInfoModalOpen] = useState(false);
    const [selectedCollabForBanks, setSelectedCollabForBanks] = useState<UserDTO | null>(null);
    const [collabBankAccounts, setCollabBankAccounts] = useState<CollaboratorBankAccount[]>([]);

    useEffect(() => {
        fetchStaff();
    }, []);

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllStaff();
            setStaff(data);
            setError('');
        } catch (err: any) {
            setError('Error al cargar colaboradores');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenConfig = (user: UserDTO) => {
        setSelectedCollaborator(user);
        const config = (user as any).collaboratorConfig as CollaboratorConfig | undefined;

        if (config) {
            setCommission(config.commission ?? 5);
            setProcessingTime(config.processingTime ?? '10-30 minutos');
            setMinAmount(config.minAmount ?? 10);
            setMaxAmount(config.maxAmount ?? 10000);
            setIsActive(config.isActive ?? true);
            setWalletAddress(config.walletAddress || '');
            setWhatsappNumber((user as any).whatsappNumber || '');
        } else {
            // Defaults
            setCommission(5);
            setProcessingTime('10-30 minutos');
            setMinAmount(10);
            setMaxAmount(10000);
            setIsActive(true);
            setWalletAddress('');
            setWhatsappNumber((user as any).whatsappNumber || '');
        }

        setIsConfigModalOpen(true);
        setModalError('');
        setModalSuccess('');
    };

    const handleOpenBankInfo = async (user: UserDTO) => {
        setSelectedCollabForBanks(user);
        setIsBankInfoModalOpen(true);
        try {
            const accounts = await collaboratorBankService.getBankAccounts({ collaboratorId: user.id });
            setCollabBankAccounts(accounts);
        } catch (err) {
            console.error('Error fetching bank accounts:', err);
            setCollabBankAccounts([]);
        }
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCollaborator) return;

        setLoading(true);
        setModalError('');
        setModalSuccess('');

        try {
            await adminService.updateCollaboratorConfig(selectedCollaborator.id, {
                commission: Number(commission),
                processingTime,
                minAmount: Number(minAmount),
                maxAmount: Number(maxAmount),
                isActive,
                walletAddress,
                whatsappNumber
            });

            setModalSuccess(`Configuración actualizada para ${selectedCollaborator.name}`);
            setTimeout(() => {
                setIsConfigModalOpen(false);
                setModalSuccess('');
                fetchStaff();
            }, 1000);
        } catch (err: any) {
            setModalError(err.response?.data?.error || 'Error al guardar configuración');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setModalError('');
        setModalSuccess('');

        try {
            await adminService.createCollaborator(createForm);
            setModalSuccess('Colaborador creado exitosamente');
            setCreateForm({ name: '', email: '', username: '', password: '', whatsappNumber: '' });
            setTimeout(() => {
                setIsCreateModalOpen(false);
                setModalSuccess('');
                fetchStaff();
            }, 1000);
        } catch (err: any) {
            setModalError(err.response?.data?.error || 'Error al crear colaborador');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCollaborator || !window.confirm('¿Estás seguro de que quieres eliminar este colaborador? Esta acción no se puede deshacer.')) return;

        setLoading(true);
        setModalError('');
        try {
            await adminService.deleteUser(selectedCollaborator.id);
            setIsConfigModalOpen(false);
            setSuccessMessage('Colaborador eliminado correctamente');
            fetchStaff();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setModalError(err.response?.data?.error || 'Error al eliminar colaborador');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-6 rounded-xl border-t-4 border-purple-500">
            <div className="mb-8 p-6 bg-gray-800 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-2">Gestión de Colaboradores y Staff</h3>
                <p className="text-gray-400">
                    Administra las configuraciones específicas de cada colaborador, como comisiones y tiempos de procesamiento.
                </p>
            </div>

            <div className="flex justify-end mb-6">
                <button
                    onClick={() => {
                        setIsCreateModalOpen(true);
                        setModalError('');
                        setModalSuccess('');
                    }}
                    className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold transition flex items-center shadow-lg transform hover:scale-105"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo colaborador
                </button>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-lg mb-6">
                    {error}
                </div>
            )}

            {successMessage && (
                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-4 rounded-lg mb-6">
                    {successMessage}
                </div>
            )}

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="text-gray-400 border-b border-gray-700">
                        <tr>
                            <th className="p-4">Colaborador</th>
                            <th className="p-4">Rol</th>
                            <th className="p-4">Configuración Actual</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {loading && staff.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400">Cargando...</td>
                            </tr>
                        ) : staff.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-8 text-center text-gray-400">No hay colaboradores registrados</td>
                            </tr>
                        ) : (
                            staff.map(user => {
                                const config = (user as any).collaboratorConfig as CollaboratorConfig | undefined;
                                return (
                                    <tr key={user.id} className="hover:bg-gray-800/50 transition">
                                        <td className="p-4">
                                            <div className="font-medium text-white">{user.name}</div>
                                            <div className="text-xs text-gray-400">{user.email}</div>
                                            {(user as any).whatsappNumber && (
                                                <div className="text-xs text-green-400 mt-1">{`WA: ${(user as any).whatsappNumber}`}</div>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${user.role === 'SUPERADMIN' ? 'bg-red-500/10 text-red-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-300">
                                            {config ? (
                                                <div className="space-y-1">
                                                    <div><span className="text-gray-500">Comisión:</span> <span className="text-accent font-bold">{config.commission}%</span></div>
                                                    <div><span className="text-gray-500">Tiempo:</span> {config.processingTime}</div>
                                                    <div><span className="text-gray-500">Tiempo:</span> {config.processingTime}</div>
                                                    <div><span className="text-gray-500">Límites:</span> ${config.minAmount} - ${config.maxAmount}</div>
                                                    <div className="pt-1">
                                                        <span className={`text-xs px-2 py-0.5 rounded border ${config.isActive === false ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-green-500 text-green-500 bg-green-500/10'}`}>
                                                            {config.isActive === false ? 'No disponible' : 'Disponible'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 italic">No configurado</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <div className="flex gap-2 justify-center">
                                                <button
                                                    onClick={() => handleOpenConfig(user)}
                                                    className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center justify-center"
                                                >
                                                    <Settings className="w-4 h-4 mr-1.5" />
                                                    Configurar
                                                </button>
                                                <button
                                                    onClick={() => handleOpenBankInfo(user)}
                                                    className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center justify-center"
                                                    title="Ver cuentas bancarias"
                                                >
                                                    <CreditCard className="w-4 h-4 mr-1.5" />
                                                    Bancos
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
                {loading && staff.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">Cargando...</div>
                ) : staff.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No hay colaboradores registrados</div>
                ) : (
                    staff.map(user => {
                        const config = (user as any).collaboratorConfig as CollaboratorConfig | undefined;
                        return (
                            <div key={user.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                                <div className="flex justify-between items-start mb-3 gap-3">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="font-medium text-white text-lg truncate pr-2">{user.name}</h4>
                                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                                        {(user as any).whatsappNumber && (
                                            <p className="text-xs text-green-400 mt-1 truncate">{`WA: ${(user as any).whatsappNumber}`}</p>
                                        )}
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs font-bold whitespace-nowrap flex-shrink-0 ${user.role === 'SUPERADMIN' ? 'bg-red-500/10 text-red-500' : 'bg-purple-500/10 text-purple-500'}`}>
                                        {user.role}
                                    </span>
                                </div>

                                <div className="bg-gray-900/50 p-3 rounded-lg mb-4 text-sm">
                                    {config ? (
                                        <div className="space-y-1">
                                            <div className="flex justify-between border-b border-gray-800 pb-1 mb-1">
                                                <span className="text-gray-500">Comisión:</span>
                                                <span className="text-accent font-bold">{config.commission}%</span>
                                            </div>
                                            <div className="flex justify-between border-b border-gray-800 pb-1 mb-1">
                                                <span className="text-gray-500">Tiempo:</span>
                                                <span className="text-gray-300">{config.processingTime}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Límites:</span>
                                                <span className="text-gray-300">${config.minAmount} - ${config.maxAmount}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center text-gray-500 italic py-1">
                                            No configurado
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenConfig(user)}
                                        className="flex-1 flex items-center justify-center px-2 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white text-sm font-medium transition"
                                    >
                                        <Settings className="w-3.5 h-3.5 mr-1.5" />
                                        Configurar
                                    </button>
                                    <button
                                        onClick={() => handleOpenBankInfo(user)}
                                        className="flex-1 flex items-center justify-center px-2 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-white text-sm font-medium transition"
                                        title="Ver cuentas bancarias"
                                    >
                                        <CreditCard className="w-3.5 h-3.5 mr-1.5" />
                                        Bancos
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Config Modal */}
            {isConfigModalOpen && selectedCollaborator && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    {/* Overlay - click disabled to prevent accidental close */}
                    <div
                        className="bg-gray-800 rounded-xl w-[95%] sm:w-full sm:max-w-lg border border-gray-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 sm:p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800 sticky top-0 z-10">
                            <h3 className="text-lg sm:text-xl font-bold text-white pr-4">
                                Configurar: {selectedCollaborator.name}
                            </h3>
                            <button
                                onClick={() => setIsConfigModalOpen(false)}
                                className="text-gray-400 hover:text-white transition"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveConfig} className="p-4 sm:p-6 space-y-4">
                            {modalError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                                    {modalError}
                                </div>
                            )}
                            {modalSuccess && (
                                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg text-sm">
                                    {modalSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Comisión (%)</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={commission}
                                            onChange={(e) => setCommission(Number(e.target.value))}
                                            step="0.1"
                                            min="0"
                                            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                                            required
                                        />
                                        <span className="absolute right-3 top-3 text-gray-400">%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Máximo 10% permitido.</p>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Tiempo de procesamiento</label>
                                    <input
                                        type="text"
                                        value={processingTime}
                                        onChange={(e) => setProcessingTime(e.target.value)}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                                        placeholder="Ej: 10-30 minutos"
                                        required
                                    />
                                </div>
                            </div>

                            {/* New Fields: Wallet & WhatsApp */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1 flex items-center">
                                        <Wallet className="w-3 h-3 mr-1" /> Wallet de cobro
                                    </label>
                                    <input
                                        type="text"
                                        value={walletAddress}
                                        onChange={(e) => setWalletAddress(e.target.value)}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                                        placeholder="Dirección USDT/BTC"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1 flex items-center">
                                        <Phone className="w-3 h-3 mr-1" /> WhatsApp de órdenes
                                    </label>
                                    <input
                                        type="text"
                                        value={whatsappNumber}
                                        onChange={(e) => setWhatsappNumber(e.target.value)}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                                        placeholder="Ej: 58412..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Monto mínimo ($)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-400">$</span>
                                        <input
                                            type="number"
                                            value={minAmount}
                                            onChange={(e) => setMinAmount(Number(e.target.value))}
                                            min="0"
                                            className="w-full p-3 pl-8 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                                            required
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Monto máximo ($)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-3 text-gray-400">$</span>
                                        <input
                                            type="number"
                                            value={maxAmount}
                                            onChange={(e) => setMaxAmount(Number(e.target.value))}
                                            min="0"
                                            className="w-full p-3 pl-8 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="flex items-center space-x-3 p-3 border border-gray-600 rounded-lg cursor-pointer hover:bg-gray-700/50 transition">
                                        <input
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="w-5 h-5 rounded border-gray-600 text-accent focus:ring-accent bg-gray-700"
                                        />
                                        <div>
                                            <span className="block text-white font-medium">Disponible para recibir depósitos</span>
                                            <span className="block text-xs text-gray-400">Si está desactivado, no aparecerá en la lista de colaboradores para los usuarios.</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsConfigModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 font-bold transition disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : 'Guardar configuración'}
                                </button>
                            </div>

                            <div className="pt-2 border-t border-gray-700">
                                <button
                                    type="button"
                                    onClick={handleDelete}
                                    className="w-full flex items-center justify-center px-4 py-2 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/10 transition text-sm"
                                >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Eliminar Colaborador
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Create Modal */}
            {isCreateModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    {/* Overlay - click disabled to prevent accidental close */}
                    <div
                        className="bg-gray-800 rounded-xl w-[95%] sm:w-full sm:max-w-lg border border-gray-700 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 sm:p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800">
                            <h3 className="text-lg sm:text-xl font-bold text-white">Nuevo colaborador</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-400 hover:text-white transition">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="p-4 sm:p-6 space-y-4">
                            {modalError && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm">
                                    {modalError}
                                </div>
                            )}
                            {modalSuccess && (
                                <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg text-sm">
                                    {modalSuccess}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nombre completo</label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Usuario</label>
                                    <input
                                        type="text"
                                        value={createForm.username}
                                        onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Contraseña</label>
                                    <input
                                        type="password"
                                        value={createForm.password}
                                        onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">WhatsApp (Número completo)</label>
                                <input
                                    type="text"
                                    value={createForm.whatsappNumber}
                                    onChange={(e) => setCreateForm({ ...createForm, whatsappNumber: e.target.value })}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white"
                                    placeholder="Ej: 584121234567"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-4 bg-accent hover:bg-blue-600 text-white font-bold py-3 rounded-lg transition"
                            >
                                {loading ? 'Creando...' : 'Crear colaborador'}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            {/* Bank Info Modal */}
            {isBankInfoModalOpen && selectedCollabForBanks && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div
                        className="bg-gray-800 rounded-xl w-[95%] sm:w-full sm:max-w-2xl border border-gray-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 sm:p-6 border-b border-gray-700 flex justify-between items-center bg-gray-800 sticky top-0 z-10">
                            <h3 className="text-lg sm:text-xl font-bold text-white pr-4">
                                Cuentas Bancarias: {selectedCollabForBanks.name}
                            </h3>
                            <button
                                onClick={() => setIsBankInfoModalOpen(false)}
                                className="text-gray-400 hover:text-white transition"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-4 sm:p-6">
                            {collabBankAccounts.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>Este colaborador no tiene cuentas bancarias registradas</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {collabBankAccounts.map((account) => (
                                        <div key={account.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="flex items-center">
                                                    <CreditCard className="w-5 h-5 text-blue-400 mr-2" />
                                                    <h4 className="font-bold text-white">{account.bankName}</h4>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${account.isActive
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {account.isActive ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                                <div>
                                                    <span className="text-gray-500">Tipo de cuenta:</span>
                                                    <p className="text-white font-medium">{account.accountType}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Número de cuenta:</span>
                                                    <p className="text-white font-medium">{account.accountNumber}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Titular:</span>
                                                    <p className="text-white font-medium">{account.accountHolder}</p>
                                                </div>
                                                <div>
                                                    <span className="text-gray-500">Documento:</span>
                                                    <p className="text-white font-medium">{account.documentType}: {account.documentNumber}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 sm:p-6 border-t border-gray-700 bg-gray-800 sticky bottom-0">
                            <button
                                onClick={() => setIsBankInfoModalOpen(false)}
                                className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
