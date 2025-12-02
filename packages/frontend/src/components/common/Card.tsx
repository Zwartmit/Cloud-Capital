import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = true }) => {
    return (
        <div className={`card ${hover ? 'hover:shadow-2xl' : ''} ${className}`}>
            {children}
        </div>
    );
};
