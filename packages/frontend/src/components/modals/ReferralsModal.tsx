import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { userService } from '../../services/userService';
import { UserDTO } from '@cloud-capital/shared';
import { formatUSDT } from '../../utils/formatters';
import { getPlanColor } from '../../utils/planStyles';

interface ReferralsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ReferralsModal: React.FC<ReferralsModalProps> = ({ isOpen, onClose }) => {
    const [referrals, setReferrals] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadReferrals();
        }
    }, [isOpen]);

    const loadReferrals = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await userService.getReferrals();
            setReferrals(data);
        } catch (err) {
            console.error('Error loading referrals:', err);
            setError('Error al cargar la lista de referidos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Mis Referidos">
            <div className="max-h-[60vh] overflow-y-auto pr-2">
                {loading ? (
                    <div className="text-center py-8 text-gray-400">Cargando referidos...</div>
                ) : error ? (
                    <div className="text-center py-8 text-red-500">{error}</div>
                ) : referrals.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                        <p>Aún no tienes referidos.</p>
                        <p className="text-xs mt-2">Comparte tu código para invitar usuarios.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {referrals.map((referral) => (
                            <div key={referral.id} className="bg-gray-800/50 p-3 rounded-lg border border-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <div>
                                    <p className="font-bold text-white text-sm">{referral.name}</p>
                                    <p className="text-xs text-gray-400">{referral.email}</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Registrado: {new Date(referral.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end gap-1 w-full sm:w-auto">
                                    <div className={`text-xs font-bold px-2 py-0.5 rounded border ${getPlanColor(referral.investmentClass || '')} bg-opacity-10 border-opacity-30`}>
                                        {referral.investmentClass || 'SIN PLAN'}
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        Balance: <span className="text-white font-bold">${formatUSDT(referral.currentBalanceUSDT || 0)}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Modal>
    );
};
