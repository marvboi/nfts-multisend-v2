import React, { useRef } from 'react';
import { useSnowfallAnimation } from '../../hooks/useSnowfallAnimation';
import { SnowToggle } from './SnowToggle';
import { useSnowfall } from '../../hooks/useSnowfall';

export function Snowfall() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { isSnowing, toggleSnow } = useSnowfall();
  useSnowfallAnimation(canvasRef, isSnowing);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-0"
        style={{ opacity: isSnowing ? 0.8 : 0 }}
      />
      <SnowToggle isSnowing={isSnowing} onToggle={toggleSnow} />
    </>
  );
}