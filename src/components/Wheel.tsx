import { useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';

interface WheelProps {
    names: string[];
    onSpinEnd: (selected: string) => void;
}

export interface WheelHandle {
    startSpin: () => void;
}

const Wheel = forwardRef<WheelHandle, WheelProps>(({ names, onSpinEnd }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number | null>(null);
    const spinningRef = useRef<boolean>(false);
    const velocityRef = useRef<number>(0);
    const angleOffsetRef = useRef<number>(0);

    const drawWheel = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = Math.min(window.innerWidth * 0.7, window.innerHeight * 0.7);
        const radius = size / 2;
        const step = (2 * Math.PI) / Math.max(names.length, 1);

        canvas.width = size;
        canvas.height = size;

        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.translate(radius, radius);

        // Draw the segments of the wheel
        for (let i = 0; i < names.length; i++) {
            const startAngle = i * step + angleOffsetRef.current;
            const endAngle = startAngle + step;

            // Draw the segments
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, radius, startAngle, endAngle);
            ctx.fillStyle = `hsl(${(i * 360) / names.length}, 70%, 60%)`;
            ctx.fill();

            // Draw the name - HORIZONTAL TEXT VERSION
            const textAngle = startAngle + step / 2;
            const name = names[i];
            const fontSize = 16;
            const textRadius = radius * 0.7;

            ctx.save();
            ctx.rotate(textAngle);
            ctx.translate(textRadius, 0);

            // REMOVED the extra rotation that was making text vertical
            ctx.fillStyle = '#fff';
            ctx.font = `${fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(name, 0, 0);
            ctx.restore();
        }

        ctx.restore();

        // Draw arrow
        ctx.beginPath();
        ctx.moveTo(radius - 10, 10);
        ctx.lineTo(radius + 10, 10);
        ctx.lineTo(radius, 0);
        ctx.fillStyle = 'black';
        ctx.fill();
    }, [names]);

    const animate = useCallback(() => {
        if (!spinningRef.current) return;

        angleOffsetRef.current += velocityRef.current;
        velocityRef.current *= 0.985;
        drawWheel();

        if (velocityRef.current < 0.001) {
            spinningRef.current = false;
            const normalizedAngle = (2 * Math.PI - (angleOffsetRef.current % (2 * Math.PI))) % (2 * Math.PI);
            const step = (2 * Math.PI) / names.length;

            // Adjust the angle by 90 degrees (Math.PI / 2)
            const adjustedAngle = (normalizedAngle - Math.PI / 2) % (2 * Math.PI);
            const index = Math.floor(adjustedAngle / step) % names.length;

            onSpinEnd(names[index]);
            return;
        }

        animationRef.current = requestAnimationFrame(animate);
    }, [drawWheel, names, onSpinEnd]);

    const startSpin = useCallback(() => {
        if (names.length === 0) return;
        spinningRef.current = true;
        velocityRef.current = Math.random() * 0.3 + 0.25;
        animate();
    }, [animate, names.length]);

    useImperativeHandle(ref, () => ({
        startSpin
    }));

    useEffect(() => {
        const handleResize = () => {
            drawWheel();
        };

        // Initial draw
        drawWheel();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [drawWheel]);

    return <canvas ref={canvasRef} className="border rounded shadow w-full h-full" />;
});

Wheel.displayName = 'Wheel';
export default Wheel;