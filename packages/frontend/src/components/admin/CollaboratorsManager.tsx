import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { adminService, CollaboratorConfig } from '../../services/adminService';
import { UserDTO } from '@cloud-capital/shared';
import { Settings, Shield, XCircle } from 'lucide-react';

export const CollaboratorsManager: React.FC = () => {
    const [staff, setStaff] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal state for editing config
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
    const [selectedCollaborator, setSelectedCollaborator] = useState<UserDTO | null>(null);

    // Config form
    const [commission, setCommission] = useState(5);
    const [processingTime, setProcessingTime] = useState('10-30 minutos');
    const [minAmount, setMinAmount] = useState(10);
    const [maxAmount, setMaxAmount] = useState(10000);

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
        } else {
            // Defaults
            setCommission(5);
            setProcessingTime('10-30 minutos');
            setMinAmount(10);
            setMaxAmount(10000);
        }

        setIsConfigModalOpen(true);
    };

    const handleSaveConfig = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedCollaborator) return;

        setLoading(true);
        setError('');

        try {
            await adminService.updateCollaboratorConfig(selectedCollaborator.id, {
                commission: Number(commission),
                processingTime,
                minAmount: Number(minAmount),
                maxAmount: Number(maxAmount)
            });

            setSuccessMessage(`Configuración actualizada para ${selectedCollaborator.name}`);
            setIsConfigModalOpen(false);
            fetchStaff(); // Refresh list to see updated data if we displayed it
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al guardar configuración');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-6 rounded-xl border-t-4 border-purple-500">
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white flex items-start sm:items-center">
                    <Shield className="w-6 h-6 mr-2 text-purple-400 flex-shrink-0 mt-1 sm:mt-0" />
                    <span>Gestión de Colaboradores y Staff</span>
                </h3>
                <p className="text-gray-400 text-sm mt-1 ml-8 sm:ml-0">
                    Administra las configuraciones específicas de cada colaborador, como comisiones y tiempos de procesamiento.
                </p>
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
                                                    <div><span className="text-gray-500">Límites:</span> ${config.minAmount} - ${config.maxAmount}</div>
                                                </div>
                                            ) : (
                                                <span className="text-gray-600 italic">No configurado</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => handleOpenConfig(user)}
                                                className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center justify-center mx-auto"
                                            >
                                                <Settings className="w-4 h-4 mr-1.5" />
                                                Configurar
                                            </button>
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

                                <button
                                    onClick={() => handleOpenConfig(user)}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white font-medium transition"
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    Configurar
                                </button>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Config Modal */}
            {isConfigModalOpen && selectedCollaborator && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={() => setIsConfigModalOpen(false)}
                >
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
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
