import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { investmentPlanService, InvestmentPlan } from '../../services/investmentPlanService';
import { Calendar, Save, Play, CheckCircle, AlertTriangle } from 'lucide-react';

export const ProfitManager: React.FC = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [plans, setPlans] = useState<InvestmentPlan[]>([]);
    const [rates, setRates] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [processedStatus, setProcessedStatus] = useState(false);

    useEffect(() => {
        loadPlans();
    }, []);

    useEffect(() => {
        if (plans.length > 0) {
            loadRates(date);
        }
    }, [date, plans]);

    // Auto-hide messages after 10 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    // Auto-hide messages after 10 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const loadPlans = async () => {
        try {
            const data = await investmentPlanService.getAllPlans();
            setPlans(data);
            // Initialize rates
            const initialRates: any = {};
            data.forEach(p => initialRates[p.name] = 0);
            setRates(initialRates);
        } catch (error) {
            console.error('Error loading plans:', error);
        }
    };

    const loadRates = async (selectedDate: string) => {
        const resetRates: any = {};
        plans.forEach(p => resetRates[p.name] = 0);

        try {
            const data = await adminService.getDailyRates(selectedDate);
            // data is DailyProfitRate[]

            let isProcessed = false;
            const newRates = { ...resetRates };

            if (data && Array.isArray(data) && data.length > 0) {
                data.forEach((r: any) => {
                    newRates[r.investmentClass] = r.rate;
                    if (r.processed) isProcessed = true;
                });
            }
            setRates(newRates);
            setProcessedStatus(isProcessed);
        } catch (error) {
            console.error('Error loading rates:', error);
            setRates(resetRates);
            setProcessedStatus(false);
        }
    };

    const handleRateChange = (planName: string, value: string) => {
        if (processedStatus) return; // Locked
        setRates(prev => ({ ...prev, [planName]: parseFloat(value) || 0 }));
    };

    const isRateValid = (plan: InvestmentPlan) => {
        const rate = rates[plan.name];
        if (rate === undefined) return true; // Not edited yet or initial
        return rate >= plan.minDailyReturn && rate <= plan.maxDailyReturn;
    };

    const handleSave = async () => {
        setLoading(true);
        setMessage(null);

        // Validation
        const invalidPlans = plans.filter(p => !isRateValid(p));
        if (invalidPlans.length > 0) {
            setMessage({
                type: 'error',
                text: `Tasas inválidas para: ${invalidPlans.map(p => p.name).join(', ')}. Verifica los rangos permitidos.`
            });
            setLoading(false);
            return;
        }

        try {
            const ratesArray = Object.entries(rates).map(([name, rate]) => ({
                investmentClass: name,
                rate
            }));
            await adminService.setDailyRates(date, ratesArray);
            setMessage({ type: 'success', text: 'Tasas guardadas exitosamente' });
            loadRates(date);
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error al guardar tasas' });
        } finally {
            setLoading(false);
        }
    };

    const handleProcess = async () => {
        if (!confirm('¿Deseas procesar los pagos para esta fecha? Esto acreditará los saldos a los usuarios.')) return;
        setProcessing(true);
        setMessage(null);
        try {
            const res = await adminService.triggerProfitProcess(date);
            setMessage({ type: 'success', text: `Procesamiento completado: ${res.message}` });
            await loadRates(date); // Refresh status
        } catch (error: any) {
            setMessage({ type: 'error', text: error.response?.data?.error || 'Error al procesar' });
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="card p-6 rounded-xl border-t-4 border-profit">
            {/* Section Header */}
            <div className="mb-6 p-6 bg-gray-800 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-white mb-2">Control de rentabilidad diaria</h3>
                <p className="text-gray-400">
                    Configura y procesa los rendimientos diarios que se pagarán a los usuarios.
                    Define la tasa para cada plan (dentro de los rangos permitidos) y procesa los pagos al final del día.
                    <span className="block mt-2 text-yellow-500 text-sm">⚠️ Las tasas aquí configuradas son las que realmente suman dinero al balance de los usuarios.</span>
                </p>
            </div>



            {/* Date Selection */}
            <div className="mb-8">
                <label className="block text-gray-400 text-sm mb-2">Seleccionar fecha</label>
                <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-2 w-full max-w-xs items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="bg-transparent text-white w-full focus:outline-none"
                    />
                </div>
            </div>

            {/* Rates Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {plans.map((plan) => (
                    <div key={plan.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                        <label className="block text-gray-400 text-xs mb-1 uppercase tracking-wider">{plan.name}</label>
                        <div className="flex items-center">
                            <input
                                type="number"
                                step="0.01"
                                min={plan.minDailyReturn}
                                max={plan.maxDailyReturn}
                                value={rates[plan.name] || ''}
                                onChange={(e) => handleRateChange(plan.name, e.target.value)}
                                disabled={processedStatus}
                                className={`w-24 bg-gray-900 border rounded p-2 text-white font-mono text-right focus:outline-none disabled:opacity-50 ${isRateValid(plan)
                                    ? 'border-gray-600 focus:border-profit'
                                    : 'border-red-500 focus:border-red-500 text-red-500'
                                    }`}
                            />
                            <span className="ml-2 text-gray-400 font-bold">%</span>
                        </div>
                        <p className={`text-xs mt-2 ${isRateValid(plan) ? 'text-gray-500' : 'text-red-500 font-bold'}`}>
                            Rango: {plan.minDailyReturn}% - {plan.maxDailyReturn}%
                        </p>
                    </div>
                ))}
            </div>

            {/* Status Banner */}
            {processedStatus ? (
                <div className="bg-green-500/10 border border-green-500/30 text-green-500 p-4 rounded-lg mb-6 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-3" />
                    <div>
                        <p className="font-bold">Procesado</p>
                        <p className="text-sm">Las ganancias de este día ya han sido distribuidas a los usuarios.</p>
                    </div>
                </div>
            ) : (
                <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-4 rounded-lg mb-6 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-3" />
                    <div>
                        <p className="font-bold">Pendiente de proceso</p>
                        <p className="text-sm">Configura las tasas y guarda. El pago automático ocurrirá a la media noche, o puedes forzarlo manualmente.</p>
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className="flex flex-col items-center sm:flex-row gap-4 border-t border-gray-700 pt-6">
                <button
                    onClick={handleSave}
                    disabled={loading || processedStatus}
                    className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-5 h-5 mr-2" />
                    {loading ? 'Guardando...' : 'Guardar tasas'}
                </button>

                {!processedStatus && (
                    <button
                        onClick={handleProcess}
                        disabled={processing}
                        className="flex items-center justify-center px-6 py-3 bg-profit hover:bg-emerald-400 text-black font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed sm:ml-auto"
                    >
                        <Play className="w-5 h-5 mr-2" />
                        {processing ? 'Procesando...' : 'Procesar pagos ahora'}
                    </button>
                )}
            </div>

            {message && (
                <div className={`mt-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                    {message.text}
                </div>
            )}
        </div>
    );
};
