import { useState, useEffect } from 'react';

interface CountdownProps {
    targetDate: string; // ISO date string
    onExpire?: () => void;
}

export const Countdown: React.FC<CountdownProps> = ({ targetDate, onExpire }) => {
    const [timeLeft, setTimeLeft] = useState('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const difference = new Date(targetDate).getTime() - new Date().getTime();

            if (difference <= 0) {
                setIsExpired(true);
                setTimeLeft('Expirado');
                if (onExpire) {
                    onExpire();
                }
                return;
            }

            const hours = Math.floor(difference / (1000 * 60 * 60));
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);

            setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate, onExpire]);

    return (
        <span className={`countdown ${isExpired ? 'expired' : ''}`}>
            {timeLeft}
        </span>
    );
};
