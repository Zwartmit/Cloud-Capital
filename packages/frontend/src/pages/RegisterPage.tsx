import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

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
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md card p-8 rounded-2xl border-t-4 border-profit">
                <h1 className="text-4xl font-black text-center text-profit mb-4">Crear cuenta</h1>
                <p className="text-center text-gray-400 mb-8">
                    Únete a Cloud Capital y comienza a invertir
                </p>

                {error && (
                    <div className="text-center text-sm font-semibold text-red-500 my-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
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
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Contraseña
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Digita una contraseña"
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Confirmar contraseña
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            disabled={loading}
                            placeholder="Confirma tu contraseña"
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-profit focus:border-profit focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-profit hover:bg-emerald-500 text-white font-bold py-3 rounded-lg mt-6 transition duration-200 shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
                    </button>
                </form>

                <div className="text-center text-sm text-gray-400 mt-4 space-y-2">
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

                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="w-auto px-6 bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 rounded-lg transition duration-200 text-sm"
                    >
                        Volver a la página principal
                    </button>
                </div>

                {/* Success Modal */}
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-profit">
                            <div className="text-center">
                                <div className="text-6xl mb-4">✅</div>
                                <h2 className="text-3xl font-bold text-profit mb-4">¡Cuenta creada exitosamente!</h2>
                                <p className="text-gray-400 mb-6">
                                    Bienvenido a Cloud Capital, <span className="text-white font-semibold">{formData.name}</span>.
                                    Tu cuenta ha sido creada y ya puedes comenzar a invertir.
                                </p>

                                <div className="space-y-3">
                                    <button
                                        onClick={() => navigate('/dashboard')}
                                        className="w-full bg-profit hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition duration-200 shadow-lg shadow-emerald-500/30"
                                    >
                                        Ir al Dashboard
                                    </button>
                                    <button
                                        onClick={() => navigate('/')}
                                        className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition duration-200"
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
