import React from 'react';
import { Book, TrendingUp, DollarSign, Users, AlertTriangle, ShieldCheck } from 'lucide-react';

export const AdminGuide: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-xl border border-blue-500/30">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                        <Book className="w-8 h-8 text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-white mb-2">Guía de administración</h2>
                        <p className="text-gray-300">
                            Bienvenido al panel de control. Aquí encontrarás explicaciones detalladas sobre los conceptos clave
                            del sistema para evitar confusiones y errores operativos.
                        </p>
                    </div>
                </div>
            </div>

            {/* Critical Difference Section */}
            <div className="card p-6 rounded-xl border-t-4 border-yellow-500">
                <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                    <AlertTriangle className="w-6 h-6 text-yellow-500 mr-2" />
                    Diferencia Crítica: Rentabilidad vs. Planes
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Profit Manager */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-profit transition-colors">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-profit/10 rounded-lg mr-3">
                                <DollarSign className="w-6 h-6 text-profit" />
                            </div>
                            <h4 className="text-lg font-bold text-white">1. Rentabilidad Diaria</h4>
                        </div>
                        <p className="text-sm text-gray-400 mb-4 bg-black/30 p-3 rounded">
                            Pestaña: <span className="text-profit font-mono">Rentabilidad</span>
                        </p>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-start">
                                <span className="text-profit mr-2">●</span>
                                <span><strong>ES DINERO REAL:</strong> La tasa que configures aquí es la que <u>realmente se pagará</u> esa noche a los usuarios.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-profit mr-2">●</span>
                                <span><strong>Frecuencia:</strong> Debes configurarla cada día laborable.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-profit mr-2">●</span>
                                <span><strong>Efecto:</strong> Aumenta el saldo (Profit Wallet) de los usuarios inmediatamente tras el procesamiento nocturno.</span>
                            </li>
                        </ul>
                    </div>

                    {/* Investment Plan Manager */}
                    <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700 hover:border-accent transition-colors">
                        <div className="flex items-center mb-4">
                            <div className="p-2 bg-accent/10 rounded-lg mr-3">
                                <TrendingUp className="w-6 h-6 text-accent" />
                            </div>
                            <h4 className="text-lg font-bold text-white">2. Configuración de Planes</h4>
                        </div>
                        <p className="text-sm text-gray-400 mb-4 bg-black/30 p-3 rounded">
                            Pestaña: <span className="text-accent font-mono">Planes de inversión</span>
                        </p>
                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-start">
                                <span className="text-accent mr-2">●</span>
                                <span><strong>ES TEÓRICO / MARKETING:</strong> Los valores aquí (como "Promedio diario") son solo para <u>proyecciones y visualización</u>.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-accent mr-2">●</span>
                                <span><strong>Uso:</strong> Se usa en la calculadora de ganancias para decirle al usuario cuánto <i>podría</i> ganar.</span>
                            </li>
                            <li className="flex items-start">
                                <span className="text-accent mr-2">●</span>
                                <span><strong>Efecto:</strong> No afecta los pagos reales. Cambiar esto no da ni quita dinero real.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Other Sections Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Roles */}
                <div className="card p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <ShieldCheck className="w-5 h-5 text-blue-400 mr-2" />
                        Roles y Permisos
                    </h3>
                    <div className="space-y-4">
                        <div>
                            <h5 className="text-sm font-bold text-purple-400 mb-1">SUPERADMIN</h5>
                            <p className="text-xs text-gray-400">Tiene control total. Puede crear/editar planes, eliminar usuarios, asignar roles y aprobar retiros directamente.</p>
                        </div>
                        <div className="w-full h-px bg-gray-700"></div>
                        <div>
                            <h5 className="text-sm font-bold text-blue-400 mb-1">SUBADMIN</h5>
                            <p className="text-xs text-gray-400">Rol operativo. Puede ver usuarios, aprobar depósitos y pre-aprobar retiros (requieren confirmación final). No puede modificar planes de inversión.</p>
                        </div>
                    </div>
                </div>

                {/* Workflow */}
                <div className="card p-6 rounded-xl border border-gray-700">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center">
                        <Users className="w-5 h-5 text-green-400 mr-2" />
                        Flujo de Tareas
                    </h3>
                    <ul className="space-y-3 text-sm text-gray-300">
                        <li className="flex items-start">
                            <span className="text-green-500 font-bold mr-2">1.</span>
                            <span><strong>Depósitos:</strong> Revisa el comprobante y el TXID. Al aprobar, el saldo se suma automáticamente.</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-500 font-bold mr-2">2.</span>
                            <span><strong>Retiros:</strong> Verifica que la dirección de billetera sea correcta. Al completar, el sistema descuenta el saldo (pero el pago en blockchain es manual por ahora).</span>
                        </li>
                        <li className="flex items-start">
                            <span className="text-green-500 font-bold mr-2">3.</span>
                            <span><strong>Rechazos:</strong> Si rechazas una tarea, el saldo vuelve a su estado original (en caso de retiro) y se notifica el estado.</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
