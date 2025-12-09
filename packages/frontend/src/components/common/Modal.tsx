import { createPortal } from 'react-dom';
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
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            const timer = setTimeout(() => {
                setIsVisible(false);
                document.body.style.overflow = 'unset';
            }, 300);
            return () => clearTimeout(timer);
        }

        // Safety cleanup to ensure overflow is restored if component unmounts while open
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isVisible) return null;

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    const handleClose = () => {
        onClose();
    };

    return createPortal(
        <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
            <div
                className="absolute inset-0 bg-black/30 backdrop-blur-md"
                onClick={handleClose}
            />
            <div className={`glass-strong w-full ${maxWidthClasses[maxWidth]} max-h-[90vh] overflow-y-auto p-5 sm:p-8 rounded-2xl shadow-2xl relative z-10 border border-gray-700/50 transition-all duration-300 transform ${isOpen ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
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
        </div>,
        document.body
    );
};
