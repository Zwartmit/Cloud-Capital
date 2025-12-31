import { useState } from 'react';
import { Modal } from '../common/Modal';
import { TrendingUp, Users, Gift, Sparkles } from 'lucide-react';
import { userService } from '../../services/userService';

interface WelcomeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState(false);

    const handleClose = async () => {
        setLoading(true);
        try {
            await userService.markWelcomeModalSeen();
            onClose();
        } catch (error) {
            console.error('Error marking welcome modal as seen:', error);
            onClose(); // Close anyway
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="¡Te damos la bienvenida a Cloud Capital!"
            maxWidth="2xl"
        >
            <div className="space-y-6">
                {/* Header */}
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-accent to-purple-600 rounded-full mb-4">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        ¡Comienza a ganar desde hoy!
                    </h2>
                    <p className="text-gray-400">
                        Descubre cómo generar ingresos pasivos con Cloud Capital
                    </p>
                </div>

                {/* Benefits Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Benefit 1: First Deposit */}
                    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-green-500/30 p-6 rounded-xl">
                        <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-full mb-4">
                            <TrendingUp className="w-6 h-6 text-green-400" />
                        </div>
                        <h3 className="text-lg font-bold text-green-400 mb-2">
                            3% Mensual
                        </h3>
                        <p className="text-sm text-gray-300">
                            Al realizar tu <span className="font-bold text-white">primer depósito</span>,
                            recibes automáticamente <span className="font-bold text-green-400">3% mensual</span> (0.1% diario)
                            sobre tu capital.
                        </p>
                    </div>

                    {/* Benefit 2: Referrals */}
                    <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-purple-500/30 p-6 rounded-xl">
                        <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-full mb-4">
                            <Users className="w-6 h-6 text-purple-400" />
                        </div>
                        <h3 className="text-lg font-bold text-purple-400 mb-2">
                            6% Mensual
                        </h3>
                        <p className="text-sm text-gray-300">
                            Al <span className="font-bold text-white">referir a alguien</span> que deposite,
                            tu tasa aumenta a <span className="font-bold text-purple-400">6% mensual</span> (0.2% diario).
                        </p>
                    </div>

                    {/* Benefit 3: Bonus */}
                    <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border border-yellow-500/30 p-6 rounded-xl">
                        <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-full mb-4">
                            <Gift className="w-6 h-6 text-yellow-400" />
                        </div>
                        <h3 className="text-lg font-bold text-yellow-400 mb-2">
                            Bono 10%
                        </h3>
                        <p className="text-sm text-gray-300">
                            Recibe un <span className="font-bold text-yellow-400">bono del 10%</span> del
                            primer depósito de cada persona que refier as.
                        </p>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="bg-blue-900/20 border border-blue-500/30 p-4 rounded-lg">
                    <h4 className="text-sm font-bold text-blue-400 mb-2">📌 Notas Importantes:</h4>
                    <ul className="text-xs text-gray-300 space-y-1">
                        <li>• Las ganancias pasivas se aplican <span className="font-bold">diariamente</span> de forma automática</li>
                        <li>• Al suscribirte a un plan, las ganancias del plan <span className="font-bold">reemplazan</span> las pasivas</li>
                        <li>• El bono de referido se suma a tu capital si no tienes inversión, o a tu profit si ya tienes capital</li>
                    </ul>
                </div>

                {/* CTA Button */}
                <div className="flex justify-center pt-4">
                    <button
                        onClick={handleClose}
                        disabled={loading}
                        className="px-8 py-3 bg-gradient-to-r from-accent to-purple-600 hover:from-accent/90 hover:to-purple-600/90 text-white font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-accent/50 disabled:opacity-50"
                    >
                        {loading ? 'Cargando...' : '¡Entendido, comenzar!'}
                    </button>
                </div>
            </div>
        </Modal>
    );
};
