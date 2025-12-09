import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { PasswordInput } from '../components/common/PasswordInput';

export const ResetPasswordPage: React.FC = () => {
    const [searchParams] = useSearchParams();
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setError('Token de restablecimiento inválido o faltante');
        }
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validations
        if (newPassword.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Las contraseñas no coinciden');
            return;
        }

        if (!token) {
            setError('Token de restablecimiento inválido');
            return;
        }

        setLoading(true);

        try {
            await authService.resetPassword(token, newPassword);
            setSuccess(true);

            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error al restablecer la contraseña. El enlace puede haber expirado.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4">
                <div className="w-full max-w-md card p-8 rounded-2xl border-t-4 border-green-500">
                    <div className="text-center">
                        <div className="text-6xl mb-4">✅</div>
                        <h1 className="text-3xl font-black text-green-500 mb-4">¡Contraseña Restablecida!</h1>
                        <p className="text-gray-400 mb-6">
                            Tu contraseña ha sido actualizada exitosamente.
                        </p>
                        <p className="text-sm text-gray-500">
                            Serás redirigido al login en unos segundos...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md card p-8 rounded-2xl border-t-4 border-accent">
                <h1 className="text-4xl font-black text-center text-accent mb-4">Restablecer Contraseña</h1>
                <p className="text-center text-gray-400 mb-8">
                    Ingresa tu nueva contraseña
                </p>

                {error && (
                    <div className="text-center text-sm font-semibold text-red-500 my-4 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Nueva contraseña
                        </label>
                        <PasswordInput
                            name="newPassword"
                            placeholder="Mínimo 6 caracteres"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Confirmar contraseña
                        </label>
                        <PasswordInput
                            name="confirmPassword"
                            placeholder="Repite tu contraseña"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-accent focus:border-accent focus:outline-none disabled:opacity-50"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !token}
                        className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-6 transition duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Restableciendo...' : 'Restablecer contraseña'}
                    </button>
                </form>

                <div className="flex justify-center mt-6">
                    <button
                        onClick={() => navigate('/login')}
                        className="text-sm text-gray-400 hover:text-accent transition duration-200"
                    >
                        Volver al login
                    </button>
                </div>
            </div>
        </div>
    );
};
