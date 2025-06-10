import type { Snowflake } from '../types/snowfall';

export function createSnowflakes(count: number): Snowflake[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 2 + 3, // Increased minimum size to 3px
    speed: Math.random() * 1.5 + 1, // Slightly increased speed
    angle: Math.random() * Math.PI * 2,
    swing: Math.random() * 0.3 + 0.2, // Increased swing for more natural movement
    swingCount: Math.random() * Math.PI * 2,
  }));
}

export function updateSnowflakes(snowflakes: Snowflake[], width: number, height: number) {
  snowflakes.forEach(flake => {
    flake.swingCount += flake.swing;
    flake.x += Math.sin(flake.swingCount) * 0.8; // Increased horizontal movement
    flake.y += flake.speed;

    if (flake.y > height) {
      flake.y = -5;
      flake.x = Math.random() * width;
    }
  });
}

export function drawSnowflakes(ctx: CanvasRenderingContext2D, snowflakes: Snowflake[]) {
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; // Increased opacity
  
  snowflakes.forEach(flake => {
    ctx.beginPath();
    ctx.arc(flake.x, flake.y, flake.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}