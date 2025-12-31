import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Edit2, Trash2, Search, CreditCard } from 'lucide-react';
import { adminService } from '../../services/adminService';
import collaboratorBankService, { CollaboratorBankAccount, CollaboratorBankAccountData } from '../../services/collaboratorBankService';
import { ConfirmModal } from '../modals/ConfirmModal';
import { useAuthStore } from '../../store/authStore';

export const BankManager: React.FC = () => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'SUPERADMIN';
    const isSubadmin = user?.role === ('SUBADMIN' as const);

    // Collaborator banks state
    const [collaboratorBanks, setCollaboratorBanks] = useState<CollaboratorBankAccount[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCollaborator, setSelectedCollaborator] = useState<string>('');
    const [collaborators, setCollaborators] = useState<Array<{ id: string; name: string; email: string }>>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
    const [currentCollabBank, setCurrentCollabBank] = useState<CollaboratorBankAccount | null>(null);

    // Form state for collaborator banks
    const [collabBankName, setCollabBankName] = useState('');
    const [accountType, setAccountType] = useState('AHORROS');
    const [customAccountType, setCustomAccountType] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [documentType, setDocumentType] = useState('DNI');
    const [customDocumentType, setCustomDocumentType] = useState('');
    const [documentNumber, setDocumentNumber] = useState('');
    const [collabBankIsActive, setCollabBankIsActive] = useState(true);

    // Confirmation state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [bankToDelete, setBankToDelete] = useState<CollaboratorBankAccount | null>(null);

    useEffect(() => {
        fetchCollaboratorBanks();
        if (isAdmin) {
            fetchCollaborators();
        }
    }, []);

    const fetchCollaboratorBanks = async () => {
        setLoading(true);
        try {
            const data = await collaboratorBankService.getBankAccounts({
                collaboratorId: selectedCollaborator || undefined,
                search: searchTerm || undefined,
            });
            setCollaboratorBanks(data);
            setError('');
        } catch (err: any) {
            setError('Error al cargar cuentas bancarias');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCollaborators = async () => {
        try {
            const users = await adminService.getAllUsers();
            const subadmins = users.users.filter((u: any) => u.role === 'SUBADMIN');
            setCollaborators(subadmins.map((u: any) => ({
                id: u.id,
                name: u.name,
                email: u.email,
            })));
        } catch (err) {
            console.error('Error fetching collaborators:', err);
        }
    };

    // Collaborator bank handlers
    const handleOpenCreateCollabBank = () => {
        setModalMode('create');
        setCollabBankName('');
        setAccountType('AHORROS');
        setCustomAccountType('');
        setAccountNumber('');
        setAccountHolder('');
        setDocumentType('DNI');
        setCustomDocumentType('');
        setDocumentNumber('');
        setCollabBankIsActive(true);
        setCurrentCollabBank(null);
        setIsModalOpen(true);
    };

    const handleOpenEditCollabBank = (bank: CollaboratorBankAccount) => {
        setModalMode('edit');
        setCollabBankName(bank.bankName);
        // Check if it's a custom type
        const isCustomAccountType = !['AHORROS', 'CORRIENTE'].includes(bank.accountType);
        setAccountType(isCustomAccountType ? 'OTRO' : bank.accountType);
        setCustomAccountType(isCustomAccountType ? bank.accountType : '');
        setAccountNumber(bank.accountNumber);
        setAccountHolder(bank.accountHolder);
        const isCustomDocType = !['DNI', 'PASAPORTE', 'RUC', 'CEDULA'].includes(bank.documentType);
        setDocumentType(isCustomDocType ? 'OTRO' : bank.documentType);
        setCustomDocumentType(isCustomDocType ? bank.documentType : '');
        setDocumentNumber(bank.documentNumber);
        setCollabBankIsActive(bank.isActive);
        setCurrentCollabBank(bank);
        setIsModalOpen(true);
    };

    const handleSubmitCollabBank = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const data: CollaboratorBankAccountData = {
                bankName: collabBankName,
                accountType: accountType === 'OTRO' ? customAccountType : accountType,
                accountNumber,
                accountHolder,
                documentType: documentType === 'OTRO' ? customDocumentType : documentType,
                documentNumber,
            };

            if (modalMode === 'create') {
                await collaboratorBankService.createBankAccount(data);
                setSuccessMessage('Cuenta bancaria creada exitosamente');
            } else {
                if (!currentCollabBank) return;
                await collaboratorBankService.updateBankAccount(currentCollabBank.id, {
                    ...data,
                    isActive: collabBankIsActive,
                });
                setSuccessMessage('Cuenta bancaria actualizada exitosamente');
            }
            setIsModalOpen(false);
            fetchCollaboratorBanks();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al guardar cuenta bancaria');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (bank: CollaboratorBankAccount) => {
        setBankToDelete(bank);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!bankToDelete) return;

        try {
            await collaboratorBankService.deleteBankAccount(bankToDelete.id);
            setSuccessMessage('Cuenta bancaria eliminada exitosamente');
            fetchCollaboratorBanks();
            setTimeout(() => setSuccessMessage(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al eliminar');
        } finally {
            setShowDeleteModal(false);
            setBankToDelete(null);
        }
    };

    return (
        <div className="card p-6 rounded-xl border-t-4 border-blue-500">
            <div className="mb-6 border-b border-secondary pb-4">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-accent mb-2">
                    Cuentas Bancarias de Colaboradores
                </h2>
                <p className="text-gray-400 text-sm">
                    {isAdmin ? 'Gestiona las cuentas bancarias de todos los colaboradores' : 'Gestiona tus cuentas bancarias para recibir pagos'}
                </p>
            </div>

            {/* Filters (ADMIN only) */}
            {isAdmin && (
                <div className="mb-6 flex flex-col sm:flex-row gap-3">
                    <select
                        value={selectedCollaborator}
                        onChange={(e) => {
                            setSelectedCollaborator(e.target.value);
                            setTimeout(() => fetchCollaboratorBanks(), 100);
                        }}
                        className="flex-1 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                    >
                        <option value="">Todos los colaboradores</option>
                        {collaborators.map((collab) => (
                            <option key={collab.id} value={collab.id}>
                                {collab.name} ({collab.email})
                            </option>
                        ))}
                    </select>
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                                setTimeout(() => fetchCollaboratorBanks(), 300);
                            }}
                            placeholder="Buscar por banco, cuenta o titular..."
                            className="w-full pl-10 p-2 bg-gray-700 border border-gray-600 rounded-lg text-white text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Add button */}
            {isSubadmin && (
                <div className="mb-6 flex justify-end">
                    <button
                        onClick={handleOpenCreateCollabBank}
                        className="bg-accent hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-bold flex items-center justify-center transition"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Agregar cuenta bancaria
                    </button>
                </div>
            )}

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

            {/* Collaborator Banks Table */}
            <CollaboratorBanksTable
                banks={collaboratorBanks}
                loading={loading}
                isAdmin={isAdmin}
                onEdit={isSubadmin ? handleOpenEditCollabBank : undefined}
                onDelete={isSubadmin ? handleDelete : undefined}
            />

            {/* Modal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
                    <div
                        className="bg-gray-800 rounded-xl w-[95%] sm:w-full sm:max-w-md border border-gray-700 shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 sm:p-6 border-b border-gray-700 flex justify-between items-center">
                            <h3 className="text-lg sm:text-xl font-bold text-white">
                                {modalMode === 'create' ? 'Agregar cuenta bancaria' : 'Editar cuenta bancaria'}
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-white transition"
                            >
                                ✕
                            </button>
                        </div>

                        <CollaboratorBankForm
                            bankName={collabBankName}
                            setBankName={setCollabBankName}
                            accountType={accountType}
                            setAccountType={setAccountType}
                            customAccountType={customAccountType}
                            setCustomAccountType={setCustomAccountType}
                            accountNumber={accountNumber}
                            setAccountNumber={setAccountNumber}
                            accountHolder={accountHolder}
                            setAccountHolder={setAccountHolder}
                            documentType={documentType}
                            setDocumentType={setDocumentType}
                            customDocumentType={customDocumentType}
                            setCustomDocumentType={setCustomDocumentType}
                            documentNumber={documentNumber}
                            setDocumentNumber={setDocumentNumber}
                            isActive={collabBankIsActive}
                            setIsActive={setCollabBankIsActive}
                            modalMode={modalMode}
                            loading={loading}
                            onSubmit={handleSubmitCollabBank}
                            onCancel={() => setIsModalOpen(false)}
                        />
                    </div>
                </div>,
                document.body
            )}

            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDelete}
                title="Eliminar cuenta bancaria"
                message={`¿Estás seguro de que deseas eliminar la cuenta bancaria "${bankToDelete?.bankName}"?`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                confirmButtonClass="bg-red-600 hover:bg-red-500"
            />
        </div>
    );
};

// Collaborator Banks Table Component
const CollaboratorBanksTable: React.FC<{
    banks: CollaboratorBankAccount[];
    loading: boolean;
    isAdmin: boolean;
    onEdit?: (bank: CollaboratorBankAccount) => void;
    onDelete?: (bank: CollaboratorBankAccount) => void;
}> = ({ banks, loading, isAdmin, onEdit, onDelete }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead className="text-gray-400 border-b border-gray-700">
                <tr>
                    {isAdmin && <th className="p-4">Colaborador</th>}
                    <th className="p-4">Banco</th>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Número de cuenta</th>
                    <th className="p-4">Titular</th>
                    <th className="p-4">Documento</th>
                    <th className="p-4 text-center">Estado</th>
                    {onEdit && onDelete && <th className="p-4 text-center">Acciones</th>}
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
                {loading && banks.length === 0 ? (
                    <tr>
                        <td colSpan={isAdmin ? 8 : 7} className="p-8 text-center text-gray-400">Cargando...</td>
                    </tr>
                ) : banks.length === 0 ? (
                    <tr>
                        <td colSpan={isAdmin ? 8 : 7} className="p-8 text-center text-gray-400">
                            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p>No hay cuentas bancarias registradas</p>
                        </td>
                    </tr>
                ) : (
                    banks.map(bank => (
                        <tr key={bank.id} className="hover:bg-gray-800/50 transition">
                            {isAdmin && (
                                <td className="p-4">
                                    <div>
                                        <div className="font-medium text-white">{bank.user?.name}</div>
                                        <div className="text-xs text-gray-400">{bank.user?.email}</div>
                                    </div>
                                </td>
                            )}
                            <td className="p-4 font-medium text-white">{bank.bankName}</td>
                            <td className="p-4 text-gray-300">{bank.accountType}</td>
                            <td className="p-4 text-gray-300 font-mono text-sm">{bank.accountNumber}</td>
                            <td className="p-4 text-gray-300">{bank.accountHolder}</td>
                            <td className="p-4 text-gray-300 text-sm">
                                {bank.documentType}: {bank.documentNumber}
                            </td>
                            <td className="p-4 text-center">
                                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-bold ${bank.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {bank.isActive ? 'Activo' : 'Inactivo'}
                                </div>
                            </td>
                            {onEdit && onDelete && (
                                <td className="p-4">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(bank)}
                                            className="p-2 hover:bg-gray-700 rounded-lg text-blue-400 transition"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => onDelete(bank)}
                                            className="p-2 hover:bg-gray-700 rounded-lg text-red-400 transition"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            )}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    </div>
);

// Collaborator Bank Form Component
const CollaboratorBankForm: React.FC<{
    bankName: string;
    setBankName: (value: string) => void;
    accountType: string;
    setAccountType: (value: string) => void;
    customAccountType: string;
    setCustomAccountType: (value: string) => void;
    accountNumber: string;
    setAccountNumber: (value: string) => void;
    accountHolder: string;
    setAccountHolder: (value: string) => void;
    documentType: string;
    setDocumentType: (value: string) => void;
    customDocumentType: string;
    setCustomDocumentType: (value: string) => void;
    documentNumber: string;
    setDocumentNumber: (value: string) => void;
    isActive: boolean;
    setIsActive: (value: boolean) => void;
    modalMode: 'create' | 'edit';
    loading: boolean;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
}> = ({
    bankName, setBankName, accountType, setAccountType, customAccountType, setCustomAccountType,
    accountNumber, setAccountNumber, accountHolder, setAccountHolder,
    documentType, setDocumentType, customDocumentType, setCustomDocumentType,
    documentNumber, setDocumentNumber, isActive, setIsActive, modalMode, loading, onSubmit, onCancel
}) => (
        <form onSubmit={onSubmit} className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
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

            <div>
                <label className="block text-sm text-gray-400 mb-1">Tipo de cuenta</label>
                <select
                    value={accountType}
                    onChange={(e) => {
                        setAccountType(e.target.value);
                        if (e.target.value !== 'OTRO') {
                            setCustomAccountType('');
                        }
                    }}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                    required
                >
                    <option value="AHORROS">Ahorros</option>
                    <option value="CORRIENTE">Corriente</option>
                    <option value="OTRO">Otro</option>
                </select>
            </div>

            {accountType === 'OTRO' && (
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Especificar tipo de cuenta</label>
                    <input
                        type="text"
                        value={customAccountType}
                        onChange={(e) => setCustomAccountType(e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                        placeholder="Ej: Nómina, Empresarial, etc."
                        required
                    />
                </div>
            )}

            <div>
                <label className="block text-sm text-gray-400 mb-1">Número de cuenta</label>
                <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                    placeholder="Ej: 1234567890"
                    required
                />
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Nombre del titular</label>
                <input
                    type="text"
                    value={accountHolder}
                    onChange={(e) => setAccountHolder(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                    placeholder="Ej: Juan Pérez"
                    required
                />
            </div>

            <div>
                <label className="block text-sm text-gray-400 mb-1">Tipo de documento</label>
                <select
                    value={documentType}
                    onChange={(e) => {
                        setDocumentType(e.target.value);
                        if (e.target.value !== 'OTRO') {
                            setCustomDocumentType('');
                        }
                    }}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                    required
                >
                    <option value="DNI">DNI</option>
                    <option value="PASAPORTE">Pasaporte</option>
                    <option value="RUC">RUC</option>
                    <option value="CEDULA">Cédula</option>
                    <option value="OTRO">Otro</option>
                </select>
            </div>

            {documentType === 'OTRO' && (
                <div>
                    <label className="block text-sm text-gray-400 mb-1">Especificar tipo de documento</label>
                    <input
                        type="text"
                        value={customDocumentType}
                        onChange={(e) => setCustomDocumentType(e.target.value)}
                        className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                        placeholder="Ej: Carnet de extranjería, etc."
                        required
                    />
                </div>
            )}

            <div>
                <label className="block text-sm text-gray-400 mb-1">Número de documento</label>
                <input
                    type="text"
                    value={documentNumber}
                    onChange={(e) => setDocumentNumber(e.target.value)}
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-accent focus:border-accent"
                    placeholder="Ej: 1234567890"
                    required
                />
            </div>

            {modalMode === 'edit' && (
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="collabBankActive"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-accent focus:ring-accent"
                    />
                    <label htmlFor="collabBankActive" className="ml-2 text-sm text-gray-300">
                        Cuenta activa (visible para usuarios)
                    </label>
                </div>
            )}

            <div className="pt-4 flex gap-3">
                <button
                    type="button"
                    onClick={onCancel}
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
    );
