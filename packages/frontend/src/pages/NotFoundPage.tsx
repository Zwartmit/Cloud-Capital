import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Search } from 'lucide-react';

export const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-2xl w-full text-center">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <Search className="w-24 h-24 text-gray-400 animate-pulse" />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-xl font-bold">!</span>
                        </div>
                    </div>
                </div>

                {/* Message */}
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                    Página no encontrada
                </h2>
                <p className="text-gray-400 text-lg mb-8 max-w-md mx-auto">
                    Lo sentimos, la página que buscas no existe o ha sido movida a otra ubicación
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 items-center">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver atrás</span>
                    </button>

                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center space-x-2 px-6 py-3 btn-primary rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                    >
                        <Home className="w-5 h-5" />
                        <span>Ir al inicio</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
