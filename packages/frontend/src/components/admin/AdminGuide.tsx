import React, { useState } from 'react';
import { AlertTriangle, TrendingUp, DollarSign, Users, ShieldCheck, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Zap } from 'lucide-react';

export const AdminGuide: React.FC = () => {
    const [expandedSection, setExpandedSection] = useState<string | null>(null);

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Critical Difference Section - MANTENER */}
            <div className="card p-4 sm:p-6 md:p-8 rounded-xl border-l-4 border-yellow-500 bg-yellow-500/5">
                <div className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                    <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 flex-shrink-0 mt-1" />
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">Rentabilidad diaria vs Planes de inversión</h3>
                        <p className="text-sm sm:text-base text-gray-400">Comprende la diferencia fundamental entre estos dos conceptos</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Rentabilidad */}
                    <div className="bg-gray-800/80 p-4 sm:p-6 rounded-xl border-2 border-profit/50 hover:border-profit transition-all">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-profit/20 rounded-lg">
                                <DollarSign className="w-6 h-6 sm:w-7 sm:h-7 text-profit" />
                            </div>
                            <div>
                                <h4 className="text-lg sm:text-xl font-bold text-white">Rentabilidad diaria</h4>
                                <span className="text-xs text-profit font-mono bg-profit/10 px-2 py-1 rounded whitespace-nowrap">Panel → Rentabilidad</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-profit flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-300">
                                    <strong className="text-profit">DINERO REAL:</strong> La tasa configurada aquí es la que realmente se paga
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Clock className="w-5 h-5 text-profit flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-300">
                                    <strong className="text-profit">Frecuencia:</strong> Debe configurarse para cada día
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <Zap className="w-5 h-5 text-profit flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-300">
                                    <strong className="text-profit">Efecto:</strong> Aumenta el saldo (Profit Wallet) inmediatamente
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Planes */}
                    <div className="bg-gray-800/80 p-4 sm:p-6 rounded-xl border-2 border-accent/50 hover:border-accent transition-all">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <div className="p-2 sm:p-3 bg-accent/20 rounded-lg">
                                <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-accent" />
                            </div>
                            <div>
                                <h4 className="text-lg sm:text-xl font-bold text-white">Planes de inversión</h4>
                                <span className="text-xs text-accent font-mono bg-accent/10 px-2 py-1 rounded whitespace-nowrap">Panel → Planes</span>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-start gap-2">
                                <XCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-300">
                                    <strong className="text-accent">TEÓRICO/MARKETING:</strong> Solo para proyecciones y visualización
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <TrendingUp className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-300">
                                    <strong className="text-accent">Uso:</strong> Calculadora de ganancias (cuánto podría ganar)
                                </p>
                            </div>
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-gray-300">
                                    <strong className="text-accent">Efecto:</strong> NO afecta pagos reales ni da/quita dinero
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Roles Comparison Table */}
            <div className="card p-4 sm:p-6 rounded-xl border border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Sistema de roles y permisos</h3>
                </div>

                <div className="overflow-x-auto -mx-4 sm:mx-0">
                    <table className="w-full text-xs sm:text-sm">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left p-2 sm:p-4 text-gray-400 font-semibold min-w-[140px] sm:min-w-0">Funcionalidad</th>
                                <th className="text-center p-2 sm:p-4 text-purple-400 font-bold whitespace-nowrap">SUPERADMIN</th>
                                <th className="text-center p-2 sm:p-4 text-blue-400 font-bold whitespace-nowrap text-xs sm:text-sm">SUBADMIN/<br className="sm:hidden" />COLABORADOR</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">Ver panel de administración</td>
                                <td className="text-center p-2 sm:p-4"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 sm:p-4"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">Gestionar usuarios (ver, buscar)</td>
                                <td className="text-center p-2 sm:p-4"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 sm:p-4"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">Bloquear/desbloquear usuarios</td>
                                <td className="text-center p-2 sm:p-4"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 sm:p-4"><XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">Modificar capital de usuarios</td>
                                <td className="text-center p-2 sm:p-4"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 sm:p-4"><XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">Eliminar usuarios</td>
                                <td className="text-center p-2 sm:p-4"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 sm:p-4"><XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50 bg-accent/5">
                                <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">Crear/editar planes de inversión</td>
                                <td className="text-center p-2 sm:p-4"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 sm:p-4"><XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50 bg-profit/5">
                                <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">Configurar rentabilidad diaria</td>
                                <td className="text-center p-2 sm:p-4"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 sm:p-4"><XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">Gestionar colaboradores</td>
                                <td className="text-center p-2 sm:p-4"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 sm:p-4"><XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50">
                                <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">Gestionar bancos</td>
                                <td className="text-center p-2 sm:p-4"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /></td>
                                <td className="text-center p-2 sm:p-4"><CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mx-auto" /></td>
                            </tr>
                            <tr className="border-b border-gray-800 hover:bg-gray-800/50 bg-orange-500/5">
                                <td className="p-2 sm:p-4 font-medium text-xs sm:text-sm">Aprobar/rechazar transacciones</td>
                                <td className="text-center p-2 sm:p-4">
                                    <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-1 rounded font-bold">DIRECTA</span>
                                </td>
                                <td className="text-center p-2 sm:p-4">
                                    <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded font-bold whitespace-nowrap">PRE-APROBACIÓN</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Workflow Section */}
            <div className="card p-4 sm:p-6 rounded-xl border border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                    <Users className="w-5 h-5 sm:w-6 sm:h-6 text-green-400" />
                    <h3 className="text-xl sm:text-2xl font-bold text-white">Flujo de aprobación de transacciones</h3>
                </div>

                <div className="space-y-6">
                    {/* Flujo Normal */}
                    <div>
                        <h4 className="text-base sm:text-lg font-bold text-white mb-3 sm:mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            Flujo estándar (usuarios directos)
                        </h4>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                            {/* Step 1 */}
                            <div className="bg-blue-500/10 p-4 rounded-lg border border-blue-500/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                                    <h5 className="font-bold text-blue-400">PENDIENTE</h5>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">Usuario crea solicitud</p>
                                <div className="text-xs text-gray-500">
                                    • Depósito/Retiro<br />
                                    • Adjunta comprobantes, notas, u otros de ser necesario<br />
                                    • Estado de la solicitud: "Pendiente"
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="bg-orange-500/10 p-4 rounded-lg border border-orange-500/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                                    <h5 className="font-bold text-orange-400">PRE-REVISIÓN</h5>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">SUBADMIN revisa</p>
                                <div className="text-xs text-gray-500">
                                    • Pre-Aprueba ✓<br />
                                    • Pre-Rechaza ✗<br />
                                    • Estado de la solicitud: "Por revisar"
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="bg-purple-500/10 p-4 rounded-lg border border-purple-500/30">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                                    <h5 className="font-bold text-purple-400">DECISIÓN FINAL</h5>
                                </div>
                                <p className="text-xs text-gray-400 mb-2">SUPERADMIN decide</p>
                                <div className="text-xs text-gray-500">
                                    • Aprueba → COMPLETED<br />
                                    • Rechaza → REJECTED<br />
                                    • Saldo se actualiza
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Excepción Colaboradores */}
                    <div className="bg-gray-800/50 p-4 sm:p-5 rounded-lg border-l-4 border-accent">
                        <div className="flex items-start gap-2 sm:gap-3">
                            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0 mt-1" />
                            <div>
                                <h5 className="font-bold text-white mb-2 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                                    <span className="text-sm sm:text-base">Excepción: Transacciones con Colaboradores</span>
                                    <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded whitespace-nowrap">UN SOLO PASO</span>
                                </h5>
                                <p className="text-sm text-gray-400">
                                    Las transacciones gestionadas mediante un <strong className="text-accent">Colaborador</strong> no requieren doble filtro.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Expandable Sections */}
            <div className="space-y-3">
                <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Herramientas y funcionalidades</h3>

                {/* Centro de Tareas */}
                <div className="card rounded-xl border border-gray-700 overflow-hidden">
                    <button
                        onClick={() => toggleSection('tasks')}
                        className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-admin/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-admin" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-white text-sm sm:text-base">Centro de tareas</h4>
                                <p className="text-xs text-gray-400 hidden sm:block">Procesamiento de depósitos y retiros</p>
                            </div>
                        </div>
                        {expandedSection === 'tasks' ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                    </button>

                    {expandedSection === 'tasks' && (
                        <div className="p-5 pt-0 border-t border-gray-800">
                            <div className="space-y-3 text-sm text-gray-300">
                                <p><strong className="text-white">Función:</strong> Panel centralizado para revisar y procesar todas las solicitudes financieras.</p>
                                <div>
                                    <strong className="text-white">Pestañas:</strong>
                                    <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-400">
                                        <li><strong className="text-blue-400">Pendientes:</strong> Nuevas solicitudes sin revisar</li>
                                        <li><strong className="text-orange-400">Por revisar:</strong> Pre-aprobadas/rechazadas esperando decisión final</li>
                                        <li><strong className="text-green-400">Historial:</strong> Transacciones completadas o rechazadas</li>
                                    </ul>
                                </div>
                                <div>
                                    <strong className="text-white">Acciones disponibles:</strong>
                                    <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-400">
                                        <li>Ver comprobantes de pago adjuntos</li>
                                        <li>Verificar direcciones BTC en blockchain (depósitos automáticos)</li>
                                        <li>Aprobar/Pre-aprobar transacciones</li>
                                        <li>Rechazar con motivo especificado</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pool de Direcciones */}
                <div className="card rounded-xl border border-gray-700 overflow-hidden">
                    <button
                        onClick={() => toggleSection('pool')}
                        className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-gray-800/50 transition-colors"
                    >
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
                            </div>
                            <div className="text-left">
                                <h4 className="font-bold text-white text-sm sm:text-base">Pool de direcciones BTC</h4>
                                <p className="text-xs text-gray-400 hidden sm:block">Gestión de wallets para depósitos crypto</p>
                            </div>
                        </div>
                        {expandedSection === 'pool' ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
                    </button>

                    {expandedSection === 'pool' && (
                        <div className="p-5 pt-0 border-t border-gray-800">
                            <div className="space-y-3 text-sm text-gray-300">
                                <p><strong className="text-white">Función:</strong> Inventario automatizado de direcciones Bitcoin para asignar a depósitos de usuarios.</p>
                                <div>
                                    <strong className="text-white">Estados de direcciones:</strong>
                                    <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-400">
                                        <li><strong className="text-green-400">Disponible:</strong> Lista para asignarse a un nuevo depósito</li>
                                        <li><strong className="text-orange-400">Reservada:</strong> Asignada temporalmente a un usuario</li>
                                        <li><strong className="text-gray-400">Usada:</strong> Depósito completado, no reutilizable</li>
                                    </ul>
                                </div>
                                <div>
                                    <strong className="text-white">Gestión:</strong>
                                    <ul className="list-disc ml-5 mt-2 space-y-1 text-gray-400">
                                        <li>Carga masiva de nuevas direcciones (una por línea)</li>
                                        <li>Monitoreo de estadísticas (total, disponibles, % uso)</li>
                                        <li>Liberación manual de direcciones reservadas expiradas</li>
                                        <li>Agregar notas administrativas a direcciones específicas</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
