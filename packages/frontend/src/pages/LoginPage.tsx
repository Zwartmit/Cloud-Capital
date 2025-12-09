import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { PasswordInput } from '../components/common/PasswordInput';

export const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const navigate = useNavigate();
    const { login: setAuthState } = useAuthStore();

    const handleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await authService.login({ email, password });

            // Update Zustand store with user and token
            setAuthState(response.user, response.accessToken);

            // Redirect based on user role
            if (response.user.role === 'SUPERADMIN' || response.user.role === 'SUBADMIN') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setResetMessage('');
        setResetLoading(true);

        try {
            const response = await authService.forgotPassword(resetEmail);
            setResetMessage(response.message);
            setResetEmail('');
        } catch (err: any) {
            setResetMessage(err.response?.data?.error || 'Error al enviar el correo. Por favor, intenta de nuevo.');
        } finally {
            setResetLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-md card p-5 sm:p-8 rounded-2xl border-t-4 border-accent">
                <div className="flex justify-center mb-4">
                    <img src="/logo.png" alt="Cloud Capital" className="w-16 h-16 object-contain" />
                </div>
                <h1 className="text-4xl font-black text-center text-accent mb-3 sm:mb-4">Cloud Capital</h1>
                <p className="text-center text-gray-400 text-lg mb-5">
                    Accede a tu panel de inversión y gestión
                </p>

                {error && (
                    <div className="text-center text-sm font-semibold text-red-500 my-3 sm:my-4 p-2 sm:p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-3 sm:space-y-4">
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo electrónico o usuario"
                        required
                        disabled={loading}
                        className="w-full p-2.5 sm:p-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white focus:ring-accent focus:border-accent focus:outline-none disabled:opacity-50"
                    />
                    <PasswordInput
                        name="password"
                        placeholder="Contraseña"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2.5 sm:p-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white focus:ring-accent focus:border-accent focus:outline-none disabled:opacity-50"
                    />

                    <p className="text-center text-sm text-gray-500 mt-2">
                        Usuarios de prueba:
                        <br />
                        (Super Admin) <code className="text-admin">admin@cloudcapital.com</code>,{' '}
                        <code className="text-admin">admin123</code>
                        <br />
                        (Sub Admin) <code className="text-subadmin">subadmin@cloudcapital.com</code>,{' '}
                        <code className="text-subadmin">subadmin123</code>
                        <br />
                        (Usuario) <code className="text-profit">user@example.com</code>,{' '}
                        <code className="text-profit">user123</code>
                    </p>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-2.5 sm:py-3 rounded-lg mt-4 sm:mt-6 transition duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    >
                        {loading ? 'Iniciando sesión...' : 'Acceder a mi Cuenta'}
                    </button>
                </form>

                <div className="text-center text-base text-gray-400 mt-3 sm:mt-4 space-y-2">
                    <p>
                        ¿No tienes cuenta?{' '}
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className="text-profit hover:text-emerald-400 font-semibold"
                        >
                            Regístrate aquí
                        </button>
                    </p>
                    <p>
                        <button
                            type="button"
                            onClick={() => setShowForgotPassword(true)}
                            className="text-accent hover:text-blue-400 font-semibold"
                        >
                            ¿Olvidaste tu contraseña?
                        </button>
                    </p>
                </div>

                <div className="flex justify-center">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="w-auto px-4 sm:px-6 bg-gray-600 hover:bg-gray-500 text-white font-bold py-1.5 sm:py-2 rounded-lg mt-3 sm:mt-4 transition duration-200 text-sm"
                    >
                        Volver a la página principal
                    </button>
                </div>

                {/* Forgot Password Modal */}
                {showForgotPassword && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
                            onClick={() => setShowForgotPassword(false)}
                        />

                        {/* Modal Content */}
                        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-700 relative shadow-2xl animate-scale-in z-10">
                            <button
                                onClick={() => {
                                    setShowForgotPassword(false);
                                    setResetMessage('');
                                    setResetEmail('');
                                }}
                                className="absolute top-4 right-4 text-gray-400 hover:text-white hover:rotate-90 transition-all duration-300"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <h2 className="text-2xl font-bold text-accent mb-4">Restablecer contraseña</h2>
                            <p className="text-gray-400 text-sm mb-6">
                                Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                            </p>

                            {resetMessage && (
                                <div className={`text-center text-sm font-semibold my-4 p-3 rounded-lg border ${resetMessage.includes('enviado')
                                    ? 'text-green-500 bg-green-500/10 border-green-500/20'
                                    : 'text-red-500 bg-red-500/10 border-red-500/20'
                                    }`}>
                                    {resetMessage}
                                </div>
                            )}

                            <form onSubmit={handleForgotPassword} className="space-y-4">
                                <input
                                    type="email"
                                    value={resetEmail}
                                    onChange={(e) => setResetEmail(e.target.value)}
                                    placeholder="Correo electrónico"
                                    required
                                    disabled={resetLoading}
                                    className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent focus:outline-none disabled:opacity-50"
                                />

                                <button
                                    type="submit"
                                    disabled={resetLoading}
                                    className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50"
                                >
                                    {resetLoading ? 'Enviando...' : 'Enviar enlace'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};
