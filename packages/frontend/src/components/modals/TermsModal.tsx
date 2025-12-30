import React, { useRef, useState, useEffect } from 'react';
import { X, Shield, AlertTriangle, FileText, ArrowDown } from 'lucide-react';

interface TermsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ isOpen, onClose }) => {
    const [showScrollIndicator, setShowScrollIndicator] = useState(true);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkScroll = () => {
            if (contentRef.current) {
                const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
                setShowScrollIndicator(scrollHeight > clientHeight && scrollTop + clientHeight < scrollHeight - 20);
            }
        };

        const currentRef = contentRef.current;
        if (currentRef) {
            currentRef.addEventListener('scroll', checkScroll);
            checkScroll(); // Initial check
        }

        return () => {
            if (currentRef) {
                currentRef.removeEventListener('scroll', checkScroll);
            }
        };
    }, [isOpen]);



    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl p-4 sm:p-8 max-w-2xl w-full border border-profit max-h-[75vh] flex flex-col shadow-2xl">
                <div className="flex justify-between items-center mb-4 sticky top-0 bg-gray-900 z-10 pb-2 border-b border-gray-800">
                    <div className="flex items-center gap-2">
                        <FileText className="text-profit w-6 h-6" />
                        <h2 className="text-xl sm:text-2xl font-bold text-profit">Términos y Condiciones</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <div
                    ref={contentRef}
                    className="overflow-y-auto pr-4 text-gray-300 space-y-4 text-left custom-scrollbar text-sm sm:text-base relative"
                >
                    <section>
                        <div className="flex items-center gap-2 mb-2">
                            <Shield className="text-profit w-5 h-5" />
                            <h3 className="font-bold text-white text-lg">1. Naturaleza del Servicio y Objeto Contractual</h3>
                        </div>
                        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 my-2 text-yellow-100/90 text-sm">
                            <div className="flex items-start gap-2">
                                <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                                <p>
                                    <strong>Aviso Importante:</strong> Cloud Capital no actúa como banco, entidad financiera, fiduciaria, custodio regulado ni presta servicios de asesoría financiera o de inversión. Los planes no constituyen productos financieros regulados ni implican oferta pública de inversión.
                                </p>
                            </div>
                        </div>
                        <p className="mb-2">
                            Cloud Capital opera como una plataforma tecnológica privada que facilita acuerdos contractuales privados de naturaleza civil y mercantil entre la plataforma y el usuario. Estos acuerdos proporcionan acceso a planes operativos con retorno previamente pactado.
                        </p>
                        <p className="mb-2">
                            Los planes disponibles establecen condiciones definidas de monto, plazo y retorno, visibles antes de su activación. Dichos planes no constituyen productos financieros regulados, no representan valores negociables, ni implican oferta pública de inversión bajo ninguna jurisdicción específica.
                        </p>
                        <p className="mb-2">
                            <strong>Activos Digitales:</strong> El Bitcoin (BTC) y otros activos digitales transferidos por el usuario son considerados, para efectos de este contrato, como bienes patrimoniales (commodities) y no como dinero, moneda de curso legal, saldo monetario o equivalente a divisas. Cloud Capital no actúa como banco, entidad financiera, fiduciaria, custodio regulado ni presta servicios de asesoría financiera o de inversión.
                        </p>

                    </section>

                    <section>
                        <h3 className="font-bold text-white mb-2">2. Aporte de Activos Digitales y Uso de la Plataforma</h3>
                        <p className="mb-2">
                            Para acceder a los planes, el usuario debe realizar una transferencia de propiedad del activo digital Bitcoin (BTC) a la dirección operativa proporcionada por Cloud Capital.
                        </p>
                        <p className="mb-2">
                            <strong>Precisiones de la Transferencia:</strong> La transferencia de propiedad del activo digital se realiza con obligación contractual de restitución del valor nominal, conforme a las condiciones del plan y lo establecido en la Cláusula 3.
                        </p>
                        <p className="mb-2">
                            <strong>Finalidad Operativa:</strong> Este aporte tiene una finalidad estrictamente operativa y contractual, constituyendo el capital necesario para la ejecución del plan seleccionado por el usuario, bajo la modalidad de un acuerdo mercantil de riesgo. El BTC transferido deja de estar bajo la disposición directa o custodia del usuario para ser integrado en la operación de la plataforma.
                        </p>
                        <p className="mb-2">El usuario reconoce y acepta que:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>El aporte no genera relación bancaria, ni constituye captación de saldos o dinero en efectivo.</li>
                            <li>El BTC transferido se aplica de forma irrevocable a las condiciones y al plazo del plan aceptado.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-bold text-white mb-2">3. Planes de Retorno Pactado y Reglas de Liquidación</h3>
                        <p className="mb-2">
                            Los planes ofrecidos contemplan un retorno previamente definido, sujeto al cumplimiento del plazo y condiciones establecidas en cada plan.
                        </p>
                        <p className="mb-2">
                            <strong>Obligación de Restitución del Aporte (Incumplimiento de Cloud Capital):</strong><br />
                            Cloud Capital asume contractualmente la obligación de restitución del valor nominal del Aporte de Activos Digitales (BTC) inicial, el cual será devuelto al usuario únicamente en caso de incumplimiento de las condiciones esenciales del plan atribuible a la plataforma. Esta obligación no se extiende a la materialización del Retorno Pactado o de cualquier ganancia potencial.
                        </p>
                        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 my-2">
                            <p className="mb-1 text-red-200 font-bold">
                                Liquidación Anticipada (Incumplimiento del Usuario):
                            </p>
                            <p className="text-red-100/90 text-sm">
                                Si el usuario decide terminar o liquidar el plan antes del plazo contractual sujeto (duplicar el capital inical), dicha acción se considerará un incumplimiento unilateral del acuerdo. En este caso, se aplicará una penalidad operativa equivalente al 38% del Aporte total transferido. Las partes reconocen que esta penalidad guarda proporcionalidad con los costos operativos, compromisos asumidos y la desestructuración anticipada del plan.
                            </p>
                        </div>
                        <p>
                            El retorno pactado no constituye garantía financiera estatal, bancaria o regulatoria, sino una obligación contractual privada aceptada voluntariamente por el usuario.
                        </p>
                    </section>

                    <section>
                        <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="text-profit w-5 h-5" />
                            <h3 className="font-bold text-white text-lg">4. Aceptación de Riesgos</h3>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 my-2">
                            <p className="mb-2 text-orange-200 text-sm font-semibold">
                                El usuario reconoce que, aun cuando los planes establezcan retornos pactados, existen riesgos inherentes, incluyendo, sin limitarse a:
                            </p>
                            <ul className="list-disc pl-5 space-y-1 text-orange-100/80 text-sm">
                                <li>Riesgos de activos digitales (volatilidad de precios).</li>
                                <li>Riesgos tecnológicos y operativos.</li>
                                <li>Fallas de red o blockchain.</li>
                                <li>Cambios regulatorios.</li>
                                <li>Eventos de fuerza mayor.</li>
                            </ul>
                        </div>
                        <p className="mb-2">
                            El uso de la plataforma implica la aceptación expresa de dichos riesgos.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-white mb-2">5. Colaboradores Independientes</h3>
                        <p>
                            Las operaciones de ingreso (aporte) y egreso (liquidación) pueden ser gestionadas por colaboradores independientes, quienes actúan bajo acuerdos privados y no mantienen relación laboral, societaria ni de representación legal con Cloud Capital.
                            Cloud Capital provee la infraestructura tecnológica para la interacción, sin asumir responsabilidad por actos u omisiones individuales de los colaboradores, salvo lo expresamente indicado en estos términos.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-white mb-2">6. Retiros de Retorno y Costos Operativos</h3>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Toda solicitud de retiro del retorno pactado (egreso) está sujeta a un costo operativo fijo, visible antes de la confirmación de la solicitud.</li>
                            <li>Los costos operativos aplicados no son reembolsables, independientemente de la aceptación o rechazo de la orden.</li>
                            <li>Los tiempos de procesamiento son estimados y pueden variar por validaciones operativas o de red.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="font-bold text-white mb-2">7. Limitación de Responsabilidad</h3>
                        <p className="mb-2">En ningún caso Cloud Capital será responsable por:</p>
                        <ul className="list-disc pl-5 space-y-1">
                            <li>Pérdidas indirectas o consecuenciales.</li>
                            <li>La no realización del Retorno Pactado (ganancias) o de las expectativas de lucro.</li>
                            <li>Volatilidad del mercado.</li>
                            <li>Fallas de terceros, red o blockchain.</li>
                            <li>Decisiones del usuario.</li>
                        </ul>
                        <p className="mt-2">
                            La responsabilidad de Cloud Capital se limita exclusivamente a lo expresamente establecido en estos términos, incluyendo la obligación de restitución sobre el Aporte inicial (Cláusula 3).
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-white mb-2">8. Cumplimiento Legal del Usuario</h3>
                        <p>
                            El usuario es único responsable de cumplir con las leyes y obligaciones tributarias de su jurisdicción.
                            Cloud Capital no verifica ni garantiza el cumplimiento normativo individual del usuario.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-white mb-2">9. Modificaciones</h3>
                        <p>
                            Cloud Capital podrá modificar estos Términos y Condiciones en cualquier momento.
                            Las modificaciones entrarán en vigor desde su publicación.
                            El uso continuado de la plataforma implica aceptación automática de los cambios.
                        </p>
                    </section>

                    <section>
                        <h3 className="font-bold text-white mb-2">10. Aceptación Expresa</h3>
                        <p>
                            Al registrarse, realizar un aporte o activar un plan, el usuario declara haber leído, comprendido y aceptado íntegramente los presentes Términos y Condiciones, incluyendo expresamente la Cláusula 3 relativa a la penalidad del 38% por liquidación anticipada, constituyendo un contrato privado por adhesión válido y vinculante.
                        </p>
                    </section>
                </div>

                {/* Scroll Indicator */}
                {showScrollIndicator && (
                    <div className="absolute bottom-20 left-0 right-0 flex justify-center pointer-events-none animate-bounce">
                        <div className="bg-gray-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-profit border border-profit/30 flex items-center gap-1 shadow-lg">
                            Desliza para leer más <ArrowDown size={14} />
                        </div>
                    </div>
                )}

                <div className="mt-6 pt-4 border-t border-gray-700 flex justify-end">
                    <button
                        onClick={onClose}
                        className="w-full sm:w-auto bg-profit hover:bg-emerald-500 text-white font-bold py-3 sm:py-2 px-6 rounded-lg transition duration-200 shadow-lg shadow-emerald-500/20"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};
