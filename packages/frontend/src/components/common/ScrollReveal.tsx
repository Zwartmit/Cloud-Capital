import React, { useRef, useEffect, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    animation?: 'fade-in' | 'slide-in' | 'scale-in';
    duration?: number;
    delay?: number;
    className?: string;
    threshold?: number;
    offset?: number;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
    children,
    animation = 'fade-in',
    duration = 0.6,
    delay = 0,
    className = '',
    threshold = 0.1
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: threshold,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, [threshold]);

    const getAnimationName = () => {
        switch (animation) {
            case 'slide-in': return 'slideIn';
            case 'scale-in': return 'scaleIn';
            case 'fade-in': return 'fadeIn';
            default: return 'fadeIn';
        }
    };

    const style: React.CSSProperties = {
        opacity: isVisible ? undefined : 0,
        animationName: isVisible ? getAnimationName() : 'none',
        animationDuration: `${duration}s`,
        animationTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
        animationDelay: `${delay}s`,
        animationFillMode: 'both', // Ensure state is retained
    };

    return (
        <div ref={ref} className={className} style={style}>
            {children}
        </div>
    );
};
