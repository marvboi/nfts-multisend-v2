import { useEffect, useRef } from 'react';
import { createSnowflakes, updateSnowflakes, drawSnowflakes } from '../utils/snowfall';
import type { Snowflake } from '../types/snowfall';

export function useSnowfallAnimation(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  isActive: boolean
) {
  const snowflakesRef = useRef<Snowflake[]>([]);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      snowflakesRef.current = createSnowflakes(75); // Increased number of snowflakes
    };

    const animate = () => {
      if (!isActive) {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateSnowflakes(snowflakesRef.current, canvas.width, canvas.height);
      drawSnowflakes(ctx, snowflakesRef.current);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    if (isActive) {
      animate();
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isActive]);
}