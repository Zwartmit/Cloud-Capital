import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, Layers, HelpCircle, Mail } from 'lucide-react';
import { BackgroundCanvas } from '../components/common/BackgroundCanvas';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { FAQ } from '../components/landing/FAQ';
import { investmentPlanService, InvestmentPlan } from '../services/investmentPlanService';
import { ScrollReveal } from '../components/common/ScrollReveal';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
            <header className="sticky top-0 z-20 bg-[#000000] border-b border-gray-700/50">
                <div className="relative z-30 bg-[#000000] max-w-7xl mx-auto flex justify-between items-center py-3 sm:py-4 px-4 sm:px-6">
                    <a href="/" className="flex items-center space-x-2">
                        <img src="/logo.png" alt="Cloud Capital Logo" className="h-16 w-auto" />
                    </a>

                    {/* Desktop Nav */}
                    <nav className="hidden sm:flex space-x-8 text-gray-400 font-medium text-lg">
                        <a href="#hero" className="hover:text-accent transition-all duration-200 hover:scale-105">
                            Inicio
                        </a>
                        <a href="#plans-section" className="hover:text-accent transition-all duration-200 hover:scale-105">
                            Planes
                        </a>
                        <a href="#faq-section" className="hover:text-accent transition-all duration-200 hover:scale-105">
                            FAQ
                        </a>
                        <a href="#" className="hover:text-accent transition-all duration-200 hover:scale-105">
                            Contacto
                        </a>
                    </nav>

                    <div className="hidden sm:block">
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-primary py-2 px-6 text-sm font-bold"
                        >
                            Acceder / Registro
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="sm:hidden text-white p-2"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Grid Mobile Menu Dropdown */}
                {mobileMenuOpen && (
                    <>
                        {/* Backdrop to close menu on click outside */}
                        <div
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10"
                            onClick={() => setMobileMenuOpen(false)}
                        />
                        <div className="sm:hidden absolute top-full left-0 w-full bg-[#000000] border-b border-gray-800 shadow-2xl animate-menu-slide-down z-20 rounded-b-3xl">
                            <div className="p-6">
                                <nav className="grid grid-cols-2 gap-4 mb-6">
                                    <a
                                        href="#hero"
                                        className="flex flex-col items-center justify-center p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-accent hover:bg-gray-800 transition-all duration-300 group"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Home className="w-8 h-8 text-gray-400 group-hover:text-accent mb-3 transition-colors" />
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white uppercase tracking-wider">Inicio</span>
                                    </a>
                                    <a
                                        href="#plans-section"
                                        className="flex flex-col items-center justify-center p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-accent hover:bg-gray-800 transition-all duration-300 group"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Layers className="w-8 h-8 text-gray-400 group-hover:text-accent mb-3 transition-colors" />
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white uppercase tracking-wider">Planes</span>
                                    </a>
                                    <a
                                        href="#faq-section"
                                        className="flex flex-col items-center justify-center p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-accent hover:bg-gray-800 transition-all duration-300 group"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <HelpCircle className="w-8 h-8 text-gray-400 group-hover:text-accent mb-3 transition-colors" />
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white uppercase tracking-wider">FAQ</span>
                                    </a>
                                    <a
                                        href="#"
                                        className="flex flex-col items-center justify-center p-4 bg-gray-900 border border-gray-800 rounded-xl hover:border-accent hover:bg-gray-800 transition-all duration-300 group"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <Mail className="w-8 h-8 text-gray-400 group-hover:text-accent mb-3 transition-colors" />
                                        <span className="text-sm font-bold text-gray-300 group-hover:text-white uppercase tracking-wider">Contacto</span>
                                    </a>
                                </nav>

                                <div className="flex justify-center">
                                    <button
                                        onClick={() => {
                                            navigate('/login');
                                            setMobileMenuOpen(false);
                                        }}
                                        className="btn btn-primary w-max px-10 py-3 text-sm font-black uppercase tracking-widest shadow-lg shadow-accent/20"
                                    >
                                        Acceder / Registro
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </header>

            {/* Hero Section */}
            <Hero />

            {/* Features Section */}
            <Features />

            {/* Plans Section */}
            <section id="plans-section" className="max-w-6xl mx-auto mb-16 sm:mb-28 px-4 sm:px-6">
                <h2 className="text-3xl sm:text-5xl font-black text-center gradient-text-primary mb-3 sm:mb-4">
                    Estructura de inversión
                </h2>
                <p className="text-center text-gray-400 text-lg mb-8 sm:mb-12 max-w-2xl mx-auto">
                    Descubre los planes que potencian tu capital. El rendimiento se ajusta a tu nivel de
                    inversión.
                </p>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="skeleton h-96 rounded-2xl" />
                        ))}
                    </div>
                ) : plans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">


                        {plans.map((plan, index) => (
                            <ScrollReveal key={plan.id} animation="scale-in" delay={index * 0.1}>
                                <div
                                    className="card p-5 sm:p-6 rounded-2xl border-l-4 border-accent !bg-[#0B1120] border-t border-r border-b border-gray-800 hover:border-l-[6px] hover-lift group transition-all duration-300 h-full"
                                >
                                    <h3 className="text-xl sm:text-2xl font-black gradient-text-primary mb-4 sm:mb-6 text-center">
                                        {plan.name}
                                    </h3>
                                    <div className="space-y-3 sm:space-y-4 text-gray-300">
                                        <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                                            <span className="text-gray-400 text-xs sm:text-sm">Capital mínimo</span>
                                            <span className="font-bold text-white text-sm sm:text-lg">${plan.minCapital}</span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                                            <span className="text-gray-400 text-xs sm:text-sm">Rentabilidad diaria</span>
                                            <span className="font-bold gradient-text-profit text-sm sm:text-lg">
                                                {plan.minDailyReturn}% - {plan.maxDailyReturn}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                                            <span className="text-gray-400 text-xs sm:text-sm">Promedio diario</span>
                                            <span className="font-bold gradient-text-profit text-sm sm:text-lg">
                                                {plan.dailyAverage}%
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center border-b border-gray-700/50 pb-2">
                                            <span className="text-gray-400 text-xs sm:text-sm">Comisión mensual</span>
                                            <span className="font-bold text-white text-sm sm:text-lg">{plan.monthlyCommission}%</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2">
                                            <span className="text-gray-400 text-xs sm:text-sm">Tiempo para duplicar</span>
                                            <span className="font-bold gradient-text-primary text-sm sm:text-lg">
                                                {plan.doublingTime}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/login')}
                                        className="w-full mt-5 sm:mt-8 bg-transparent border-2 border-accent text-accent hover:bg-accent hover:text-white font-bold py-2 sm:py-3 rounded-xl transition-all duration-300 text-sm sm:text-base hover:scale-[1.02] hover:shadow-lg hover:shadow-accent/30"
                                    >
                                        Comenzar a invertir
                                    </button>
                                </div>
                            </ScrollReveal>
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
            <ScrollReveal animation="scale-in" className="mb-12 sm:mb-20">
                <section className="max-w-4xl mx-auto text-center !bg-[#0B1120] p-6 sm:p-12 rounded-3xl shadow-2xl border border-gray-800 mx-4">
                    <h3 className="text-3xl sm:text-4xl font-black mb-3 sm:mb-4 gradient-text-primary">
                        Inicia tu inversión hoy
                    </h3>
                    <p className="text-lg text-gray-400 mb-6 sm:mb-8 max-w-xl mx-auto">
                        Únete a la plataforma que combina la rentabilidad con la sostenibilidad.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-success py-3 px-8 sm:px-10 text-base sm:text-lg"
                        >
                            Iniciar sesión
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="btn btn-primary py-3 px-8 sm:px-10 text-base sm:text-lg"
                        >
                            Crear cuenta
                        </button>
                    </div>
                </section>
            </ScrollReveal>

            {/* Footer */}
            <footer className="text-center text-lg text-gray-500 py-8 border-t border-gray-700/50 max-w-7xl mx-auto px-4 sm:px-6">
                <p>© {new Date().getFullYear()} Cloud Capital</p>
            </footer>
        </div>
    );
};
