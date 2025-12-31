import React, { useEffect, useState } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuthStore } from '../store/authStore';
import { investmentPlanService, InvestmentPlan } from '../services/investmentPlanService';

import { getPlanColor, getPlanIcon } from '../utils/planStyles';
import { PlanSubscriptionConfirmModal } from '../components/modals/PlanSubscriptionConfirmModal';

export const ClassesPage: React.FC = () => {
    const { user } = useAuthStore();
    const [plans, setPlans] = useState<InvestmentPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const currentBalance = user?.currentBalanceUSDT || 0;
    const referralsCount = user?.referralsCount || 0;

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [selectedPlanForConfirm, setSelectedPlanForConfirm] = useState<InvestmentPlan | null>(null);

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

    const handleJoinClick = (plan: InvestmentPlan) => {
        setSelectedPlanForConfirm(plan);
        setShowConfirmModal(true);
    };

    const handleConfirmSubscription = async () => {
        if (!selectedPlanForConfirm) return;

        try {
            setLoading(true);
            const result = await investmentPlanService.changeInvestmentPlan(selectedPlanForConfirm.name);

            // The result can be the user object (legacy) or { user, chargeDetails } (new)
            // We need to handle both or assume the service returns the right structure
            // Based on my backend change, it returns { user, chargeDetails }

            // Typescript might complain if service return type isn't updated, but assuming dynamic for now
            // or we cast it. 
            // Ideally, we should update the frontend service type definition too.
            // For now let's assume result is the object we need or contains the user

            const updatedUser = result.user || result;
            const chargeDetails = result.chargeDetails;

            // Update the auth store with the new user data
            useAuthStore.getState().updateUser(updatedUser);

            // Show success message with details if available
            let message = `¡Felicidades! Te has unido exitosamente al plan ${selectedPlanForConfirm.name}.`;
            if (chargeDetails) {
                message += `\n\nSe cobró una comisión de $${chargeDetails.totalCharged.toFixed(2)}`;
            }
            alert(message);

            setShowConfirmModal(false);
            setSelectedPlanForConfirm(null);

            // Reload plans to refresh the UI
            await loadPlans();
        } catch (err: any) {
            console.error('Error joining plan:', err);
            // Close modal on error so user can see the error
            setShowConfirmModal(false);
            setError(err.response?.data?.error || 'Error al unirse al plan');
            alert(err.response?.data?.error || 'Error al unirse al plan. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 border-b border-secondary pb-4">
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-accent mb-2">
                            Planes de inversión
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base">
                            Descubre los diferentes niveles de inversión y sus beneficios.
                        </p>
                        <div className="mt-4 inline-flex items-center space-x-2 px-4 py-2 rounded-lg bg-secondary border border-accent">
                            <span className="text-gray-400">Tu plan actual:</span>
                            <span className={`font-bold ${getPlanColor(user?.investmentClass || '')}`}>
                                {user?.investmentClass || 'N/A'}
                            </span>
                        </div>
                    </div>

                    {loading && !showConfirmModal ? (
                        <div className="text-center text-white">Cargando planes...</div>
                    ) : error ? (
                        <div className="text-center text-red-500">{error}</div>
                    ) : (
                        <>
                            {/* Passive Income Section */}
                            <div className="mb-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* 3% Card */}
                                    <div className="card p-6 rounded-xl border border-green-500/30 bg-gradient-to-br from-green-900/20 to-emerald-900/20">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                            <h4 className="text-lg font-bold text-green-400 uppercase">
                                                Inversión Pasiva - 3% Mensual
                                            </h4>
                                        </div>
                                        <p className="text-sm text-gray-300 mb-6">
                                            Al realizar tu <span className="font-bold text-white">primer depósito</span>,
                                            recibes automáticamente <span className="font-bold text-green-400">3% mensual</span> (0.1% diario)
                                            sobre tu capital.
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-green-400 mb-1">3%</div>
                                                <div className="text-xs text-gray-500">Mensual</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-green-400 mb-1">0.1%</div>
                                                <div className="text-xs text-gray-500">Diario</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white mb-1">$50</div>
                                                <div className="text-xs text-gray-500">Mínimo</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-green-400 mb-1">✓ Sin costo</div>
                                                <div className="text-xs text-gray-500">Costo mensual (Gestión operativa)</div>
                                            </div>
                                        </div>

                                        <div className="text-center py-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                            <div className="text-xs text-gray-400">✓ Ganancias aplicadas diariamente</div>
                                        </div>
                                    </div>

                                    {/* 6% Card */}
                                    <div className="card p-6 rounded-xl border border-purple-500/30 bg-gradient-to-br from-purple-900/20 to-pink-900/20">
                                        <div className="flex items-center gap-2 mb-4">
                                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                            <h4 className="text-lg font-bold text-purple-400 uppercase">
                                                Inversión Pasiva - 6% Mensual
                                            </h4>
                                        </div>
                                        <p className="text-sm text-gray-300 mb-6">
                                            Al <span className="font-bold text-white">referir a alguien</span> que deposite,
                                            tu tasa aumenta a <span className="font-bold text-purple-400">6% mensual</span> (0.2% diario).
                                            Además, recibes un <span className="font-bold text-yellow-400">bono del 10%</span> de su depósito.
                                        </p>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-purple-400 mb-1">6%</div>
                                                <div className="text-xs text-gray-500">Mensual</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-3xl font-bold text-purple-400 mb-1">0.2%</div>
                                                <div className="text-xs text-gray-500">Diario</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-white mb-1">$50</div>
                                                <div className="text-xs text-gray-500">Mínimo</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-2xl font-bold text-yellow-400 mb-1">+10%</div>
                                                <div className="text-xs text-gray-500">Bono Referido</div>
                                            </div>
                                        </div>

                                        <div className="text-center py-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                            <div className="text-xs text-gray-400">✓ Requiere 1 referido activo</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Important Notes */}
                                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg mb-8">
                                    <h4 className="text-sm font-bold text-blue-400 mb-2">📌 Notas Importantes:</h4>
                                    <ul className="text-xs text-gray-300 space-y-1">
                                        <li>• Las ganancias pasivas se aplican <span className="font-bold">diariamente</span> de forma automática</li>
                                        <li>• Al suscribirte a un plan, las ganancias del plan <span className="font-bold">reemplazan</span> las pasivas</li>
                                        <li>• El costo mensual de gestión operativa se cobra al momento de la suscripción</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Investment Plans Grid */}
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
                                                    <span className="text-xs text-gray-500">Costo mensual (Gestión operativa)</span>
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
                                                onClick={() => handleJoinClick(plan)}
                                                disabled={!isUnlocked || isCurrentClass}
                                                className={`w-full mt-4 py-2 rounded-lg font-bold transition-all duration-200 ${isCurrentClass
                                                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                                                    : isUnlocked
                                                        ? 'bg-accent hover:bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                                        : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700'
                                                    }`}
                                            >
                                                {isCurrentClass ? 'Plan actual' : isUnlocked ? 'Unirse al plan' : 'Bloqueado'}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}

                    <PlanSubscriptionConfirmModal
                        isOpen={showConfirmModal}
                        onClose={() => setShowConfirmModal(false)}
                        onConfirm={handleConfirmSubscription}
                        plan={selectedPlanForConfirm}
                        userBalance={currentBalance}
                        userCapital={user?.capitalUSDT || 0}
                        isLoading={loading}
                    />
                </div>
            </main>
        </div>
    );
};
