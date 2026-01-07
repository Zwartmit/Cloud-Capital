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
    const [showTestUsers, setShowTestUsers] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetMessage, setResetMessage] = useState('');
    const [resetLoading, setResetLoading] = useState(false);
    const navigate = useNavigate();
    const { login: setAuthState } = useAuthStore();

    // Check for messages in URL (e.g. from auto-logout interception)
    React.useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const message = searchParams.get('message');

        if (message === 'account_deleted') {
            setError('Tu sesión ha expirado porque tu cuenta ya no existe. Contacta al soporte si crees que es un error.');
        } else if (message === 'session_expired') {
            setError('Tu sesión ha expirado. Por favor inicia sesión nuevamente.');
        }
    }, []);

    const handleLogin = async () => {
        setError('');
        setLoading(true);

        try {
            const response = await authService.login({ email, password });

            // Update Zustand store with user and token
            setAuthState(response.user, response.accessToken);

            // Redirect based on user role
            if (response.user.role === 'SUPERADMIN' || response.user.role === 'SUBADMIN') {
                navigate('/admin/tasks');
            } else {
                navigate('/dashboard');
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.error || 'Error al iniciar sesión. Verifica tus credenciales.';
            setError(errorMessage);
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

    const handleFillCredentials = (userEmail: string, userPassword: string) => {
        setEmail(userEmail);
        setPassword(userPassword);
        setShowTestUsers(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-md card p-5 sm:p-8 rounded-2xl border-t-4 border-accent">
                <div className="flex items-center justify-center gap-2">
                    <img src="/logo.png" alt="Cloud Capital" className="size-28 object-contain" />
                    <div className="flex flex-col items-start leading-none uppercase font-black">
                        <span className="text-3xl bg-gradient-to-r from-[#43C7D3] to-blue-500 bg-clip-text text-transparent filter drop-shadow-sm">CLOUD</span>
                        <span className="text-3xl text-white tracking-wide drop-shadow-sm">CAPITAL</span>
                    </div>
                </div>

                <div className="w-full h-px bg-gray-800/50 my-3"></div>
                <h1 className="text-4xl font-black text-center text-blue-500 mb-3 sm:mb-4">
                    Iniciar sesión
                </h1>

                {error && (
                    <div className="text-center text-sm font-semibold text-red-500 my-3 sm:my-4 p-2 sm:p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }} className="space-y-2">
                    <label className="block text-base font-medium text-gray-300">
                        Correo electrónico o usuario
                    </label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Correo electrónico o usuario"
                        required
                        disabled={loading}
                        className="w-full p-2.5 sm:p-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white focus:ring-accent focus:border-accent focus:outline-none disabled:opacity-50"
                    />
                    <label className="block text-base font-medium text-gray-300">
                        Contraseña
                    </label>
                    <PasswordInput
                        name="password"
                        placeholder="Contraseña"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-2.5 sm:p-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white focus:ring-accent focus:border-accent focus:outline-none disabled:opacity-50"
                    />

                    <div className="flex items-center justify-center gap-1 mt-2">
                        <span className="text-center text-sm text-accent">Usuarios de prueba</span>
                        <button
                            type="button"
                            onClick={() => setShowTestUsers(true)}
                            className="text-accent hover:text-blue-400 transition-colors duration-200"
                            title="Ver usuarios de prueba"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-2.5 sm:py-3 rounded-lg mt-4 sm:mt-6 transition duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                    >
                        {loading ? 'Iniciando sesión...' : 'Acceder a mi cuenta'}
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

            {/* Test Users Modal */}
            {showTestUsers && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
                        onClick={() => setShowTestUsers(false)}
                    />

                    {/* Modal Content */}
                    <div className="bg-gray-900 rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 relative shadow-2xl animate-scale-in z-10">
                        <button
                            onClick={() => setShowTestUsers(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white hover:rotate-90 transition-all duration-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <h2 className="text-2xl font-bold text-accent mb-2">Usuarios de prueba</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            Credenciales para probar diferentes roles y escenarios del sistema
                        </p>

                        {/* Admin Users */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <span className="text-admin">🔐</span> Administradores
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Super Admin */}
                                <div className="bg-gray-800/50 border border-admin/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-admin font-semibold">Super Admin</span>
                                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">SUPERADMIN</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div>
                                            <span className="text-gray-400">Email: </span>
                                            <code className="text-admin">admin@cloudcapital.com</code>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Password: </span>
                                            <code className="text-admin">admin123</code>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleFillCredentials('admin@cloudcapital.com', 'admin123')}
                                        className="mt-3 w-full bg-admin/20 hover:bg-admin/30 text-admin border border-admin/30 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        Usar credenciales
                                    </button>
                                </div>

                                {/* Sub Admin */}
                                <div className="bg-gray-800/50 border border-subadmin/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-subadmin font-semibold">Sub Admin</span>
                                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">SUBADMIN</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div>
                                            <span className="text-gray-400">Email: </span>
                                            <code className="text-subadmin">subadmin@cloudcapital.com</code>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Password: </span>
                                            <code className="text-subadmin">subadmin123</code>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleFillCredentials('subadmin@cloudcapital.com', 'subadmin123')}
                                        className="mt-3 w-full bg-subadmin/20 hover:bg-subadmin/30 text-subadmin border border-subadmin/30 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        Usar credenciales
                                    </button>
                                </div>

                                {/* Collaborator */}
                                <div className="bg-gray-800/50 border border-subadmin/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-subadmin font-semibold">Collaborator Demo</span>
                                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">SUBADMIN</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div>
                                            <span className="text-gray-400">Email: </span>
                                            <code className="text-subadmin">collaborator@cloudcapital.com</code>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Password: </span>
                                            <code className="text-subadmin">collab123</code>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleFillCredentials('collaborator@cloudcapital.com', 'collab123')}
                                        className="mt-3 w-full bg-subadmin/20 hover:bg-subadmin/30 text-subadmin border border-subadmin/30 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        Usar credenciales
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Regular Users */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <span className="text-profit">👤</span> Usuarios regulares
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Test User */}
                                <div className="bg-gray-800/50 border border-profit/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-profit font-semibold">Test User</span>
                                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">USER - GOLD</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div>
                                            <span className="text-gray-400">Email: </span>
                                            <code className="text-profit">user@example.com</code>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Password: </span>
                                            <code className="text-profit">test123</code>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Capital: $1,000 | Balance: $1,150</p>
                                    <button
                                        onClick={() => handleFillCredentials('user@example.com', 'test123')}
                                        className="mt-3 w-full bg-profit/20 hover:bg-profit/30 text-profit border border-profit/30 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        Usar credenciales
                                    </button>
                                </div>

                                {/* Referred User */}
                                <div className="bg-gray-800/50 border border-profit/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-profit font-semibold">Referred User</span>
                                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">USER</span>
                                    </div>
                                    <div className="space-y-1 text-sm">
                                        <div>
                                            <span className="text-gray-400">Email: </span>
                                            <code className="text-profit">referred@example.com</code>
                                        </div>
                                        <div>
                                            <span className="text-gray-400">Password: </span>
                                            <code className="text-profit">referred123</code>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Referido por Test User</p>
                                    <button
                                        onClick={() => handleFillCredentials('referred@example.com', 'referred123')}
                                        className="mt-3 w-full bg-profit/20 hover:bg-profit/30 text-profit border border-profit/30 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        Usar credenciales
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Cycle Testing Users */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                                <span className="text-blue-400">🧪</span> Usuarios de testing (Ciclos)
                            </h3>
                            <p className="text-xs text-gray-400 mb-3">Password para todos: <code className="text-blue-400">test123</code></p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* Test User 1 */}
                                <div className="bg-gray-800/50 border border-blue-400/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-blue-400 font-semibold">Test User 1 - 50% Progress</span>
                                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">BASIC</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-400">Email: </span>
                                        <code className="text-blue-400">test1@example.com</code>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Capital: $100 | Balance: $150 | Progreso: 50%</p>
                                    <button
                                        onClick={() => handleFillCredentials('test1@example.com', 'test123')}
                                        className="mt-3 w-full bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 border border-blue-400/30 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        Usar credenciales
                                    </button>
                                </div>

                                {/* Test User 2 */}
                                <div className="bg-gray-800/50 border border-blue-400/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-blue-400 font-semibold">Test User 2 - 150% Progress</span>
                                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">GOLD</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-400">Email: </span>
                                        <code className="text-blue-400">test2@example.com</code>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Capital: $200 | Balance: $500 | Progreso: 150%</p>
                                    <button
                                        onClick={() => handleFillCredentials('test2@example.com', 'test123')}
                                        className="mt-3 w-full bg-blue-400/20 hover:bg-blue-400/30 text-blue-400 border border-blue-400/30 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        Usar credenciales
                                    </button>
                                </div>

                                {/* Test User 3 */}
                                <div className="bg-gray-800/50 border border-emerald-400/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-emerald-400 font-semibold">Test User 3 - Cycle Completed ⭐</span>
                                        <span className="text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded">COMPLETED</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-400">Email: </span>
                                        <code className="text-emerald-400">test3@example.com</code>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Capital: $100 | Balance: $300 | Progreso: 200% ✅</p>
                                    <p className="text-xs text-emerald-400 mt-1">👉 Usa este para ver el modal de ciclo completado</p>
                                    <button
                                        onClick={() => handleFillCredentials('test3@example.com', 'test123')}
                                        className="mt-3 w-full bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-400 border border-emerald-400/30 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        Usar credenciales
                                    </button>
                                </div>

                                {/* Test User 4 */}
                                <div className="bg-gray-800/50 border border-yellow-400/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-yellow-400 font-semibold">Test User 4 - Pending Plan</span>
                                        <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-1 rounded">PENDING</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-400">Email: </span>
                                        <code className="text-yellow-400">test4@example.com</code>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Capital: $75 | Sin plan seleccionado</p>
                                    <button
                                        onClick={() => handleFillCredentials('test4@example.com', 'test123')}
                                        className="mt-3 w-full bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-400 border border-yellow-400/30 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        Usar credenciales
                                    </button>
                                </div>

                                {/* Test User 5 */}
                                <div className="bg-gray-800/50 border border-orange-400/20 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-orange-400 font-semibold">Test User 5 - Plan Expiring</span>
                                        <span className="text-xs text-gray-500 bg-gray-700 px-2 py-1 rounded">PLATINUM</span>
                                    </div>
                                    <div className="text-sm">
                                        <span className="text-gray-400">Email: </span>
                                        <code className="text-orange-400">test5@example.com</code>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Capital: $500 | Balance: $650 | Expira en 3 días</p>
                                    <button
                                        onClick={() => handleFillCredentials('test5@example.com', 'test123')}
                                        className="mt-3 w-full bg-orange-400/20 hover:bg-orange-400/30 text-orange-400 border border-orange-400/30 font-semibold py-2 px-3 rounded-lg transition-all duration-200 text-sm"
                                    >
                                        Usar credenciales
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div >
    );
};
