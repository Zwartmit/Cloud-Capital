import { useEffect, useState } from 'react';
import { contractService, CycleProgress, ContractStatus } from '../../services/contractService';
import { investmentPlanService, InvestmentPlan } from '../../services/investmentPlanService';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';

export const CycleProgressCard = () => {
    const [progress, setProgress] = useState<CycleProgress | null>(null);
    const [contractStatus, setContractStatus] = useState<ContractStatus | null>(null);
    const [plans, setPlans] = useState<InvestmentPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [progressData, statusData, plansData] = await Promise.all([
                    contractService.getCycleProgress(),
                    contractService.getContractStatus(),
                    investmentPlanService.getAllPlans()
                ]);
                setProgress(progressData);
                setContractStatus(statusData);
                setPlans(plansData);
            } catch (err: any) {
                setError(err.message || 'Error al cargar datos');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="card p-6 rounded-2xl border border-gray-700 bg-gray-800 shadow-xl">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-gray-700 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-700 rounded w-full"></div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="h-20 bg-gray-700 rounded"></div>
                        <div className="h-20 bg-gray-700 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="card p-6 rounded-2xl border border-red-500/30 bg-gray-800/50">
                <p className="text-red-400">Error: {error}</p>
            </div>
        );
    }

    // Fix: Users with capital but 'PENDING_PLAN_SELECTION' should see the passive income state.
    // We check if investmentClass is present to confirm they are subscribed to a plan.
    const hasActivePlan = contractStatus?.investmentClass;
    const hasCapital = (contractStatus?.currentBalanceUSDT ?? 0) > 0;
    const passiveIncomeRate = contractStatus?.passiveIncomeRate ?? 0;

    // SCENARIO 1: User with capital but no plan (Passive Income Mode)
    if (!hasActivePlan && hasCapital) {
        const monthlyRate = passiveIncomeRate * 100; // Convert 0.03 to 3, 0.06 to 6
        const dailyRate = ((passiveIncomeRate * 100) / 30).toFixed(1); // 1 decimal for display
        const isUpgraded = passiveIncomeRate >= 0.06; // Compare with decimal

        return (
            <div className={`card p-6 rounded-2xl border-l-4 ${isUpgraded ? 'border-purple-500' : 'border-green-500'} bg-gray-800 shadow-xl relative overflow-hidden group hover:border-l-[6px] transition-all duration-300`}>
                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Inversión Pasiva Activa</h3>
                            <p className={`text-2xl font-bold ${isUpgraded ? 'text-purple-400' : 'text-green-400'} mb-1`}>
                                {monthlyRate}% Mensual
                            </p>
                            <p className="text-sm text-gray-400">
                                {isUpgraded ? '¡Tasa mejorada por referidos!' : 'Ganancias automáticas diarias'}
                            </p>
                        </div>
                        <div className={`p-3 rounded-xl ${isUpgraded ? 'bg-purple-500/10' : 'bg-green-500/10'}`}>
                            <TrendingUp className={`w-6 h-6 ${isUpgraded ? 'text-purple-400' : 'text-green-400'}`} />
                        </div>
                    </div>

                    {/* Stats Grid - 3 metrics */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        {/* Metric 1: Daily Rate */}
                        <div className="p-3 rounded-xl bg-gray-700/30 border border-gray-600/30">
                            <p className="text-xs text-gray-400 mb-1">Tasa diaria</p>
                            <p className={`text-xl font-bold ${isUpgraded ? 'text-purple-400' : 'text-green-400'}`}>
                                {dailyRate}%
                            </p>
                        </div>

                        {/* Metric 2: Monthly Earnings Estimate */}
                        <div className="p-3 rounded-xl bg-gray-700/30 border border-gray-600/30">
                            <p className="text-xs text-gray-400 mb-1">Ganancia mensual</p>
                            <p className={`text-xl font-bold ${isUpgraded ? 'text-purple-400' : 'text-green-400'}`}>
                                ${(() => {
                                    const value = (contractStatus?.capitalUSDT || 0) * passiveIncomeRate;
                                    // Remove trailing zeros: 6.00 → 6, 6.78 → 6.78, 6.70 → 6.7
                                    return parseFloat(value.toFixed(2)).toString();
                                })()}
                            </p>
                        </div>

                        {/* Metric 3: Daily Earnings Estimate */}
                        <div className="p-3 rounded-xl bg-gray-700/30 border border-gray-600/30">
                            <p className="text-xs text-gray-400 mb-1">Ganancia diaria</p>
                            <p className={`text-xl font-bold ${isUpgraded ? 'text-purple-400' : 'text-green-400'}`}>
                                ${(() => {
                                    const value = (contractStatus?.capitalUSDT || 0) * (passiveIncomeRate / 30);
                                    // Remove trailing zeros: 0.200 → 0.2, 0.226 → 0.226, 0.220 → 0.22
                                    return parseFloat(value.toFixed(3)).toString();
                                })()}
                            </p>
                        </div>
                    </div>

                    {/* Info Message */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 mb-3">
                        <p className="text-xs text-blue-400 font-semibold mb-1">💡 ¿Sabías que...?</p>
                        <p className="text-xs text-gray-300">
                            {isUpgraded
                                ? 'Tienes la tasa mejorada del 6% por haber referido a alguien. Al suscribirte a un plan, obtendrás rendimientos aún mayores.'
                                : (() => {
                                    const minReturn = Math.min(...plans.map(p => p.minDailyReturn)).toFixed(1);
                                    const maxReturn = Math.max(...plans.map(p => p.maxDailyReturn)).toFixed(1);
                                    return `Al suscribirte a un plan de inversión, puedes obtener rendimientos diarios de hasta ${minReturn}% - ${maxReturn}% (mucho más que el ${dailyRate}% actual).`;
                                })()}
                        </p>
                    </div>
                </div>

                {/* Decorative background blur */}
                <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${isUpgraded ? 'bg-purple-500/20' : 'bg-green-500/20'} rounded-full blur-3xl pointer-events-none`} />
            </div>
        );
    }

    // SCENARIO 2: New User / No Capital and No Plan
    if (!hasActivePlan && !hasCapital) {
        return (
            <div className="card p-6 rounded-2xl border-l-4 border-gray-500 bg-gray-800 shadow-xl relative overflow-hidden group hover:border-l-[6px] transition-all duration-300">
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Estado del ciclo</h3>
                        <p className="text-2xl font-bold text-gray-400 mb-1">Sin inversión activa</p>
                        <p className="text-sm text-gray-500">Realiza tu primer aporte para comenzar a generar ingresos pasivos del 3% mensual.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-gray-700/50">
                        <AlertCircle className="w-6 h-6 text-gray-400" />
                    </div>
                </div>
                {/* Decorative background blur */}
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-gray-700/20 rounded-full blur-3xl pointer-events-none" />
            </div>
        );
    }

    // SCENARIO 3: Active User with Plan
    const daysRemaining = contractStatus?.daysRemaining ?? 0;
    const progressPercentage = progress?.progressPercentage ?? 0;
    const startDate = contractStatus?.currentPlanStartDate
        ? new Date(contractStatus.currentPlanStartDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
        : '-';

    return (
        <div className="card p-5 sm:p-6 rounded-2xl border-l-4 border-accent bg-gray-800 shadow-xl relative overflow-hidden hover:border-l-[6px] transition-all duration-300 group">

            {/* Header */}
            <div className="flex justify-between items-center mb-6 relative z-10">
                <div>
                    <h3 className="text-xs sm:text-sm font-bold text-gray-300 uppercase tracking-wider mb-1">
                        Progreso del Ciclo
                    </h3>
                    <p className="text-[10px] sm:text-xs text-gray-400">Meta: 200% del capital inicial</p>
                </div>
                <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <TrendingUp className="w-5 h-5 text-accent" />
                </div>
            </div>

            {/* Plan Expired Info - Show passive income message */}
            {daysRemaining <= 0 && !progress?.isCompleted && (
                <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center gap-3 relative z-10">
                    <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-bold text-blue-400">Plan expirado - Modo pasivo activo</p>
                        <p className="text-xs text-gray-300">Ahora estás generando {passiveIncomeRate * 100}% mensual en modo pasivo. Renueva tu plan para obtener mayores rendimientos.</p>
                    </div>
                </div>
            )}

            {/* Main Progress Bar */}
            <div className="relative z-10 mb-6">
                <div className="flex justify-between text-xs mb-2">
                    <span className="text-gray-400 font-medium">{progressPercentage.toFixed(1)}% Completado</span>
                    <span className="text-accent font-bold">${progress?.totalProfit.toFixed(2)} Generado</span>
                </div>
                <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden shadow-inner">
                    <div
                        className="h-full bg-gradient-to-r from-blue-600 to-accent rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                        style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 relative z-10">
                {/* Start Date */}
                <div className="p-3 rounded-xl bg-gray-700/30 border border-gray-600/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <svg className="w-3 h-3 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Iniciado el</span>
                    </div>
                    <p className="text-lg font-bold text-white whitespace-nowrap">
                        {startDate}
                    </p>
                </div>

                {/* Days Remaining */}
                <div className="p-3 rounded-xl bg-gray-700/30 border border-gray-600/30 backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-3 h-3 text-orange-400" />
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Tiempo Restante</span>
                    </div>
                    {daysRemaining > 0 ? (
                        <p className="text-xl font-bold text-white">
                            {daysRemaining} <span className="text-xs font-normal text-gray-400">días</span>
                        </p>
                    ) : !progress?.isCompleted ? (
                        <div className="space-y-2">
                            <p className="text-xl font-bold text-red-400">
                                Plan expirado
                            </p>
                            <p className="text-[10px] text-gray-300 leading-tight">
                                Suscríbete a un nuevo plan o invierte más capital para seguir generando ganancias
                            </p>
                        </div>
                    ) : (
                        <p className="text-xl font-bold text-emerald-400">
                            Ciclo completado
                        </p>
                    )}
                </div>

                {/* Target Amount */}
                <div className="p-3 rounded-xl bg-gray-700/30 border border-gray-600/30 backdrop-blur-sm col-span-2 lg:col-span-1">
                    <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                        <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Meta (200%)</span>
                    </div>
                    <p className="text-xl font-bold text-white">
                        ${progress?.targetProfit.toFixed(2)}
                    </p>
                    <p className="text-[9px] text-gray-500 mt-1">
                        Basado en todos tus depósitos
                    </p>
                </div>
            </div>

            {/* Completion Badge */}
            {progress?.isCompleted && (
                <div className="mt-5 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 animate-fade-in relative z-10">
                    <div className="bg-emerald-500/20 p-1.5 rounded-full">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-emerald-400">¡Ciclo completado!</p>
                        <p className="text-xs text-emerald-500/80">Puedes retirar tus ganancias ahora.</p>
                    </div>
                </div>
            )}

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none transition-opacity group-hover:opacity-100 opacity-50" />
        </div>
    );
};
