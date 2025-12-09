import { ChevronDown } from 'lucide-react';

interface FAQ {
    question: string;
    answer: string;
}

const faqs: FAQ[] = [
    // Modelo de negocio y rentabilidad
    {
        question: '¿Cómo funciona el modelo de inversión de Cloud Capital?',
        answer:
            'Cloud Capital combina minería de criptomonedas con energía limpia y servicios en la nube para startups. Tu inversión se integra en operaciones reales respaldadas por infraestructura tecnológica y centros de datos ecológicos.',
    },
    {
        question: '¿De dónde provienen las ganancias?',
        answer:
            'Las ganancias provienen de la minería sostenible de criptomonedas y de los servicios cloud empresariales, generando ingresos estables y escalables.',
    },
    {
        question: '¿Qué diferencia a Cloud Capital de otras plataformas?',
        answer:
            'A diferencia de los modelos especulativos, Cloud Capital no depende de entradas nuevas para sostener ganancias. Nuestra rentabilidad proviene de operaciones reales, con un compromiso ecológico y sostenible.',
    },
    {
        question: '¿Cuánto puedo ganar y con qué frecuencia?',
        answer:
            'Dependiendo del plan, puedes obtener entre un 2% semanal y un 2% diario. Los rendimientos se acreditan automáticamente y puedes reinvertirlos o retirarlos cuando desees.',
    },
    {
        question: '¿Cómo sé que mis rendimientos son reales?',
        answer:
            'Podrás verificar tus resultados desde tu panel personal con métricas actualizadas e informes automáticos. Publicamos reportes semanales de rendimiento y consumo energético.',
    },
    // Seguridad y Transacciones
    {
        question: '¿Mi inversión está segura?',
        answer:
            'Sí. Trabajamos con carteras frías de custodia, encriptación avanzada y centros de datos certificados. Todo el sistema está diseñado para ofrecer máxima transparencia y protección.',
    },
    {
        question: '¿Qué necesito para empezar a invertir?',
        answer:
            'Solo necesitas crear una cuenta, verificar tu identidad y realizar un depósito mínimo en criptomonedas. Desde tu panel podrás elegir un plan y monitorear tus rendimientos en tiempo real.',
    },
    {
        question: '¿Cómo realizo un depósito de capital?',
        answer:
            'Ofrecemos dos métodos: 1) Automático, enviando BTC directamente a su dirección de depósito única para acreditación inmediata; y 2) Manual, mediante transferencia bancaria local, lo cual requiere que envíe el comprobante al soporte para una revisión y acreditación que puede tardar hasta 48 horas.',
    },
    {
        question: '¿Puedo retirar mi dinero en cualquier momento?',
        answer:
            'Sí, los retiros están habilitados las 24 horas y pueden solicitarse en cualquier momento. Los desembolsos se procesan cada viernes y se acreditan directamente a tu billetera sin intermediarios ni demoras.',
    },
    // Programa de Afiliados y Soporte
    {
        question: '¿Puedo invitar a otras personas?',
        answer:
            'Sí. Contamos con un Programa de Embajadores mediante el cual puedes obtener comisiones adicionales por cada inversor que se registre con tu enlace personal. Es una forma de convertir tu red en ingresos pasivos.',
    },
    {
        question: '¿Cómo funciona el Programa Cloud Partnership (Afiliados)?',
        answer:
            'Puede obtener una comisión directa del 10% sobre el capital inicial que invierta cada persona que se registre utilizando su enlace de afiliado personal. Es una forma de generar ingresos adicionales y pasivos por la construcción de su red.',
    },
    {
        question: '¿Dónde puedo recibir soporte o asistencia?',
        answer:
            'Nuestro equipo de soporte está disponible 24/7 a través del chat en línea y correo electrónico. También contamos con canales oficiales en Telegram y Discord para comunicación directa.',
    },
];

import { ScrollReveal } from '../common/ScrollReveal';

export const FAQ: React.FC = () => {
    return (
        <section id="faq-section" className="max-w-4xl mx-auto mb-12 sm:mb-20 px-4 sm:px-6">
            <h2 className="text-3xl sm:text-4xl font-bold text-center text-white mb-6 sm:mb-10">
                Preguntas frecuentes
            </h2>
            <div className="space-y-3 sm:space-y-4">
                {faqs.map((faq, i) => (
                    <ScrollReveal key={i} animation="fade-in" delay={i * 0.05}>
                        <details
                            className="card !bg-[#0B1120] border border-gray-800 rounded-xl p-3 sm:p-4 transition-all duration-300 group hover:border-accent"
                        >
                            <summary className="cursor-pointer text-lg font-semibold text-white flex justify-between items-center py-1">
                                {faq.question}
                                <span className="text-accent text-lg transform group-open:rotate-180 transition-transform duration-300 ml-2 flex-shrink-0">
                                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5" />
                                </span>
                            </summary>
                            <p className="mt-2 sm:mt-3 text-gray-400 leading-relaxed border-t border-gray-700 pt-2 sm:pt-3 text-base">
                                {faq.answer}
                            </p>
                        </details>
                    </ScrollReveal>
                ))}
            </div>
        </section>
    );
};
