import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { Search } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { investmentPlanService, InvestmentPlan } from '../services/investmentPlanService';

import { getPlanColor, getPlanIcon } from '../utils/planStyles';
import { ReferralsModal } from '../components/modals/ReferralsModal';

export const ClassesPage: React.FC = () => {
    const { user } = useAuthStore();
    const [plans, setPlans] = useState<InvestmentPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);

    const currentBalance = user?.currentBalanceUSDT || 0;
    const referralsCount = user?.referralsCount || 0;

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = async () => {
        try {
            const data = await investmentPlanService.getAllPlans();
            // Sort plans by minCapital
            const sortedPlans = data.sort((a, b) => a.minCapital - b.minCapital);
            setPlans(sortedPlans);
        } catch (err) {
            console.error('Error loading plans:', err);
            setError('Error al cargar los planes de inversión');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinPlan = async (plan: InvestmentPlan) => {
        // Here we would call an API to join the plan
        // For now, we just show an alert or console log
        alert(`Has solicitado unirte al plan ${plan.name}. Esta funcionalidad estará disponible pronto.`);
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 border-b border-secondary pb-4">
                        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                            Planes de Inversión
                        </h1>
                        <p className="text-gray-400 text-sm sm:text-base">
                            Descubre los diferentes niveles de inversión y sus beneficios.
                        </p>
                        <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-secondary border border-accent">
                            <span className="text-gray-400">Tu plan actual:</span>
                            <span className={`font-bold ${getPlanColor(user?.investmentClass || '')}`}>
                                {user?.investmentClass || 'N/A'}
                            </span>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="text-sm text-gray-400">
                                Tu código de referido: <span className="text-accent font-bold text-base ml-1">{user?.referralCode || 'N/A'}</span>
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                <span>Referidos activos: <span className="text-white font-bold">{referralsCount}</span></span>
                                <button
                                    onClick={() => setIsReferralsModalOpen(true)}
                                    className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors border border-gray-700"
                                    title="Ver referidos"
                                >
                                    <Search className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center text-white">Cargando planes...</div>
                    ) : error ? (
                        <div className="text-center text-red-500">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {plans.map((plan) => {
                                const Icon = getPlanIcon(plan.name);
                                const colorClass = getPlanColor(plan.name);

                                const isCurrentClass = user?.investmentClass === plan.name;

                                // Unlock logic
                                const isCapitalMet = currentBalance >= plan.minCapital;
                                const upperName = plan.name.toUpperCase();
                                const isReferralMet = (upperName.includes('PLATINUM') || upperName.includes('DIAMOND'))
                                    ? referralsCount >= 1
                                    : true;
                                const isUnlocked = isCapitalMet && isReferralMet;

                                return (
                                    <div
                                        key={plan.id}
                                        className={`card p-6 rounded-xl transition-all duration-300 ${isCurrentClass
                                            ? 'border-2 border-accent shadow-lg shadow-accent/20'
                                            : 'border border-secondary'
                                            } ${!isUnlocked ? '!bg-gray-900/95 backdrop-blur-xl border-gray-800' : ''}`}
                                    >
                                        {/* Header */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                <div className={`p-3 rounded-lg bg-secondary ${colorClass}`}>
                                                    <Icon className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <h3 className={`font-bold text-lg ${colorClass}`}>
                                                        {plan.name}
                                                    </h3>
                                                    {isCurrentClass && (
                                                        <span className="text-xs text-accent font-semibold">
                                                            PLAN ACTUAL
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            {isUnlocked && (
                                                <div className="text-profit text-2xl">✓</div>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <p className="text-sm text-gray-400 mb-4 min-h-[60px]">
                                            {plan.description || 'Sin descripción'}
                                        </p>

                                        {/* Stats */}
                                        <div className="space-y-3 mb-4">
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">Capital mínimo</span>
                                                <span className="text-sm font-bold text-white">
                                                    ${plan.minCapital.toLocaleString()} USD
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">Rentabilidad diaria</span>
                                                <span className="text-sm font-bold text-profit">
                                                    {plan.minDailyReturn}% - {plan.maxDailyReturn}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">Promedio diario</span>
                                                <span className="text-sm font-bold text-accent">
                                                    {plan.dailyAverage}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">Comisión mensual</span>
                                                <span className="text-sm font-bold text-white">
                                                    {plan.monthlyCommission}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs text-gray-500">Duplicar capital</span>
                                                <span className="text-sm font-bold text-gray-300">
                                                    {plan.doublingTime}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Requirements Warning */}
                                        {!isUnlocked && (
                                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                                                <p className="text-xs text-red-400 font-semibold mb-1">Requisitos faltantes:</p>
                                                {!isCapitalMet && (
                                                    <p className="text-xs text-gray-400">• Capital mínimo: ${plan.minCapital}</p>
                                                )}
                                                {!isReferralMet && (
                                                    <p className="text-xs text-gray-400">• Mínimo 1 referido activo</p>
                                                )}
                                            </div>
                                        )}

                                        {/* Join Button */}
                                        <button
                                            onClick={() => handleJoinPlan(plan)}
                                            disabled={!isUnlocked || isCurrentClass}
                                            className={`w-full mt-4 py-2 rounded-lg font-bold transition-all duration-200 ${isCurrentClass
                                                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                : isUnlocked
                                                    ? 'bg-accent hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                    : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                                }`}
                                        >
                                            {isCurrentClass ? 'Plan Actual' : isUnlocked ? 'Unirse al Plan' : 'Bloqueado'}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>

            <ReferralsModal
                isOpen={isReferralsModalOpen}
                onClose={() => setIsReferralsModalOpen(false)}
            />
        </div>
    );
};
