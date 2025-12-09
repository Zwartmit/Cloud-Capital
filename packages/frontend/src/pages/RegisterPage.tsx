import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import { PasswordInput } from '../components/common/PasswordInput';

export const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        referralCode: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();
    const { login: setAuthState } = useAuthStore();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validations
        if (!formData.name || !formData.username || !formData.email || !formData.password || !formData.referralCode) {
            setError('Todos los campos son obligatorios');
            return;
        }

        if (formData.password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Por favor ingresa un correo electrónico válido');
            return;
        }

        setLoading(true);

        try {
            const response = await authService.register({
                name: formData.name,
                username: formData.username,
                email: formData.email,
                password: formData.password,
                referralCode: formData.referralCode,
            });

            // Update Zustand store with user and token
            setAuthState(response.user, response.accessToken);

            // Show success modal instead of auto-redirect
            setShowSuccessModal(true);
        } catch (err: any) {
            console.error('Registration error:', err);
            setError(err.response?.data?.error || 'Error al registrar. Por favor intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-3 sm:p-4">
            <div className="w-full max-w-3xl card p-5 sm:p-8 rounded-2xl border-t-4 border-profit">
                <h1 className="text-4xl font-black text-center text-profit mb-3 sm:mb-4">Crear cuenta</h1>
                <p className="text-center text-gray-400 text-lg mb-5">
                    Únete a Cloud Capital y comienza a invertir
                </p>

                {error && (
                    <div className="text-center text-base font-semibold text-red-500 my-3 sm:my-4 p-2 sm:p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
                            Nombre completo
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Digita tu nombre completo"
                            className="w-full p-2.5 sm:p-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
                            Nombre de usuario
                        </label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Digita tu nombre de usuario"
                            className="w-full p-2.5 sm:p-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
                            Código de referido
                        </label>
                        <input
                            type="text"
                            name="referralCode"
                            value={formData.referralCode}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Ingresa el código de quien te invitó"
                            className="w-full p-2.5 sm:p-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
                            Correo electrónico
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Digita tu correo electrónico"
                            className="w-full p-2.5 sm:p-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
                            Contraseña
                        </label>
                        <PasswordInput
                            name="password"
                            placeholder="Digita una contraseña"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full p-2.5 sm:p-3 bg-gray-800 border border-gray-700 rounded-lg text-base text-white focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-base font-medium text-gray-300 mb-1.5 sm:mb-2">
                            Confirmar contraseña
                        </label>
                        <PasswordInput
                            name="confirmPassword"
                            placeholder="Confirma tu contraseña"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="w-full p-2.5 sm:p-3 mb-4 sm:mb-0 bg-gray-800 border border-gray-700 rounded-lg text-base text-white focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-profit hover:bg-emerald-500 text-white font-bold py-2.5 sm:py-3 rounded-lg mt-2 sm:mt-4 transition duration-200 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-base"
                        >
                            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                        </button>
                    </div>
                </form>

                <div className="text-center text-base text-gray-400 mt-6 sm:mt-6 space-y-2">
                    <p>
                        ¿Ya tienes cuenta?{' '}
                        <button
                            onClick={() => navigate('/login')}
                            className="text-accent hover:text-blue-400 font-semibold"
                        >
                            Inicia sesión
                        </button>
                    </p>
                </div>

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-3 sm:p-4 z-50">
                        <div className="bg-gray-900 rounded-2xl p-5 sm:p-8 max-w-md w-full border border-profit">
                            <div className="text-center">
                                <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">✅</div>
                                <h2 className="text-xl sm:text-3xl font-bold text-profit mb-3 sm:mb-4">¡Cuenta creada exitosamente!</h2>
                                <p className="text-gray-400 text-base mb-4 sm:mb-6">
                                    Bienvenido a Cloud Capital, <span className="text-white font-semibold">{formData.name}</span>.
                                    Tu cuenta ha sido creada y ya puedes comenzar a invertir.
                                </p>

                                <div className="space-y-2.5 sm:space-y-3">
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="w-full bg-profit hover:bg-emerald-500 text-white font-bold py-2.5 sm:py-3 rounded-lg transition duration-200 shadow-lg shadow-emerald-500/30 text-base"
                                    >
                                        Ir al Dashboard
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-2.5 sm:py-3 rounded-lg transition duration-200 text-base"
                                    >
                                        Volver a la página principal
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
