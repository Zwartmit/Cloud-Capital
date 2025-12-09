import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    baseX: number;
    baseY: number;
    vx: number;
    vy: number;
    size: number;
    speedX: number;
    speedY: number;
    depth: number;
    color: string;
}

export const ParticlesBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
    const animationRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Resize canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        // Initialize particles
        const initParticles = () => {
            particlesRef.current = [];
            const colors = ['#00d4ff', '#ff00ff', '#00ff88'];
            const particleCount = window.innerWidth < 768 ? 60 : 180;

            for (let i = 0; i < particleCount; i++) {
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    baseX: Math.random() * canvas.width,
                    baseY: Math.random() * canvas.height,
                    vx: 0,
                    vy: 0,
                    size: Math.random() * 2.5 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    depth: Math.random() * 0.7 + 0.3,
                    color: colors[Math.floor(Math.random() * colors.length)]
                });
            }
        };

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.targetX = e.clientX;
            mouseRef.current.targetY = e.clientY;
        };

        // Update mouse position smoothly
        const updateMousePosition = () => {
            mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
            mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.1;
        };

        // Draw particles
        const drawParticles = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updateMousePosition();

            const particles = particlesRef.current;
            const mouse = mouseRef.current;

            particles.forEach(particle => {
                // Base movement
                particle.baseX += particle.speedX;
                particle.baseY += particle.speedY;

                // Wrap around
                if (particle.baseX < 0) particle.baseX = canvas.width;
                if (particle.baseX > canvas.width) particle.baseX = 0;
                if (particle.baseY < 0) particle.baseY = canvas.height;
                if (particle.baseY > canvas.height) particle.baseY = 0;

                // Calculate distance to mouse
                const dx = mouse.x - particle.baseX;
                const dy = mouse.y - particle.baseY;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // Attraction towards mouse with limit
                const maxDistance = 300;
                const attraction = Math.max(0, 1 - distance / maxDistance);

                if (distance < maxDistance) {
                    const force = attraction * 0.5 * particle.depth;
                    particle.vx += (dx / distance) * force;
                    particle.vy += (dy / distance) * force;
                }

                // Apply friction
                particle.vx *= 0.85;
                particle.vy *= 0.85;

                // Limit max speed
                const maxSpeed = 3;
                const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                if (speed > maxSpeed) {
                    particle.vx = (particle.vx / speed) * maxSpeed;
                    particle.vy = (particle.vy / speed) * maxSpeed;
                }

                // Update final position
                particle.x = particle.baseX + particle.vx * 10;
                particle.y = particle.baseY + particle.vy * 10;

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.size * particle.depth, 0, Math.PI * 2);
                ctx.fillStyle = particle.color;
                ctx.shadowBlur = 15 * particle.depth;
                ctx.shadowColor = particle.color;
                ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 100) {
                        ctx.beginPath();
                        const opacity = (1 - distance / 100) * 0.25;
                        const alpha = Math.floor(opacity * 255).toString(16).padStart(2, '0');
                        ctx.strokeStyle = particles[i].color + alpha;
                        ctx.lineWidth = 1;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        // Animation loop
        const animate = () => {
            drawParticles();
            animationRef.current = requestAnimationFrame(animate);
        };

        // Initialize
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        window.addEventListener('mousemove', handleMouseMove);
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none"
            style={{ background: '#000000', zIndex: -1 }}
        />
    );
};
