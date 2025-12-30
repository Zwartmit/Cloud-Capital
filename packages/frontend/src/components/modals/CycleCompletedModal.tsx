import { useState } from 'react';

interface Props {
    isOpen: boolean;
    totalProfit: number;
    onClose: () => void;
    onWithdrawProfit: () => void;
    onReinvest: () => void;
    onLogout: () => void;
}

export const CycleCompletedModal = ({ isOpen, totalProfit, onWithdrawProfit, onReinvest, onLogout, onClose }: Props) => {
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
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            {/* Modal Content */}
            <div className="relative w-full max-w-lg overflow-hidden bg-gray-900 border border-gray-800 shadow-2xl rounded-2xl">

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

                <div className="relative p-6 sm:p-8 text-center">
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

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-3 mb-6">
                        <button
                            onClick={handleWithdrawAll}
                            disabled={loading}
                            className="w-full py-4 px-6 text-lg font-bold text-white transition-all transform rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            💰 Retirar Profit y Capital
                        </button>

                        <button
                            onClick={handleReinvest}
                            disabled={loading}
                            className="w-full py-4 px-6 text-lg font-bold text-white transition-all transform rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            🔄 Reinvertir (Nuevo Ciclo)
                        </button>

                        <button
                            onClick={onLogout}
                            disabled={loading}
                            className="w-full py-3 px-6 text-sm font-medium text-gray-400 transition-colors bg-transparent border border-gray-700 rounded-xl hover:bg-gray-800 hover:text-white disabled:opacity-50"
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
