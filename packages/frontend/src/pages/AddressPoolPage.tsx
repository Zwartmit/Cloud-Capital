import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import * as btcPoolService from '../services/btcPool.service';
import '../styles/AddressPoolPage.css';

interface PoolStats {
    total: number;
    available: number;
    reserved: number;
    used: number;
    percentageAvailable: number;
}

interface Address {
    id: string;
    address: string;
    status: 'AVAILABLE' | 'RESERVED' | 'USED';
    reservedAt?: string;
    usedAt?: string;
    uploadedAt: string;
    requestedAmount?: number;
    adminNotes?: string;
    uploadedByUser: {
        name: string;
        email: string;
    };
    usedByUser?: {
        name: string;
        email: string;
    };
}

export default function AddressPoolPage() {
    const [stats, setStats] = useState<PoolStats | null>(null);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [bulkText, setBulkText] = useState('');
    const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'RESERVED' | 'USED'>('ALL');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [showNotesModal, setShowNotesModal] = useState(false);
    const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
    const [notesText, setNotesText] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, [filter, currentPage]);

    const loadData = async () => {
        try {
            setLoading(true);
            const [statsData, addressesData] = await Promise.all([
                btcPoolService.getPoolStats(),
                btcPoolService.getAddresses({
                    page: currentPage,
                    limit: 20,
                    status: filter === 'ALL' ? undefined : filter,
                }),
            ]);

            setStats(statsData);
            // Sort addresses by uploadedAt in descending order (newest first)
            const sortedAddresses = (addressesData.addresses || []).sort((a: Address, b: Address) =>
                new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
            );
            setAddresses(sortedAddresses);
            setTotalPages(addressesData.totalPages || 1);
        } catch (error: any) {
            console.error('Error loading pool data:', error);
            alert('Error al cargar datos del pool');
        } finally {
            setLoading(false);
        }
    };

    const handleBulkUpload = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!bulkText.trim()) {
            alert('Por favor ingrese al menos una dirección');
            return;
        }

        // Split by newlines and trim
        const addresses = bulkText
            .split('\n')
            .map((addr) => addr.trim())
            .filter((addr) => addr.length > 0);

        if (addresses.length === 0) {
            alert('No se encontraron direcciones válidas');
            return;
        }

        if (!confirm(`¿Desea cargar ${addresses.length} direcciones al pool?`)) {
            return;
        }

        try {
            setUploading(true);
            const result = await btcPoolService.uploadAddresses(addresses);

            alert(
                `Carga exitosa:\n` +
                `✓ ${result.uploaded} direcciones cargadas\n` +
                `⚠️ ${result.duplicates.length} duplicadas\n` +
                `❌ ${result.invalid.length} inválidas`
            );

            setBulkText('');
            loadData(); // Reload pool data
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.error || error.message}`);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (addressId: string) => {
        if (!confirm('¿Está seguro de eliminar esta dirección?')) {
            return;
        }

        try {
            await btcPoolService.deleteAddress(addressId);
            alert('Dirección eliminada exitosamente');
            loadData();
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const handleRelease = async (addressId: string) => {
        if (!confirm('¿Liberar esta dirección para que pueda ser reutilizada?')) {
            return;
        }

        try {
            await btcPoolService.releaseAddress(addressId);
            alert('Dirección liberada exitosamente');
            loadData();
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return 'status-badge available';
            case 'RESERVED':
                return 'status-badge reserved';
            case 'USED':
                return 'status-badge used';
            default:
                return 'status-badge';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'AVAILABLE':
                return 'Disponible';
            case 'RESERVED':
                return 'Reservada';
            case 'USED':
                return 'Usada';
            default:
                return status;
        }
    };

    const handleEditNotes = (addr: Address) => {
        setSelectedAddress(addr);
        setNotesText(addr.adminNotes || '');
        setShowNotesModal(true);
    };

    const handleUpdateNotes = async () => {
        if (!selectedAddress) return;

        try {
            await btcPoolService.updateAddressNotes(selectedAddress.id, notesText);
            alert('Notas actualizadas exitosamente');
            setShowNotesModal(false);
            setSelectedAddress(null);
            loadData();
        } catch (error: any) {
            alert(`Error: ${error.response?.data?.error || error.message}`);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-6 border-b border-gray-700 pb-4">
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-admin">
                            Pool de direcciones BTC
                        </h2>
                    </div>

                    {/* Stats Cards */}
                    {stats && (
                        <div className="stats-grid">
                            <div className="stat-card total">
                                <div className="stat-value">{stats.total}</div>
                                <div className="stat-label">Total direcciones</div>
                            </div>
                            <div className="stat-card available">
                                <div className="stat-value">{stats.available}</div>
                                <div className="stat-label">Disponibles</div>
                                <div className="stat-percentage">{stats.percentageAvailable.toFixed(1)}%</div>
                            </div>
                            <div className="stat-card reserved">
                                <div className="stat-value">{stats.reserved}</div>
                                <div className="stat-label">Reservadas</div>
                            </div>
                            <div className="stat-card used">
                                <div className="stat-value">{stats.used}</div>
                                <div className="stat-label">Usadas</div>
                            </div>
                        </div>
                    )}

                    {/* Upload Section */}
                    <div className="upload-section">
                        <h2>Cargar nuevas direcciones</h2>
                        <form onSubmit={handleBulkUpload}>
                            <textarea
                                className="bulk-input"
                                placeholder="Pega las direcciones BTC aquí, una por línea..."
                                value={bulkText}
                                onChange={(e) => setBulkText(e.target.value)}
                                rows={10}
                                disabled={uploading}
                            />
                            <button type="submit" className="btn-upload" disabled={uploading}>
                                {uploading ? 'Cargando...' : '📤 Cargar direcciones'}
                            </button>
                        </form>
                    </div>

                    {/* Filters */}
                    <div className="filters">
                        <button
                            className={filter === 'ALL' ? 'filter-btn active' : 'filter-btn'}
                            onClick={() => {
                                setFilter('ALL');
                                setCurrentPage(1);
                            }}
                        >
                            Todas
                        </button>
                        <button
                            className={filter === 'AVAILABLE' ? 'filter-btn active' : 'filter-btn'}
                            onClick={() => {
                                setFilter('AVAILABLE');
                                setCurrentPage(1);
                            }}
                        >
                            Disponibles
                        </button>
                        <button
                            className={filter === 'RESERVED' ? 'filter-btn active' : 'filter-btn'}
                            onClick={() => {
                                setFilter('RESERVED');
                                setCurrentPage(1);
                            }}
                        >
                            Reservadas
                        </button>
                        <button
                            className={filter === 'USED' ? 'filter-btn active' : 'filter-btn'}
                            onClick={() => {
                                setFilter('USED');
                                setCurrentPage(1);
                            }}
                        >
                            Usadas
                        </button>
                    </div>

                    {/* Address List */}
                    {loading ? (
                        <div className="loading">Cargando...</div>
                    ) : (
                        <>
                            <div className="address-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Dirección</th>
                                            <th>Estado</th>
                                            <th>Monto Solicitado</th>
                                            <th>Fecha de carga</th>
                                            <th>Usado por</th>
                                            <th>Notas</th>
                                            <th>Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {addresses.map((addr) => (
                                            <tr key={addr.id}>
                                                <td>
                                                    <code className="address-code">{addr.address}</code>
                                                </td>
                                                <td>
                                                    <span className={getStatusBadgeClass(addr.status)}>
                                                        {getStatusText(addr.status)}
                                                    </span>
                                                </td>
                                                <td>
                                                    {addr.requestedAmount ? (
                                                        <span className="text-accent font-semibold">${Number(addr.requestedAmount).toFixed(2)}</span>
                                                    ) : (
                                                        <span className="text-gray-500">-</span>
                                                    )}
                                                </td>
                                                <td>{new Date(addr.uploadedAt).toLocaleDateString()}</td>
                                                <td>
                                                    {addr.usedByUser ? (
                                                        <span>{addr.usedByUser.name}</span>
                                                    ) : addr.status === 'RESERVED' ? (
                                                        <span className="text-muted">Pendiente...</span>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </td>
                                                <td style={{ width: '200px', maxWidth: '200px' }}>
                                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', width: '100%' }}>
                                                        <span
                                                            className="text-xs text-gray-300"
                                                            style={{
                                                                flex: 1,
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                whiteSpace: 'nowrap',
                                                                minWidth: 0
                                                            }}
                                                            title={addr.adminNotes || ''}
                                                        >
                                                            {addr.adminNotes || '-'}
                                                        </span>
                                                        <button
                                                            onClick={() => handleEditNotes(addr)}
                                                            className="btn-delete"
                                                            title="Editar notas"
                                                            style={{ flexShrink: 0 }}
                                                        >
                                                            ✏️
                                                        </button>
                                                    </div>
                                                </td>
                                                <td>
                                                    {addr.status === 'RESERVED' ? (
                                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                            <button
                                                                className="btn-delete"
                                                                onClick={() => handleRelease(addr.id)}
                                                                title="Liberar dirección"
                                                            >
                                                                🔄
                                                            </button>
                                                            <button
                                                                className="btn-delete"
                                                                onClick={() => handleDelete(addr.id)}
                                                                title="Eliminar dirección"
                                                            >
                                                                🗑️
                                                            </button>
                                                        </div>
                                                    ) : addr.status === 'AVAILABLE' ? (
                                                        <button
                                                            className="btn-delete"
                                                            onClick={() => handleDelete(addr.id)}
                                                            title="Eliminar dirección"
                                                        >
                                                            🗑️
                                                        </button>
                                                    ) : null}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="pagination">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                    >
                                        ← Anterior
                                    </button>
                                    <span>
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>

            {/* Notes Modal */}
            {showNotesModal && selectedAddress && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                    onClick={() => setShowNotesModal(false)}
                >
                    <div
                        className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-md w-full mx-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-xl font-bold text-white mb-4">
                            Editar nota
                        </h3>
                        <p className="text-sm text-gray-400 mb-2">
                            Dirección: <code className="text-accent">{selectedAddress.address.substring(0, 20)}...</code>
                        </p>
                        <textarea
                            value={notesText}
                            onChange={(e) => setNotesText(e.target.value)}
                            placeholder="Agregar notas o comentarios..."
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm resize-none"
                            rows={5}
                        />
                        <div className="flex gap-3 mt-4">
                            <button
                                onClick={handleUpdateNotes}
                                className="flex-1 bg-accent hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition"
                            >
                                Guardar
                            </button>
                            <button
                                onClick={() => {
                                    setShowNotesModal(false);
                                    setSelectedAddress(null);
                                }}
                                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
