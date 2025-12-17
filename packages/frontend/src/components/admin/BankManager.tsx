import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { adminService, Bank } from '../../services/adminService';
import { ConfirmModal } from '../modals/ConfirmModal';

export const BankManager: React.FC = () => {
    const [banks, setBanks] = useState<Bank[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentBank, setCurrentBank] = useState<Bank | null>(null);

    // Form state
    const [bankName, setBankName] = useState('');
    const [bankIsActive, setBankIsActive] = useState(true);

    // Confirmation state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bankToDelete, setBankToDelete] = useState<Bank | null>(null);

    useEffect(() => {
        fetchBanks();
    }, []);

    const fetchBanks = async () => {
        setLoading(true);
        try {
            const data = await adminService.getAllBanks();
            setBanks(data);
            setError('');
        } catch (err: any) {
            setError('Error al cargar bancos');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenCreate = () => {
        setModalMode('create');
        setBankName('');
        setBankIsActive(true);
        setCurrentBank(null);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (bank: Bank) => {
        setModalMode('edit');
        setBankName(bank.name);
        setBankIsActive(bank.isActive);
        setCurrentBank(bank);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (modalMode === 'create') {
                await adminService.createBank(bankName);
                setSuccessMessage('Banco creado exitosamente');
            } else {
                if (!currentBank) return;
                await adminService.updateBank(currentBank.id, bankName, bankIsActive);
                setSuccessMessage('Banco actualizado exitosamente');
            }
            setIsModalOpen(false);
            fetchBanks();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al guardar banco');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (bank: Bank) => {
        setBankToDelete(bank);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!bankToDelete) return;

        try {
            await adminService.deleteBank(bankToDelete.id);
            setSuccessMessage('Banco eliminado exitosamente');
            fetchBanks();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al eliminar banco');
        } finally {
            setShowDeleteModal(false);
            setBankToDelete(null);
        }
    };

    return (
        <div className="card p-6 rounded-xl border-t-4 border-blue-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 sm:gap-0">
                <div>
                    <h3 className="text-xl font-bold text-white">Gestión de bancos</h3>
                    <p className="text-gray-400 text-sm">Administra la lista de bancos disponibles para depósitos y retiros.</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="w-full sm:w-auto bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center transition"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Agregar banco
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
                            <th className="p-4">Nombre del banco</th>
                            <th className="p-4 text-center">Estado</th>
                            <th className="p-4 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                        {loading && banks.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-400">Cargando...</td>
                            </tr>
                        ) : banks.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="p-8 text-center text-gray-400">No hay bancos registrados</td>
                            </tr>
                        ) : (
                            banks.map(bank => (
                                <tr key={bank.id} className="hover:bg-gray-800/50 transition">
                                    <td className="p-4 font-medium text-white">{bank.name}</td>
                                    <td className="p-4 text-center">
                                        <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${bank.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {bank.isActive ? (
                                                <>
                                                    <CheckCircle className="w-3 h-3 mr-1" /> Activo
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle className="w-3 h-3 mr-1" /> Inactivo
                                                </>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => handleOpenEdit(bank)}
                                                className="p-2 hover:bg-gray-700 rounded-lg text-blue-400 transition"
                                                title="Editar"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(bank)}
                                                className="p-2 hover:bg-gray-700 rounded-lg text-red-400 transition"
                                                title="Eliminar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4">
                {loading && banks.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">Cargando...</div>
                ) : banks.length === 0 ? (
                    <div className="text-center text-gray-400 py-8">No hay bancos registrados</div>
                ) : (
                    banks.map(bank => (
                        <div key={bank.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                            <div className="flex justify-between items-start mb-3">
                                <h4 className="font-medium text-white text-lg">{bank.name}</h4>
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${bank.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {bank.isActive ? 'Activo' : 'Inactivo'}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-gray-700">
                                <button
                                    onClick={() => handleOpenEdit(bank)}
                                    className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-blue-400 text-sm transition"
                                >
                                    <Edit2 className="w-3 h-3 mr-1.5" /> Editar
                                </button>
                                <button
                                    onClick={() => handleDelete(bank)}
                                    className="flex items-center px-3 py-1.5 bg-gray-700 hover:bg-gray-600 rounded-lg text-red-400 text-sm transition"
                                >
                                    <Trash2 className="w-3 h-3 mr-1.5" /> Eliminar
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && createPortal(
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                    onClick={() => setIsModalOpen(false)}
                >
                    <div
                        className="bg-gray-800 rounded-xl w-[95%] sm:w-full sm:max-w-md border border-gray-700 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 sm:p-6 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg sm:text-xl font-bold text-white">
                                {modalMode === 'create' ? 'Agregar banco' : 'Editar banco'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white transition"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Nombre del banco</label>
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={(e) => setBankName(e.target.value)}
                                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                                    placeholder="Ej: Banco Pichincha"
                                    required
                                    autoFocus
                                />
                            </div>

                            {modalMode === 'edit' && (
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        id="bankActive"
                                        checked={bankIsActive}
                                        onChange={(e) => setBankIsActive(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-accent focus:ring-accent"
                                    />
                                    <label htmlFor="bankActive" className="ml-2 text-sm text-gray-300">
                                        Banco activo (visible para usuarios)
                                    </label>
                                </div>
                            )}

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 font-bold transition disabled:opacity-50"
                                >
                                    {loading ? 'Guardando...' : 'Guardar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Eliminar banco"
                message={`¿Estás seguro de que deseas eliminar el banco "${bankToDelete?.name}"?`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                confirmButtonClass="bg-red-600 hover:bg-red-500"
            />
        </div>
    );
};
