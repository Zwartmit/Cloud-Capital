import { X } from 'lucide-react';
import { ReactNode, useEffect, useState } from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    maxWidth = 'lg',
}) => {
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsAnimating(true);
        }
    }, [isOpen]);

    if (!isOpen && !isAnimating) return null;

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    const handleClose = () => {
        setIsAnimating(false);
        setTimeout(onClose, 200);
    };

    return (
        <div className={`modal fixed inset-0 z-50 flex items-center justify-center p-4 ${isOpen ? 'fade-in' : ''}`}>
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={handleClose}
            />
            <div className={`glass-strong w-full ${maxWidthClasses[maxWidth]} p-6 sm:p-8 rounded-2xl shadow-2xl relative z-10 border border-gray-700/50 ${isOpen ? 'scale-in' : ''}`}>
                <div className="flex justify-between items-center border-b border-gray-700/50 pb-4 mb-6">
                    <h3 className="text-xl sm:text-2xl font-black gradient-text-primary">{title}</h3>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition-all duration-200 hover:rotate-90 hover:scale-110"
                        aria-label="Cerrar"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};
