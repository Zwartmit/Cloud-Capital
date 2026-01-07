import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { investmentPlanService, InvestmentPlan } from '../../services/investmentPlanService';
import { systemConfigService } from '../../services/systemConfigService';
import { Calendar, Save, CheckCircle, AlertTriangle, Users } from 'lucide-react';

export const ProfitManager: React.FC = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [processingTime, setProcessingTime] = useState('00:00'); // Default to midnight
    const [plans, setPlans] = useState<InvestmentPlan[]>([]);
    const [rates, setRates] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [processedStatus, setProcessedStatus] = useState(false);

    // Referral commission state
    const [referralCommissionRate, setReferralCommissionRate] = useState<number>(0.10);
    const [loadingCommission, setLoadingCommission] = useState(false);
    const [commissionMessage, setCommissionMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        loadPlans();
        loadReferralCommissionRate();
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

    // Auto-hide commission messages after 10 seconds
    useEffect(() => {
        if (commissionMessage) {
            const timer = setTimeout(() => {
                setCommissionMessage(null);
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [commissionMessage]);

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

    const loadReferralCommissionRate = async () => {
        try {
            const rate = await systemConfigService.getReferralCommissionRate();
            setReferralCommissionRate(rate);
        } catch (error) {
            console.error('Error loading referral commission rate:', error);
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

    const handleSaveCommission = async () => {
        setLoadingCommission(true);
        setCommissionMessage(null);

        try {
            await systemConfigService.updateReferralCommissionRate(referralCommissionRate);
            setCommissionMessage({ type: 'success', text: 'Comisión de referido actualizada exitosamente' });
        } catch (error: any) {
            setCommissionMessage({ type: 'error', text: error.response?.data?.error || 'Error al actualizar comisión' });
        } finally {
            setLoadingCommission(false);
        }
    };

    // Manual processing removed - profits are processed automatically at midnight

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Profit Rates - Takes 2 columns */}
            <div className="lg:col-span-2 card p-6 rounded-xl border-t-4 border-profit">
                {/* Date and Time Selection */}
                <div className="mb-8">
                    <label className="block text-gray-400 text-sm mb-2">Fecha y hora de procesamiento</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-2 items-center">
                            <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="bg-transparent text-white w-full focus:outline-none"
                            />
                        </div>
                        <div className="flex bg-gray-800 rounded-lg border border-gray-700 p-2 items-center">
                            <span className="text-gray-400 mr-2">🕐</span>
                            <input
                                type="time"
                                value={processingTime}
                                onChange={(e) => setProcessingTime(e.target.value)}
                                className="bg-transparent text-white w-full focus:outline-none"
                            />
                        </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {processingTime === '00:00'
                            ? 'Los pagos se procesarán a medianoche (por defecto)'
                            : `Los pagos se procesarán a las ${processingTime}`
                        }
                    </p>
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
                            <p className="text-sm">Configura las tasas y guarda. El pago automático ocurrirá a la media noche.</p>
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
                </div>

                {message && (
                    <div className={`mt-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {message.type === 'success' ? <CheckCircle className="w-5 h-5 mr-2" /> : <AlertTriangle className="w-5 h-5 mr-2" />}
                        {message.text}
                    </div>
                )}
            </div>

            {/* Referral Commission Configuration - Takes 1 column */}
            <div className="lg:col-span-1 card p-6 rounded-xl border-t-4 border-purple-500">
                <div className="flex items-center gap-3 mb-4">
                    <Users className="w-6 h-6 text-purple-400" />
                    <h2 className="text-lg font-bold text-white">Comisiones de referido</h2>
                </div>
                <p className="text-gray-400 text-xs mb-6">
                    Configura los pagos de comisiones por referido. Esto aplica para los planes pasivos de 3% y 6%
                </p>

                {/* Custom Percentage Input */}
                <div className="space-y-3 mb-6">
                    <label className="block text-xs text-gray-400 mb-1">Porcentaje de comisión</label>
                    <div className="relative">
                        <input
                            type="number"
                            value={referralCommissionRate * 100}
                            onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                const newValue = isNaN(val) ? 0 : val;
                                if (newValue >= 0 && newValue <= 100) {
                                    setReferralCommissionRate(newValue / 100);
                                }
                            }}
                            className="w-full pl-4 pr-8 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition"
                            placeholder="Ej: 5"
                            min="0"
                            max="100"
                            step="0.1"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-bold">
                            %
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 italic">
                        Ingresa el porcentaje exacto (0-100) que recibirán los usuarios.
                    </p>
                </div>

                {/* Save button */}
                <button
                    onClick={handleSaveCommission}
                    disabled={loadingCommission}
                    className="w-full flex items-center justify-center px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm font-bold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4 mr-2" />
                    {loadingCommission ? 'Guardando...' : 'Guardar'}
                </button>

                {/* Commission message */}
                {commissionMessage && (
                    <div className={`mt-4 p-3 rounded-lg flex items-start ${commissionMessage.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                        {commissionMessage.type === 'success' ? <CheckCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />}
                        <span className="text-xs">{commissionMessage.text}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
