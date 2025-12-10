import { useState, useEffect } from 'react';
import { X, Clock, AlertTriangle } from 'lucide-react';

interface SessionTimeoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onContinue: () => void;
    remainingSeconds: number;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
    isOpen,
    onClose,
    onContinue,
    remainingSeconds,
}) => {
    const [seconds, setSeconds] = useState(remainingSeconds);

    useEffect(() => {
        setSeconds(remainingSeconds);
    }, [remainingSeconds]);

    useEffect(() => {
        if (!isOpen) return;

        const interval = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    // Auto-close and logout when countdown reaches 0
                    onClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="card p-6 max-w-md w-full mx-4 border-2 border-yellow-500 shadow-2xl animate-pulse-slow">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-8 h-8 text-yellow-500" />
                        <h3 className="text-xl font-bold text-white">Sesión por expirar</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="mb-6">
                    <p className="text-gray-300 mb-4">
                        Tu sesión está a punto de expirar por inactividad
                    </p>

                    <div className="flex items-center justify-center space-x-2 p-4 bg-gray-800 rounded-lg">
                        <Clock className="w-6 h-6 text-yellow-500" />
                        <span className="text-3xl font-bold text-yellow-500">
                            {seconds}s
                        </span>
                    </div>

                    <p className="text-sm text-gray-400 mt-4 text-center">
                        Haz clic en "Continuar" para mantener tu sesión activa
                    </p>
                </div>

                <div className="flex space-x-3">
                    <button
                        onClick={onContinue}
                        className="flex-1 btn-primary py-3 font-semibold rounded-lg"
                    >
                        Continuar
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold transition-colors"
                    >
                        Cerrar sesión
                    </button>
                </div>
            </div>
        </div>
    );
};
