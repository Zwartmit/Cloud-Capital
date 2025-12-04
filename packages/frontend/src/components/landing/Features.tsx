import { ShieldCheck, Leaf, BarChart3 } from 'lucide-react';

const features = [
    {
        icon: ShieldCheck,
        title: 'Máxima seguridad',
        description:
            'Tecnología de custodia en carteras frías y encriptación de nivel bancario.',
        color: 'text-accent',
        borderColor: 'border-accent',
    },
    {
        icon: Leaf,
        title: 'Rendimiento sostenible',
        description:
            'Operaciones respaldadas por energía limpia para un impacto ambiental positivo.',
        color: 'text-profit',
        borderColor: 'border-profit',
    },
    {
        icon: BarChart3,
        title: 'Transparencia total',
        description:
            'Acceso a métricas en tiempo real y reportes auditables de nuestras operaciones.',
        color: 'text-yellow-500',
        borderColor: 'border-yellow-500',
    },
];

export const Features: React.FC = () => {
    return (
        <section className="max-w-7xl mx-auto mb-16 sm:mb-28 px-4 sm:px-6">
            <div className="grid md:grid-cols-3 gap-4 sm:gap-8 text-center">
                {features.map((feature, index) => (
                    <div
                        key={index}
                        className={`card p-5 sm:p-8 shadow-2xl border-l-4 ${feature.borderColor}`}
                    >
                        <feature.icon className={`w-8 h-8 sm:w-10 sm:h-10 ${feature.color} mx-auto mb-3 sm:mb-4`} />
                        <h3 className="text-lg sm:text-xl font-bold mb-2 text-white">{feature.title}</h3>
                        <p className="text-gray-400 text-xs sm:text-sm">{feature.description}</p>
                    </div>
                ))}
            </div>
        </section>
    );
};
