import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackgroundCanvas } from '../components/common/BackgroundCanvas';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { FAQ } from '../components/landing/FAQ';
import { investmentPlanService, InvestmentPlan } from '../services/investmentPlanService';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [plans, setPlans] = useState<InvestmentPlan[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPlans = async () => {
            try {
                const data = await investmentPlanService.getAllPlans();
                setPlans(data);
            } catch (error) {
                console.error('Error loading plans:', error);
            } finally {
                setLoading(false);
            }
        };
        loadPlans();
    }, []);

    return (
        <div className="min-h-screen bg-transparent text-white font-sans">
            <BackgroundCanvas />

            {/* Header/Nav */}
            <header className="sticky top-0 z-20 bg-primary/80 backdrop-blur-md border-b border-secondary">
                <div className="max-w-7xl mx-auto flex justify-between items-center py-3 sm:py-4 px-4 sm:px-6">
                    <div className="text-xl sm:text-2xl font-extrabold text-accent">Cloud Capital</div>
                    <nav className="hidden sm:flex space-x-8 text-gray-400 font-medium text-sm">
                        <a href="#hero" className="hover:text-accent transition-colors">
                            Inicio
                        </a>
                        <a href="#plans-section" className="hover:text-accent transition-colors">
                            Planes
                        </a>
                        <a href="#faq-section" className="hover:text-accent transition-colors">
                            FAQ
                        </a>
                        <a href="#" className="hover:text-accent transition-colors">
                            Contacto
                        </a>
                    </nav>
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-accent text-white hover:bg-blue-500 py-1.5 px-4 rounded-lg text-sm transition-all font-semibold"
                    >
                        Acceder / Registro
                    </button>
                </div>
            </header>

            {/* Hero Section */}
            <Hero />

            {/* Features Section */}
            <Features />

            {/* Plans Section */}
            <section id="plans-section" className="max-w-6xl mx-auto mb-16 sm:mb-28 px-4 sm:px-6">
                <h2 className="text-2xl sm:text-4xl font-bold text-center text-white mb-3 sm:mb-4">
                    Estructura de inversión
                </h2>
                <p className="text-center text-gray-400 text-sm sm:text-lg mb-8 sm:mb-12">
                    Descubre los planes que potencian tu capital. El rendimiento se ajusta a tu nivel de
                    inversión.
                </p>

                {loading ? (
                    <div className="text-center text-gray-500">Cargando planes...</div>
                ) : plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                        {plans.map((plan) => (
                            <div key={plan.id} className="card p-5 sm:p-6 rounded-2xl border border-gray-700 bg-gray-800/50 hover:border-accent transition-all duration-300 hover:transform hover:-translate-y-2">
                                <h3 className="text-xl sm:text-2xl font-bold text-accent mb-4 sm:mb-6 text-center">{plan.name}</h3>
                                <div className="space-y-2 sm:space-y-4 text-gray-300">
                                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                        <span className="text-gray-400 text-xs sm:text-sm">Capital mínimo</span>
                                        <span className="font-bold text-white text-sm sm:text-lg">${plan.minCapital}</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                        <span className="text-gray-400 text-xs sm:text-sm">Rentabilidad diaria</span>
                                        <span className="font-bold text-profit text-sm sm:text-lg">{plan.minDailyReturn}% - {plan.maxDailyReturn}%</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                        <span className="text-gray-400 text-xs sm:text-sm">Promedio diario</span>
                                        <span className="font-bold text-profit text-sm sm:text-lg">{plan.dailyAverage}%</span>
                                    </div>
                                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                        <span className="text-gray-400 text-xs sm:text-sm">Comisión mensual</span>
                                        <span className="font-bold text-white text-sm sm:text-lg">{plan.monthlyCommission}%</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2">
                                        <span className="text-gray-400 text-xs sm:text-sm">Tiempo para duplicar</span>
                                        <span className="font-bold text-accent text-sm sm:text-lg">{plan.doublingTime}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/login')}
                                    className="w-full mt-5 sm:mt-8 bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-white font-bold py-2 sm:py-3 rounded-xl transition-all duration-200 text-sm sm:text-base"
                                >
                                    Comenzar a invertir
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <p>No hay planes de inversión disponibles en este momento.</p>
                    </div>
                )}
            </section>

            {/* FAQ Section */}
            <FAQ />

            {/* CTA Section */}
            <section className="max-w-4xl mx-auto text-center card p-6 sm:p-12 rounded-3xl shadow-2xl shadow-blue-900/40 border border-gray-700 mb-12 sm:mb-20 mx-4">
                <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 text-white">Inicia tu inversión hoy</h3>
                <p className="text-sm sm:text-lg text-gray-400 mb-6 sm:mb-8">
                    Únete a la plataforma que combina la rentabilidad con la sostenibilidad.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                    <button
                        onClick={() => navigate('/login')}
                        className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 sm:py-3 px-8 sm:px-10 rounded-xl shadow-lg shadow-green-700/30 transition-all text-base sm:text-lg"
                    >
                        Iniciar sesión
                    </button>
                    <button
                        onClick={() => navigate('/register')}
                        className="bg-accent hover:bg-accent/80 text-white font-bold py-2.5 sm:py-3 px-8 sm:px-10 rounded-xl shadow-lg shadow-blue-700/30 transition-all text-base sm:text-lg"
                    >
                        Crear cuenta
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="text-center text-xs text-gray-500 py-8 border-t border-secondary max-w-7xl mx-auto px-4 sm:px-6">
                <p>© 2025 Cloud Capital | Investment Group | Todos los derechos reservados.</p>
            </footer>
        </div>
    );
};
