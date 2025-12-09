import React, { useState, useEffect } from 'react';
import { investmentPlanService, InvestmentPlan } from '../../services/investmentPlanService';
import { useAuthStore } from '../../store/authStore';
import { ConfirmModal } from '../modals/ConfirmModal';

export const InvestmentPlanManager: React.FC = () => {
    const { user } = useAuthStore();
    const isSuperAdmin = user?.role === 'SUPERADMIN';
    const [plans, setPlans] = useState<InvestmentPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingPlan, setEditingPlan] = useState<InvestmentPlan | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        minCapital: '',
        minDailyReturn: '',
        maxDailyReturn: '',
        dailyAverage: '',
        monthlyCommission: '',
        referralCommissionRate: '', // Defaults to 0.10 (10%) usually but blank here
        doublingTime: '',
    });

    // Delete modal state
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [planToDelete, setPlanToDelete] = useState<{ id: string, name: string } | null>(null);

    // Animation state
    const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data = await investmentPlanService.getAllPlans();
            setPlans(data);
        } catch (err) {
            setError('Error al cargar los planes');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const planData = {
                ...formData,
                minCapital: parseFloat(formData.minCapital),
                minDailyReturn: parseFloat(formData.minDailyReturn),
                maxDailyReturn: parseFloat(formData.maxDailyReturn),
                dailyAverage: parseFloat(formData.dailyAverage),
                monthlyCommission: parseFloat(formData.monthlyCommission),
                referralCommissionRate: parseFloat(formData.referralCommissionRate),
            };

            if (editingPlan) {
                await investmentPlanService.updatePlan(editingPlan.id, planData);
            } else {
                await investmentPlanService.createPlan(planData);
            }
            loadPlans();
            resetForm();
        } catch (err: any) {
            setError('Error al guardar el plan');
            console.error(err);
        }
    };

    const handleDelete = (plan: InvestmentPlan) => {
        setPlanToDelete({ id: plan.id, name: plan.name });
        setShowDeleteModal(true);
    };

    const confirmDeletePlan = async () => {
        if (!planToDelete) return;

        try {
            // Trigger animation
            setDeletingPlanId(planToDelete.id);
            setShowDeleteModal(false); // Close modal immediately

            // Wait for animation to finish (600ms matches CSS animation duration)
            await new Promise(resolve => setTimeout(resolve, 600));

            await investmentPlanService.deletePlan(planToDelete.id);
            loadPlans();
        } catch (err) {
            setError('Error al eliminar el plan');
            console.error(err);
            setDeletingPlanId(null); // Reset animation state on error
        } finally {
            setPlanToDelete(null);
        }
    };

    const handleEdit = (plan: InvestmentPlan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            minCapital: plan.minCapital.toString(),
            minDailyReturn: plan.minDailyReturn.toString(),
            maxDailyReturn: plan.maxDailyReturn.toString(),
            dailyAverage: plan.dailyAverage.toString(),
            monthlyCommission: plan.monthlyCommission.toString(),
            referralCommissionRate: (plan.referralCommissionRate || 0.10).toString(),
            doublingTime: plan.doublingTime,
        });
    };

    const resetForm = () => {
        setEditingPlan(null);
        setFormData({
            name: '',
            minCapital: '',
            minDailyReturn: '',
            maxDailyReturn: '',
            dailyAverage: '',
            monthlyCommission: '',
            referralCommissionRate: '',
            doublingTime: '',
        });
    };

    return (
        <div className="card p-6 rounded-xl border-t-4 border-accent space-y-8">
            {/* Section Header */}

            <div className="p-6 bg-gray-800 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-2">Configuración de planes de inversión</h3>
                <p className="text-gray-400">
                    Define las reglas y parámetros de los planes de inversión ofrecidos.
                    Estos valores (como el promedio diario) se utilizan para <b>marketing y proyecciones</b> en la calculadora del usuario,
                    pero no determinan el pago real diario (eso se hace en "Rentabilidad").
                </p>
                {loading && <p className="text-accent mt-2">Cargando planes...</p>}
                {error && <p className="text-red-500 mt-2">{error}</p>}
            </div>

            {!isSuperAdmin && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 p-4 rounded-lg mb-6">
                    <p className="text-sm font-semibold">ℹ️ Como SUBADMIN, solo puedes visualizar los planes de inversión. No tienes permisos para crear, editar o eliminar.</p>
                </div>
            )}
            {isSuperAdmin && (
                <div className="card-s p-4 sm:p-6 rounded-xl border border-gray-700">
                    <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">
                        {editingPlan ? 'Editar plan' : 'Crear nuevo plan de inversión'}
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Nombre del plan</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Capital mínimo (USDT)</label>
                            <input
                                type="number"
                                value={formData.minCapital}
                                onChange={(e) => setFormData({ ...formData, minCapital: e.target.value })}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Rentabilidad mínima (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.minDailyReturn}
                                onChange={(e) => setFormData({ ...formData, minDailyReturn: e.target.value })}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Rentabilidad máxima (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.maxDailyReturn}
                                onChange={(e) => setFormData({ ...formData, maxDailyReturn: e.target.value })}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Promedio diario (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.dailyAverage}
                                onChange={(e) => setFormData({ ...formData, dailyAverage: e.target.value })}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Comisión mensual (%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.monthlyCommission}
                                onChange={(e) => setFormData({ ...formData, monthlyCommission: e.target.value })}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Comisión Referido (0.10 = 10% | 0.05 = 5%)</label>
                            <input
                                type="number"
                                step="0.01"
                                value={formData.referralCommissionRate}
                                onChange={(e) => setFormData({ ...formData, referralCommissionRate: e.target.value })}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Tiempo para duplicar</label>
                            <input
                                type="text"
                                value={formData.doublingTime}
                                onChange={(e) => setFormData({ ...formData, doublingTime: e.target.value })}
                                className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent"
                                required
                            />
                        </div>
                        <div className="md:col-span-2">
                            <button
                                type="submit"
                                className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition duration-200"
                            >
                                {editingPlan ? 'Actualizar plan' : 'Crear plan'}
                            </button>
                            {editingPlan && (
                                <button
                                    type="button"
                                    onClick={resetForm}
                                    className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition duration-200"
                                >
                                    Cancelar edición
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {plans.map((plan) => (
                    <div
                        key={plan.id}
                        className={`card-s p-4 sm:p-6 rounded-xl border border-gray-700 bg-gray-800/50 ${deletingPlanId === plan.id ? 'disintegrate' : ''
                            }`}
                    >
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-accent">{plan.name}</h3>
                            {isSuperAdmin && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEdit(plan)}
                                        className="text-blue-400 hover:text-blue-300"
                                        title="Editar plan"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDelete(plan)}
                                        className="text-red-400 hover:text-red-300"
                                        title="Eliminar plan"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2 text-sm text-gray-300">
                            <p className="flex justify-between">
                                <span>Capital mínimo:</span>
                                <span className="font-bold text-white">${plan.minCapital}</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Rentabilidad diaria:</span>
                                <span className="font-bold text-profit">{plan.minDailyReturn}% - {plan.maxDailyReturn}%</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Promedio diario:</span>
                                <span className="font-bold text-profit">{plan.dailyAverage}%</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Comisión mensual:</span>
                                <span className="font-bold text-white">{plan.monthlyCommission}%</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Comisión Referido:</span>
                                <span className="font-bold text-profit">{(plan.referralCommissionRate * 100).toFixed(1)}%</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Duplica en:</span>
                                <span className="font-bold text-accent">{plan.doublingTime}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Delete Confirmation Modal */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={confirmDeletePlan}
                title="Confirmar eliminación"
                message={`Deseas eliminar el plan "${planToDelete?.name}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                confirmButtonClass="bg-red-600 hover:bg-red-500"
            />
        </div>
    );
};
