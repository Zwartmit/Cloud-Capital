import { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { TrendingUp, Calculator } from 'lucide-react';
import { investmentPlanService, InvestmentPlan } from '../../services/investmentPlanService';

interface ProjectionsModalProps {
    isOpen: boolean;
    onClose: () => void;
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

    const [plans, setPlans] = useState<InvestmentPlan[]>([]);
    const [isLoadingPlans, setIsLoadingPlans] = useState(false);

    useEffect(() => {
        const fetchPlans = async () => {
            if (isOpen) {
                setIsLoadingPlans(true);
                try {
                    const data = await investmentPlanService.getAllPlans();
                    setPlans(data);
                } catch (error) {
                    console.error('Error fetching plans:', error);
                } finally {
                    setIsLoadingPlans(false);
                }
            }
        };

        fetchPlans();
    }, [isOpen]);

    const calculateProjections = () => {
        if (!selectedPlan || !initialCapital) return;

        const plan = plans.find(p => p.id === selectedPlan);
        if (!plan) return;

        const capital = parseFloat(initialCapital);
        if (capital < plan.minCapital) {
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
            // Use dailyAverage for projections
            const dailyProfit = capital * (plan.dailyAverage / 100);
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
    }, [selectedPlan, initialCapital, plans]);

    const selectedPlanData = plans.find(p => p.id === selectedPlan);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Proyecciones de inversión" maxWidth="2xl">
            {/* Info Box */}
            <div className="bg-blue-900/20 border border-blue-700 p-3 rounded-lg mb-4">
                <div className="flex items-start gap-2">
                    <Calculator className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-blue-400 mb-1 text-xs">Calculadora de Proyecciones</h4>
                        <p className="text-xs text-gray-300 leading-relaxed">
                            {selectedPlanData
                                ? `Calculando estimación basada en el rendimiento promedio del ${selectedPlanData.dailyAverage}% diario.`
                                : 'Calcula tus ganancias potenciales según el plan de inversión y capital inicial.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                        Plan de Inversión
                    </label>
                    <select
                        value={selectedPlan}
                        onChange={(e) => setSelectedPlan(e.target.value)}
                        disabled={isLoadingPlans}
                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-accent transition-colors cursor-pointer disabled:opacity-50"
                    >
                        <option value="">{isLoadingPlans ? 'Cargando planes...' : 'Selecciona un plan'}</option>
                        {plans.map((plan) => (
                            <option key={plan.id} value={plan.id}>
                                {plan.name} ({plan.minDailyReturn}% - {plan.maxDailyReturn}%)
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                        Capital Inicial (USDT)
                    </label>
                    <input
                        type="number"
                        value={initialCapital}
                        onChange={(e) => setInitialCapital(e.target.value)}
                        placeholder="Ej: 1000"
                        className="w-full p-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:border-accent transition-colors"
                    />
                </div>
            </div>

            {/* Plan Info */}
            {selectedPlanData && (
                <div className="bg-gray-800 p-3 rounded-lg border border-gray-700 mb-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Plan</p>
                            <p className="text-sm font-bold text-accent truncate">{selectedPlanData.name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Rango Diario</p>
                            <p className="text-sm font-bold text-profit">{selectedPlanData.minDailyReturn}% - {selectedPlanData.maxDailyReturn}%</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-wide">Mínimo</p>
                            <p className="text-sm font-bold text-white">${selectedPlanData.minCapital}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Projections Table */}
            {projections.length > 0 && (
                <div className="overflow-x-auto rounded-lg border border-gray-700 mb-1">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-gray-800 text-gray-400">
                            <tr>
                                <th className="py-2 px-3 font-semibold">Período</th>
                                <th className="py-2 px-3 text-right font-semibold">Días</th>
                                <th className="py-2 px-3 text-right font-semibold">Estimado Final</th>
                                <th className="py-2 px-3 text-right font-semibold">Ganancia Est.</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {projections.map((proj, index) => (
                                <tr
                                    key={index}
                                    className="hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="py-2 px-3 text-white font-medium">{proj.period}</td>
                                    <td className="py-2 px-3 text-right text-gray-300">{proj.days}</td>
                                    <td className="py-2 px-3 text-right text-accent font-bold">
                                        ${proj.capital.toFixed(2)}
                                    </td>
                                    <td className="py-2 px-3 text-right text-profit font-bold">
                                        +${proj.profit.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Empty State */}
            {projections.length === 0 && (
                <div className="text-center py-8">
                    <TrendingUp className="w-12 h-12 text-gray-700 mx-auto mb-3" />
                    <p className="text-xs text-gray-400">
                        Selecciona un plan e ingresa un capital inicial para ver las proyecciones
                    </p>
                </div>
            )}

            {/* Disclaimer */}
            <div className="mt-4 bg-yellow-900/20 border border-yellow-700 p-2.5 rounded-lg flex gap-2 items-start">
                <span className="text-yellow-400 text-xs mt-0.5">⚠️</span>
                <p className="text-[10px] text-yellow-400 leading-tight">
                    * Proyecciones basadas en un promedio del {selectedPlanData?.dailyAverage || '...'}% diario.
                    La rentabilidad real fluctúa entre {selectedPlanData?.minDailyReturn || '...'}% y {selectedPlanData?.maxDailyReturn || '...'}% según condiciones del mercado.
                </p>
            </div>
        </Modal>
    );
};
