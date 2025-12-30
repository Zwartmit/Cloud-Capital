import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Home, Layers, HelpCircle, Mail, BarChart3, Zap, Users } from 'lucide-react';
import { BackgroundCanvas } from '../components/common/BackgroundCanvas';
import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { FAQ } from '../components/landing/FAQ';
import { Contact } from '../components/landing/Contact';
import { ScrollReveal } from '../components/common/ScrollReveal';

export const LandingPage: React.FC = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-transparent text-white font-sans">
            <BackgroundCanvas />

            {/* Header/Nav */}
            <header className="sticky top-0 z-20 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
                <div className="relative z-30 bg-transparent max-w-7xl mx-auto flex justify-between items-center py-3 sm:py-4 px-4 sm:px-6">
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
                        <a href="#contact-section" className="hover:text-accent transition-all duration-200 hover:scale-105">
                            Contacto
                        </a>
                    </nav>

                    <div className="hidden sm:block">
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-primary py-2 px-6 text-sm font-bold"
                        >
                            Accede / Regístrate
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
                        <div className="sm:hidden absolute top-full left-0 w-full bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl animate-menu-slide-down z-20 rounded-b-3xl">
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
                                        href="#contact-section"
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
                                        Accede / Regístrate
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

            {/* Exclusive Access / Plans CTA Section */}
            <section id="plans-section" className="max-w-6xl mx-auto mb-16 sm:mb-28 px-4 sm:px-6 ">
                <h2 className="text-3xl sm:text-5xl font-black text-center gradient-text-primary mb-3 sm:mb-8">
                    Estructura de inversión
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Plan Estándar */}
                    <ScrollReveal className="fade-in" delay={0}>
                        <div className="card bg-slate-900/60 backdrop-blur-sm border border-slate-700/80 rounded-2xl p-8 hover:border-slate-600 transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col h-full hover-lift">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center mb-6 border border-slate-600">
                                <BarChart3 className="w-8 h-8 text-slate-400" />
                            </div>

                            <h3 className="text-xl font-bold text-slate-300 mb-4">
                                Plan estándar
                            </h3>

                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Inversión pasiva en infraestructura cloud con retornos conservadores.
                            </p>

                            <div className="mb-4">
                                <p className="text-gray-400 text-sm mb-2">
                                    Desde <span className="text-4xl font-bold text-white">0.75%</span> <span className="text-gray-400">Semanal</span>
                                </p>
                                <p className="text-gray-400 text-sm">
                                    Hasta <span className="text-4xl font-bold text-white">6.0%</span> <span className="text-gray-400">Mensual</span>
                                </p>
                            </div>

                            <p className="text-sm text-white mb-6">
                                <strong>Mínimo:</strong> $50.00 USD
                            </p>

                            <button
                                onClick={() => navigate('/register')}
                                className="mt-auto w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300"
                            >
                                Elegir plan
                            </button>
                        </div>
                    </ScrollReveal>

                    {/* Crypto Minería - Popular */}
                    <ScrollReveal animation="fade-in" delay={0.2}>
                        <div className="card bg-slate-900/60 backdrop-blur-sm border-2 border-accent rounded-2xl p-8 transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col relative h-full hover-lift">
                            <div className="absolute top-5 right-5 bg-accent text-slate-900 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wide">
                                Popular
                            </div>

                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center mb-6 border border-accent/40">
                                <Zap className="w-8 h-8 text-accent" />
                            </div>

                            <h3 className="text-xl font-bold text-accent mb-4">
                                Crypto minería
                            </h3>

                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Rendimiento dinámico proveniente de la minería digital sostenible.
                            </p>

                            <div className="mb-6">
                                <p className="text-4xl font-bold text-accent mb-2">
                                    0.5% - 2.0%
                                </p>
                                <p className="text-sm text-gray-400">Diario</p>
                            </div>

                            <button
                                onClick={() => navigate('/login')}
                                className="mt-auto w-full bg-accent hover:bg-accent/90 text-slate-900 font-black py-3.5 px-6 rounded-xl transition-all duration-300"
                            >
                                Ver mi rendimiento
                            </button>
                        </div>
                    </ScrollReveal>

                    {/* Cloud Partnership */}
                    <ScrollReveal animation="fade-in" delay={0.4}>
                        <div className="card bg-slate-900/60 backdrop-blur-sm border border-cyan-500/60 rounded-2xl p-8 hover:border-cyan-500/80 transition-all duration-300 shadow-xl hover:shadow-2xl flex flex-col h-full hover-lift">
                            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center mb-6 border border-amber-500/40">
                                <Users className="w-8 h-8 text-amber-400" />
                            </div>

                            <h3 className="text-xl font-bold text-cyan-400 mb-4">
                                Cloud partnership
                            </h3>

                            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                                Programa de afiliados corporativos con comisiones.
                            </p>

                            <div className="mb-4">
                                <p className="text-4xl font-bold text-white mb-2">
                                    Hasta 15%
                                </p>
                                <p className="text-sm text-gray-400">Comisión Directa</p>
                            </div>

                            <p className="text-sm text-gray-400 mb-6">
                                Beneficios por referir nuevos inversores.
                            </p>

                            <button
                                onClick={() => navigate('/register')}
                                className="mt-auto w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3.5 px-6 rounded-xl transition-all duration-300"
                            >
                                Únete al programa
                            </button>
                        </div>
                    </ScrollReveal>
                </div>
            </section>

            {/* FAQ Section */}
            <FAQ />

            {/* CTA Section */}
            <ScrollReveal animation="scale-in" className="mb-12 sm:mb-20">
                <section className="card max-w-4xl mx-auto text-center bg-slate-800/40 backdrop-blur-md p-6 sm:p-12 rounded-2xl shadow-2xl border-t border-r border-b border-slate-700/50 border-l-4 border-l-accent mx-4">
                    <h3 className="text-3xl sm:text-5xl font-black mb-3 sm:mb-4 gradient-text-primary">
                        Inicia tu inversión hoy
                    </h3>
                    <p className="text-lg text-slate-300 mb-6 sm:mb-8 max-w-xl mx-auto">
                        Únete a la plataforma que combina la rentabilidad con la sostenibilidad.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-success py-3 px-8 sm:px-10 text-base sm:text-lg"
                        >
                            Inicia sesión
                        </button>
                        <button
                            onClick={() => navigate('/register')}
                            className="btn btn-primary py-3 px-8 sm:px-10 text-base sm:text-lg"
                        >
                            Crea tu cuenta
                        </button>
                    </div>
                </section>
            </ScrollReveal>

            {/* Contact Section */}
            <Contact />

            {/* Footer */}
            <footer className="text-center text-lg text-gray-500 py-8 border-t border-gray-700/50 max-w-7xl mx-auto px-4 sm:px-6">
                <p>© {new Date().getFullYear()} Cloud Capital</p>
            </footer>
        </div >
    );
};
