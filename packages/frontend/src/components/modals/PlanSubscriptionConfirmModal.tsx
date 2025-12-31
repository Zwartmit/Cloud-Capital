import React from 'react';
import { Modal } from '../common/Modal';
import { InvestmentPlan } from '../../services/investmentPlanService';

interface PlanSubscriptionConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    plan: InvestmentPlan | null;
    userBalance: number;
    userCapital: number;
    isLoading?: boolean;
}

export const PlanSubscriptionConfirmModal: React.FC<PlanSubscriptionConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    plan,
    userBalance,
    userCapital,
    isLoading = false
}) => {
    if (!plan) return null;

    const availableProfit = Math.max(0, userBalance - userCapital);
    const monthlyCost = (plan.monthlyCommission / 100) * userBalance;

    const deductedFromProfit = Math.min(availableProfit, monthlyCost);
    const deductedFromCapital = Math.max(0, monthlyCost - availableProfit);

    // Calculate resulting balances
    const newBalance = Math.max(0, userBalance - monthlyCost);
    const newCapital = userCapital - deductedFromCapital;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirmar suscripción">
            <div className="space-y-4">
                {/* Plan Info */}
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                    <h3 className="text-lg font-bold text-white mb-2">Plan {plan.name}</h3>
                    <p className="text-sm text-gray-300">
                        Costo mensual (Gestión operativa): <span className="text-blue-400 font-bold">{plan.monthlyCommission}%</span>
                    </p>
                </div>

                {/* Charge Breakdown */}
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-3">
                    <h4 className="text-sm font-bold text-gray-300">Cobro inmediato:</h4>

                    <div className="flex justify-between items-center bg-gray-700/30 p-2 rounded">
                        <span className="text-sm text-gray-400">Monto total a cobrar:</span>
                        <span className="text-lg font-bold text-white">${monthlyCost.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-gray-700 pt-3 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-gray-400">Deducido de profit:</span>
                            <span className="text-green-400 font-medium">-${deductedFromProfit.toFixed(2)}</span>
                        </div>
                        {deductedFromCapital > 0 && (
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-gray-400">Deducido de capital:</span>
                                <span className="text-yellow-400 font-medium">-${deductedFromCapital.toFixed(2)}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Resulting Balances */}
                <div className="bg-gray-800/50 p-4 rounded-lg space-y-2">
                    <h4 className="text-sm font-bold text-gray-300 mb-2">Balance resultante:</h4>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Balance total:</span>
                        <span className="text-white font-bold">${newBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-400">Capital:</span>
                        <span className="text-white font-bold">${newCapital.toFixed(2)}</span>
                    </div>
                </div>

                {/* Warning if capital is affected */}
                {deductedFromCapital > 0 && (
                    <div className="bg-yellow-900/20 border border-yellow-500/30 p-3 rounded-lg flex items-start gap-2">
                        <span className="text-yellow-500 text-lg">⚠️</span>
                        <p className="text-xs text-yellow-300 leading-relaxed">
                            Tu profit disponible no es suficiente para cubrir la comisión completa.
                            Se deducirán <span className="font-bold text-white">${deductedFromCapital.toFixed(2)}</span> de tu capital base.
                        </p>
                    </div>
                )}

                {/* Insufficient Funds Warning */}
                {monthlyCost > userBalance && (
                    <div className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg flex items-start gap-2">
                        <span className="text-red-500 text-lg">❌</span>
                        <p className="text-xs text-red-300 leading-relaxed">
                            Saldo insuficiente. Necesitas al menos <span className="font-bold text-white">${monthlyCost.toFixed(2)}</span> para cubrir la comisión mensual.
                        </p>
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700 transition disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading || monthlyCost > userBalance}
                        className="flex-1 px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600 font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            'Confirmar y pagar'
                        )}
                    </button>
                </div>
            </div>
        </Modal >
    );
};
