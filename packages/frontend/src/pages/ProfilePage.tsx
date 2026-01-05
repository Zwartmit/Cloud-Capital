import { useState, useEffect } from 'react';
import { Sidebar } from '../components/layout/Sidebar';
import { useAuthStore } from '../store/authStore';
import { userService } from '../services/userService';
import { investmentPlanService, InvestmentPlan } from '../services/investmentPlanService';
import { User, Mail, Calendar, Copy, Check, Search, Phone, TrendingUp } from 'lucide-react';
import { PasswordInput } from '../components/common/PasswordInput';
import { ReferralsModal } from '../components/modals/ReferralsModal';
import { EarlyLiquidationModal } from '../components/modals/EarlyLiquidationModal';
import { PhoneInput } from 'react-international-phone';
import 'react-international-phone/style.css';

export const ProfilePage: React.FC = () => {
    const { user, updateUser } = useAuthStore();
    const [investmentPlan, setInvestmentPlan] = useState<InvestmentPlan | null>(null);
    const [passwordMessage, setPasswordMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [btcAddressMessage, setBtcAddressMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [whatsappMessage, setWhatsappMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [btcAddress, setBtcAddress] = useState(user?.btcDepositAddress || '');
    const [whatsappNum, setWhatsappNum] = useState(user?.whatsappNumber || '');
    const [copiedLink, setCopiedLink] = useState(false);
    const [isReferralsModalOpen, setIsReferralsModalOpen] = useState(false);
    const [isLiquidationModalOpen, setIsLiquidationModalOpen] = useState(false);
    const [hasPendingLiquidation, setHasPendingLiquidation] = useState(false);
    const [passiveIncomeInfo, setPassiveIncomeInfo] = useState<{
        currentRate: number;
        dailyRate: number;
        hasFirstDeposit: boolean;
        hasSuccessfulReferral: boolean;
        isEligible: boolean;
    } | null>(null);

    // Generate invitation link
    const invitationLink = `${window.location.origin}/register?ref=${user?.referralCode || ''}`;
    const referralsCount = user?.referralsCount || 0;

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(invitationLink);
            setCopiedLink(true);
            setTimeout(() => setCopiedLink(false), 2000);
        } catch (err) {
            console.error('Failed to copy link:', err);
        }
    };

    // Sync state with user data when it changes
    useEffect(() => {
        if (user) {
            setBtcAddress(user.btcDepositAddress || '');
            setWhatsappNum(user.whatsappNumber || '');
        }
    }, [user]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch investment plan if user has one assigned
                if (user?.investmentClass) {
                    const plans = await investmentPlanService.getAllPlans();
                    const userPlan = plans.find(plan => plan.name === user.investmentClass);
                    setInvestmentPlan(userPlan || null);
                }

                // Check for pending liquidation task
                const tasks = await userService.getUserTasks();
                const pendingLiquidation = tasks.find(
                    (task: any) => task.type === 'LIQUIDATION' && task.status === 'PENDING'
                );
                setHasPendingLiquidation(!!pendingLiquidation);

                // Fetch passive income info
                try {
                    const passiveInfo = await userService.getPassiveIncomeInfo();
                    setPassiveIncomeInfo(passiveInfo);
                } catch (error) {
                    console.error('Error fetching passive income info:', error);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, [user?.investmentClass]);

    if (!user) {
        return null;
    }

    return (
        <div className="flex min-h-screen">
            <Sidebar />

            <main className="flex-grow p-4 sm:p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 border-b border-secondary pb-4">
                        <h2 className="text-2xl sm:text-4xl font-extrabold text-accent mb-2">
                            Mi perfil
                        </h2>
                        <p className="text-gray-400 text-sm sm:text-base">
                            Información de tu cuenta y estadísticas de inversión.
                        </p>
                    </div>

                    {/* Main Profile Card Container */}
                    <div className="card p-4 sm:p-6 rounded-xl border border-secondary">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Left Column: User Info + Investment Class */}
                            <div className="h-full">
                                {/* User Info Section */}
                                <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700/50 shadow-inner relative overflow-hidden group h-full flex flex-col justify-center">
                                    {/* Background decorative elements */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>

                                    <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-stretch gap-6 sm:gap-0">
                                        <div className="flex-1 w-full sm:w-1/2 flex flex-col items-center text-center justify-center sm:px-6">
                                            <div className="relative group-hover:scale-105 transition-transform duration-300">
                                                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-accent to-blue-600 flex items-center justify-center mb-4 shadow-xl shadow-accent/20 border-4 border-slate-800">
                                                    <User className="w-12 h-12 text-white" />
                                                </div>
                                                <div className="absolute bottom-4 right-1 w-5 h-5 bg-green-500 border-4 border-slate-800 rounded-full shadow-sm" title="Cuenta Activa"></div>
                                            </div>

                                            <h2 className="text-xl font-semibold text-white mb-4">
                                                {user.name}
                                            </h2>

                                            <div className="flex flex-col gap-2 mb-3 w-full">
                                                <div className="flex items-center justify-center space-x-2 text-xs">
                                                    <User className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-gray-300 font-medium">
                                                        @{user.username}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-center space-x-2 text-xs">
                                                    <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                    <span className="text-gray-300 font-medium break-all">
                                                        {user.email}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-center space-x-2 text-xs">
                                                <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                                <span className="text-gray-300 font-medium">
                                                    Miembro desde {new Date(user.createdAt).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                                </span>
                                            </div>

                                            {/* WhatsApp Section - Moved here */}
                                            <div className="w-full mt-4 pt-4 border-t border-gray-700/50">
                                                <h3 className="text-xs text-gray-500 mb-3 text-center sm:text-left">NÚMERO DE WHATSAPP</h3>
                                                <form onSubmit={async (e) => {
                                                    e.preventDefault();
                                                    try {
                                                        const updatedUser = await userService.updateProfile({
                                                            whatsappNumber: whatsappNum || undefined
                                                        });
                                                        updateUser(updatedUser);
                                                        setWhatsappMessage({ type: 'success', text: 'WhatsApp actualizado exitosamente' });
                                                        setTimeout(() => setWhatsappMessage(null), 5000);
                                                    } catch (error: any) {
                                                        setWhatsappMessage({ type: 'error', text: error.response?.data?.error || 'Error al actualizar WhatsApp' });
                                                    }
                                                }} className="space-y-3">
                                                    <div>
                                                        <PhoneInput
                                                            value={whatsappNum}
                                                            onChange={(phone) => setWhatsappNum(phone)}
                                                            defaultCountry="us"
                                                            placeholder="Selecciona país y escribe número"
                                                            className="w-full"
                                                            inputClassName="p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono focus:ring-accent focus:border-accent focus:outline-none w-full"
                                                        />
                                                    </div>
                                                    <button
                                                        type="submit"
                                                        className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition duration-200 text-sm"
                                                    >
                                                        Guardar WhatsApp
                                                    </button>
                                                </form>
                                                {whatsappMessage && (
                                                    <div className={`mt-3 p-3 rounded-lg text-sm ${whatsappMessage.type === 'success'
                                                        ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                                                        : 'bg-red-500/10 border border-red-500/20 text-red-500'
                                                        }`}>
                                                        {whatsappMessage.text}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex-1 w-full sm:w-1/2 flex flex-col h-full border-t sm:border-t-0 sm:border-l border-gray-700/50 pt-6 sm:pt-0 sm:px-6 justify-center items-center">
                                            {investmentPlan ? (
                                                <div className="rounded-xl h-full w-full flex flex-col justify-center items-center text-center">
                                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Clase de Inversión</p>
                                                    <span className="text-2xl font-black text-profit mb-1">
                                                        {investmentPlan.name}
                                                    </span>
                                                    <p className="text-xs text-gray-400">
                                                        {investmentPlan.minDailyReturn}% - {investmentPlan.maxDailyReturn}% diario
                                                    </p>
                                                    <p className="text-xs text-gray-500 mb-3">
                                                        Duplicación: {investmentPlan.doublingTime}
                                                    </p>
                                                    <button
                                                        onClick={() => setIsLiquidationModalOpen(true)}
                                                        disabled={hasPendingLiquidation}
                                                        className={`mt-2 w-full max-w-[200px] text-[10px] py-1.5 rounded transition-colors uppercase tracking-wider ${hasPendingLiquidation
                                                            ? 'bg-yellow-900/20 text-yellow-500 border border-yellow-700/30 cursor-not-allowed'
                                                            : 'bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300 border border-red-900/30'
                                                            }`}
                                                    >
                                                        {hasPendingLiquidation
                                                            ? '⏳ Solicitud enviada... Esperando confirmación'
                                                            : 'Liquidar plan/Darse de baja'
                                                        }
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="rounded-xl bg-gray-900/40 border border-gray-700/30 h-full w-full flex flex-col justify-center items-center text-center p-4">
                                                    <p className="text-xs text-gray-500">
                                                        Aún no tienes un plan activo
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Referrals + Password */}
                            <div className="space-y-4">
                                {/* Referrals Section */}
                                <div>
                                    <h3 className="text-xs text-gray-500 mb-3">PROGRAMA DE REFERIDOS</h3>
                                    <div className="p-3 sm:p-4 bg-secondary rounded-lg border border-gray-700">
                                        {user?.referredBy && (
                                            <div className="mb-4 pb-3 border-b border-gray-700">
                                                <p className="text-xs text-gray-400 mb-1">Te ha referido:</p>
                                                <p className="text-sm text-white font-semibold">
                                                    {user.referredBy.name} <span className="text-gray-500">(@{user.referredBy.username})</span>
                                                </p>
                                            </div>
                                        )}
                                        <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between mb-4">
                                            <div className="text-xs sm:text-sm text-gray-400">
                                                Tu código de referido: <span className="text-accent font-bold text-sm sm:text-base ml-1">{user?.referralCode || 'N/A'}</span>
                                            </div>
                                            <div className="text-xs sm:text-sm text-gray-500 flex items-center gap-2">
                                                <span>Referidos activos: <span className="text-white font-bold">{referralsCount}</span></span>
                                                <button
                                                    onClick={() => setIsReferralsModalOpen(true)}
                                                    className="p-1 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors border border-gray-700"
                                                    title="Ver referidos"
                                                >
                                                    <Search className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                        <label className="block text-xs text-gray-400 mb-2 uppercase tracking-wider">
                                            Link de invitación
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={invitationLink}
                                                readOnly
                                                className="flex-1 px-2 sm:px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs sm:text-sm text-gray-300 font-mono focus:outline-none focus:border-accent"
                                            />
                                            <button
                                                onClick={handleCopyLink}
                                                className="px-3 sm:px-4 py-2 bg-accent hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 text-sm"
                                                title="Copiar link"
                                            >
                                                {copiedLink ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Copiado</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" />
                                                        <span className="hidden sm:inline">Copiar</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            Comparte este link para invitar a tus amigos y obtener comisiones por cada uno que se registre y comience a invertir.
                                        </p>
                                    </div>
                                </div>

                                {/* Change Password Section */}
                                <div className="pt-4 sm:pt-3 border-t border-secondary">
                                    <h3 className="text-xs text-gray-500 mb-3">CAMBIAR CONTRASEÑA</h3>
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        const form = e.currentTarget;
                                        const formData = new FormData(form);
                                        const currentPassword = formData.get('currentPassword') as string;
                                        const newPassword = formData.get('newPassword') as string;
                                        const confirmPassword = formData.get('confirmPassword') as string;

                                        if (newPassword !== confirmPassword) {
                                            setPasswordMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
                                            return;
                                        }

                                        if (newPassword.length < 6) {
                                            setPasswordMessage({ type: 'error', text: 'La contraseña debe tener al menos 6 caracteres' });
                                            return;
                                        }

                                        try {
                                            await userService.changePassword(currentPassword, newPassword);
                                            setPasswordMessage({ type: 'success', text: 'Contraseña cambiada exitosamente' });
                                            form.reset();
                                            setTimeout(() => setPasswordMessage(null), 5000);
                                        } catch (error: any) {
                                            setPasswordMessage({ type: 'error', text: error.response?.data?.error || 'Error al cambiar la contraseña' });
                                        }
                                    }} className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                            <PasswordInput
                                                name="currentPassword"
                                                placeholder="Contraseña actual"
                                                required
                                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-accent focus:border-accent focus:outline-none"
                                            />
                                            <PasswordInput
                                                name="newPassword"
                                                placeholder="Nueva contraseña"
                                                required
                                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-accent focus:border-accent focus:outline-none"
                                            />
                                            <PasswordInput
                                                name="confirmPassword"
                                                placeholder="Confirmar"
                                                required
                                                className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white focus:ring-accent focus:border-accent focus:outline-none"
                                            />
                                        </div>
                                        <button
                                            type="submit"
                                            className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition duration-200 text-sm"
                                        >
                                            Cambiar contraseña
                                        </button>
                                    </form>
                                    {passwordMessage && (
                                        <div className={`mt-3 p-3 rounded-lg text-sm ${passwordMessage.type === 'success'
                                            ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                                            : 'bg-red-500/10 border border-red-500/20 text-red-500'
                                            }`}>
                                            {passwordMessage.text}
                                        </div>
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* BTC Address Section - Only for Collaborators/Admins */}
                        {(user.role === 'SUBADMIN' || user.role === 'SUPERADMIN') && (
                            <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-secondary">
                                <h3 className="text-xs text-gray-500 mb-3">DIRECCIÓN BTC PARA RETIROS</h3>
                                <form onSubmit={async (e) => {
                                    e.preventDefault();

                                    // Validate BTC address format
                                    const btcAddressRegex = /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/;
                                    if (btcAddress && !btcAddressRegex.test(btcAddress)) {
                                        setBtcAddressMessage({ type: 'error', text: 'Formato de dirección BTC inválido' });
                                        return;
                                    }

                                    try {
                                        const updatedUser = await userService.updateProfile({
                                            btcDepositAddress: btcAddress || undefined
                                        });
                                        updateUser(updatedUser);
                                        setBtcAddressMessage({ type: 'success', text: 'Dirección BTC actualizada exitosamente' });
                                        setTimeout(() => setBtcAddressMessage(null), 5000);
                                    } catch (error: any) {
                                        setBtcAddressMessage({ type: 'error', text: error.response?.data?.error || 'Error al actualizar dirección BTC' });
                                    }
                                }} className="space-y-3">
                                    <div>
                                        <input
                                            type="text"
                                            value={btcAddress}
                                            onChange={(e) => setBtcAddress(e.target.value)}
                                            placeholder="bc1q... o 1... o 3..."
                                            className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white font-mono focus:ring-accent focus:border-accent focus:outline-none"
                                        />
                                        <p className="text-xs text-gray-500 mt-1 italic">
                                            Esta dirección se usará para recibir BTC cuando usuarios soliciten retiros con colaborador
                                        </p>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full bg-accent hover:bg-blue-500 text-white font-bold py-2 rounded-lg transition duration-200 text-sm"
                                    >
                                        Guardar dirección BTC
                                    </button>
                                </form>
                                {btcAddressMessage && (
                                    <div className={`mt-3 p-3 rounded-lg text-sm ${btcAddressMessage.type === 'success'
                                        ? 'bg-green-500/10 border border-green-500/20 text-green-500'
                                        : 'bg-red-500/10 border border-red-500/20 text-red-500'
                                        }`}>
                                        {btcAddressMessage.text}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <ReferralsModal
                isOpen={isReferralsModalOpen}
                onClose={() => setIsReferralsModalOpen(false)}
            />

            <EarlyLiquidationModal
                isOpen={isLiquidationModalOpen}
                onClose={() => setIsLiquidationModalOpen(false)}
                capitalAmount={user?.capitalUSDT || 0}
                onSuccess={async () => {
                    try {
                        const updatedUser = await userService.getProfile();
                        updateUser(updatedUser);

                        // Refetch tasks to update pending liquidation status
                        const tasks = await userService.getUserTasks();
                        const pendingLiquidation = tasks.find(
                            (task: any) => task.type === 'LIQUIDATION' && task.status === 'PENDING'
                        );
                        setHasPendingLiquidation(!!pendingLiquidation);
                    } catch (error) {
                        console.error('Error updating profile:', error);
                    }
                }}
            />
        </div>
    );
};
