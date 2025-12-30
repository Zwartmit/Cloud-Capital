import { useEffect, useState } from 'react';
import { contractService, CycleProgress, ContractStatus } from '../../services/contractService';
import { TrendingUp, Clock, AlertCircle } from 'lucide-react';

export const CycleProgressCard = () => {
    const [progress, setProgress] = useState<CycleProgress | null>(null);
    const [contractStatus, setContractStatus] = useState<ContractStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [progressData, statusData] = await Promise.all([
                    contractService.getCycleProgress(),
                    contractService.getContractStatus()
                ]);
                setProgress(progressData);
                setContractStatus(statusData);
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

    // Fix: Users with capital but 'PENDING_PLAN_SELECTION' should see the "No Active Plan" state.
    // We check if investmentClass is present to confirm they are subscribed to a plan.
    const hasActivePlan = contractStatus?.investmentClass;

    // SCENARIO 1: New User / No Active Plan
    if (!hasActivePlan) {
        return (
            <div className="card p-6 rounded-2xl border-l-4 border-gray-500 bg-gray-800 shadow-xl relative overflow-hidden group hover:border-l-[6px] transition-all duration-300">
                <div className="flex items-start justify-between relative z-10">
                    <div>
                        <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider mb-2">Estado del Ciclo</h3>
                        <p className="text-2xl font-bold text-gray-400 mb-1">Sin plan activo</p>
                        <p className="text-sm text-gray-500">Realiza tu primer aporte o selecciona un plan para iniciar tu ciclo de inversión.</p>
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

    // SCENARIO 2: Active User with Plan
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
                    <p className="text-xs text-gray-500">
                        Objetivo: 200% de retorno
                    </p>
                </div>
                <div className="p-2 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                    <TrendingUp className="w-5 h-5 text-accent" />
                </div>
            </div>

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
                    <p className="text-xl font-bold text-white">
                        {daysRemaining} <span className="text-xs font-normal text-gray-400">días</span>
                    </p>
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
