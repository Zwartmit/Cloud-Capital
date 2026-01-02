import { useState } from 'react';

interface Props {
    isOpen: boolean;
    totalProfit: number;
    availableProfit: number;
    previousWithdrawals?: number;
    onClose: () => void;
    onWithdrawProfit: () => void;
    onReinvest: () => void;
    onLogout: () => void;
}

export const CycleCompletedModal = ({ isOpen, totalProfit, availableProfit, previousWithdrawals = 0, onWithdrawProfit, onReinvest, onLogout, onClose }: Props) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleWithdrawAll = () => {
        setLoading(true);
        try {
            onWithdrawProfit();
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleReinvest = () => {
        onReinvest();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop with blur */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl max-h-[90vh] flex flex-col">

                {/* Decorative Elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600" />
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute z-10 p-2 text-gray-400 transition-colors rounded-full top-4 right-4 hover:bg-gray-800 hover:text-white"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Scrollable Content */}
                <div className="relative p-6 sm:p-8 text-center overflow-y-auto">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 mb-6 rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/50">
                        <svg className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    {/* Header */}
                    <h2 className="mb-2 text-3xl font-bold text-white">
                        ¡Felicitaciones!
                    </h2>
                    <p className="mb-6 text-gray-300">
                        Has completado tu ciclo de inversión alcanzando el <span className="font-bold text-emerald-400">200%</span> de tu capital.
                    </p>

                    {/* Profit Card */}
                    <div className="p-6 mb-6 border bg-gray-800/50 border-gray-700/50 rounded-2xl backdrop-blur-sm">
                        <p className="mb-2 text-sm font-medium text-gray-400 uppercase tracking-wider">
                            Profit Total Generado
                        </p>
                        <div className="flex items-baseline justify-center gap-2">
                            <span className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-500">
                                ${totalProfit.toFixed(2)}
                            </span>
                            <span className="text-sm font-medium text-gray-500">USDT</span>
                        </div>
                    </div>

                    {/* Withdrawal History (if any) */}
                    {previousWithdrawals > 0 && (
                        <div className="p-4 mb-6 border bg-yellow-900/10 border-yellow-600/30 rounded-xl">
                            <p className="mb-3 text-xs font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Retiros Previos Durante el Ciclo
                            </p>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-gray-400">Total retirado:</span>
                                    <span className="font-bold text-yellow-300">-${previousWithdrawals.toFixed(2)} USDT</span>
                                </div>
                                <div className="pt-2 border-t border-yellow-600/20">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-300 font-medium">Profit disponible para retirar:</span>
                                        <span className="font-bold text-emerald-400">${availableProfit.toFixed(2)} USDT</span>
                                    </div>
                                </div>
                            </div>
                            <p className="mt-3 text-[10px] text-gray-500 italic">
                                * El profit disponible es menor porque ya retiraste ${previousWithdrawals.toFixed(2)} USDT durante el ciclo
                            </p>
                        </div>
                    )}

                    {/* Available Profit (if different from total) */}
                    {previousWithdrawals === 0 && availableProfit < totalProfit && (
                        <div className="p-4 mb-6 border bg-blue-900/10 border-blue-600/30 rounded-xl">
                            <p className="mb-2 text-xs font-medium text-blue-400 uppercase tracking-wider">
                                Profit Disponible
                            </p>
                            <div className="flex items-baseline justify-center gap-2">
                                <span className="text-2xl font-bold text-blue-300">
                                    ${availableProfit.toFixed(2)}
                                </span>
                                <span className="text-xs font-medium text-gray-500">USDT</span>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 mb-6">
                        <button
                            onClick={handleWithdrawAll}
                            disabled={loading}
                            className="w-full py-4 px-6 text-lg font-bold text-white transition-all transform rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            💰 Retirar profit
                        </button>

                        <button
                            onClick={handleReinvest}
                            disabled={loading}
                            className="w-full py-4 px-6 text-lg font-bold text-white transition-all transform rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            🔄 Reinvertir (Nuevo ciclo)
                        </button>

                        <button
                            onClick={onLogout}
                            disabled={loading}
                            className="w-full py-3 px-6 text-sm font-medium text-white transition-colors bg-red-600 border border-gray-700 rounded-xl hover:bg-red-700 hover:text-white disabled:opacity-50"
                        >
                            Decidir después (Cerrar sesión)
                        </button>
                    </div>

                    {/* Footer Note */}
                    <p className="text-xs text-gray-500">
                        * Al cerrar esta ventana, podrás continuar navegando en la plataforma.
                        Podrás volver a ver estas opciones en cualquier momento.
                    </p>
                </div>
            </div>
        </div>
    );
};
