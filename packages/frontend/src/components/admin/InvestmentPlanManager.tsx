import React, { useState, useEffect } from 'react';
import { investmentPlanService, InvestmentPlan } from '../../services/investmentPlanService';

export const InvestmentPlanManager: React.FC = () => {
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
        doublingTime: '',
        description: '',
    });

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

    const handleDelete = async (id: string) => {
        if (window.confirm('¿Estás seguro de eliminar este plan?')) {
            try {
                await investmentPlanService.deletePlan(id);
                loadPlans();
            } catch (err) {
                setError('Error al eliminar el plan');
                console.error(err);
            }
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
            doublingTime: plan.doublingTime,
            description: plan.description || '',
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
            doublingTime: '',
            description: '',
        });
    };

    return (
        <div className="space-y-8">
            <div className="card p-6 rounded-xl border border-gray-700">
                <h2 className="text-2xl font-bold text-white mb-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                    <div key={plan.id} className="card p-6 rounded-xl border border-gray-700 bg-gray-800/50">
                        <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold text-accent">{plan.name}</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(plan)}
                                    className="text-blue-400 hover:text-blue-300"
                                >
                                    ✏️
                                </button>
                                <button
                                    onClick={() => handleDelete(plan.id)}
                                    className="text-red-400 hover:text-red-300"
                                >
                                    🗑️
                                </button>
                            </div>
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
                                <span>Duplica en:</span>
                                <span className="font-bold text-accent">{plan.doublingTime}</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
