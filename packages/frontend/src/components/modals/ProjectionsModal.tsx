import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { TrendingUp, Calculator } from 'lucide-react';

interface ProjectionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface InvestmentPlan {
    id: string;
    name: string;
    dailyRate: number;
    minInvestment: number;
}

interface Projection {
    period: string;
    days: number;
    capital: number;
    profit: number;
    dailyAvg: number;
}

export const ProjectionsModal: React.FC<ProjectionsModalProps> = ({ isOpen, onClose }) => {
    const [selectedPlan, setSelectedPlan] = useState('');
    const [initialCapital, setInitialCapital] = useState('');
    const [projections, setProjections] = useState<Projection[]>([]);

    // Investment plans (TODO: fetch from API)
    const plans: InvestmentPlan[] = [
        { id: '1', name: 'BRONCE', dailyRate: 1.0, minInvestment: 100 },
        { id: '2', name: 'PLATA', dailyRate: 1.5, minInvestment: 500 },
        { id: '3', name: 'ORO', dailyRate: 1.75, minInvestment: 1000 },
        { id: '4', name: 'PLATINUM', dailyRate: 2.0, minInvestment: 2500 },
        { id: '5', name: 'DIAMANTE', dailyRate: 2.5, minInvestment: 5000 },
    ];

    const calculateProjections = () => {
        if (!selectedPlan || !initialCapital) return;

        const plan = plans.find(p => p.id === selectedPlan);
        if (!plan) return;

        const capital = parseFloat(initialCapital);
        if (capital < plan.minInvestment) {
            alert(`El capital mínimo para ${plan.name} es $${plan.minInvestment}`);
            return;
        }

        const periods = [
            { period: '7 días', days: 7 },
            { period: '30 días (1 mes)', days: 30 },
            { period: '90 días (3 meses)', days: 90 },
            { period: '180 días (6 meses)', days: 180 },
            { period: '365 días (1 año)', days: 365 },
        ];

        const results = periods.map(({ period, days }) => {
            const dailyProfit = capital * (plan.dailyRate / 100);
            const totalProfit = dailyProfit * days;
            const finalCapital = capital + totalProfit;

            return {
                period,
                days,
                capital: finalCapital,
                profit: totalProfit,
                dailyAvg: dailyProfit,
            };
        });

        setProjections(results);
    };

    useEffect(() => {
        if (selectedPlan && initialCapital) {
            calculateProjections();
        } else {
            setProjections([]);
        }
    }, [selectedPlan, initialCapital]);

    const selectedPlanData = plans.find(p => p.id === selectedPlan);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Proyecciones de Inversión" maxWidth="2xl">
            {/* Info Box */}
            <div className="bg-blue-900/20 border border-blue-700 p-4 rounded-lg mb-6">
                <div className="flex items-start gap-2">
                    <Calculator className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-blue-400 mb-1">Calculadora de Proyecciones</h4>
                        <p className="text-sm text-gray-300">
                            Calcula tus ganancias potenciales según el plan de inversión y capital inicial.
                            Las proyecciones son estimadas y pueden variar.
                        </p>
                    </div>
                </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Plan de Inversión
                    </label>
                    <select
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                        <option value="">Selecciona un plan</option>
                        {plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                                {plan.name} - {plan.dailyRate}% diario (Min: ${plan.minInvestment})
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Capital Inicial (USDT)
                    </label>
                    <input
                        type="number"
                        value={initialCapital}
                        onChange={(e) => setInitialCapital(e.target.value)}
                        placeholder="Ej: 1000"
                        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                </div>
            </div>

            {/* Plan Info */}
            {selectedPlanData && (
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-xs text-gray-400">Plan</p>
                            <p className="text-lg font-bold text-accent">{selectedPlanData.name}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Tasa Diaria</p>
                            <p className="text-lg font-bold text-profit">{selectedPlanData.dailyRate}%</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-400">Mínimo</p>
                            <p className="text-lg font-bold text-white">${selectedPlanData.minInvestment}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Projections Table */}
            {projections.length > 0 && (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-700">
                                <th className="text-left py-3 px-2 text-gray-400 font-semibold">Período</th>
                                <th className="text-right py-3 px-2 text-gray-400 font-semibold">Días</th>
                                <th className="text-right py-3 px-2 text-gray-400 font-semibold">Capital Final</th>
                                <th className="text-right py-3 px-2 text-gray-400 font-semibold">Ganancia Total</th>
                                <th className="text-right py-3 px-2 text-gray-400 font-semibold">Ganancia/Día</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projections.map((proj, index) => (
                                <tr
                                    key={index}
                                    className="border-b border-gray-800 hover:bg-gray-800/50 transition"
                                >
                                    <td className="py-3 px-2 text-white font-medium">{proj.period}</td>
                                    <td className="py-3 px-2 text-right text-gray-300">{proj.days}</td>
                                    <td className="py-3 px-2 text-right text-accent font-bold">
                                        ${proj.capital.toFixed(2)}
                                    </td>
                                    <td className="py-3 px-2 text-right text-profit font-bold">
                                        +${proj.profit.toFixed(2)}
                                    </td>
                                    <td className="py-3 px-2 text-right text-gray-300">
                                        ${proj.dailyAvg.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {projections.length === 0 && (
                <div className="text-center py-12">
                    <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">
                        Selecciona un plan e ingresa un capital inicial para ver las proyecciones
                    </p>
                </div>
            )}

            {/* Disclaimer */}
            <div className="mt-6 bg-yellow-900/20 border border-yellow-700 p-3 rounded-lg">
                <p className="text-xs text-yellow-400">
                    ⚠️ Las proyecciones son estimadas y basadas en rendimientos constantes.
                    Los resultados reales pueden variar según las condiciones del mercado.
                </p>
            </div>
        </Modal>
    );
};
