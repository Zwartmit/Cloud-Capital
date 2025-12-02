import { useEffect, useRef } from 'react';

interface BackgroundCanvasProps {
    className?: string;
}

export const BackgroundCanvas: React.FC<BackgroundCanvasProps> = ({ className = '' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        // Colores oscuros y profundos para el degradado nocturno
        const colors = ['#0A0A18', '#0D132D', '#111B3A', '#16244E', '#1D3065'];
        let colorStops = [0, 0.25, 0.5, 0.75, 1];
        let time = 0;

        const draw = () => {
            if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
                resizeCanvas();
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);

            time += 0.005;

            // Animación de los puntos de color más sutil
            colorStops[0] = Math.sin(time * 0.2) * 0.03 + 0;
            colorStops[2] = Math.sin(time * 0.15) * 0.03 + 0.5;
            colorStops[4] = Math.cos(time * 0.25) * 0.03 + 1;

            gradient.addColorStop(0, colors[0]);
            gradient.addColorStop(colorStops[1], colors[1]);
            gradient.addColorStop(colorStops[2], colors[2]);
            gradient.addColorStop(colorStops[3], colors[3]);
            gradient.addColorStop(1, colors[4]);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            animationFrameId = requestAnimationFrame(draw);
        };

        resizeCanvas();
        animationFrameId = requestAnimationFrame(draw);

        window.addEventListener('resize', resizeCanvas);

        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('resize', resizeCanvas);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className={`fixed top-0 left-0 w-full h-full -z-10 ${className}`}
        />
    );
};
