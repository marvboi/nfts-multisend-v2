import { useState, useEffect } from 'react';

export type Theme = 'cream' | 'base';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('nftMultiSenderTheme');
    return (savedTheme as Theme) || 'cream';
  });

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    localStorage.setItem('nftMultiSenderTheme', theme);
    document.documentElement.classList.toggle('dark', theme === 'base');
  }, [theme]);

  const toggleTheme = () => {
    setIsAnimating(true);
    setTheme(prev => prev === 'cream' ? 'base' : 'cream');
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  return { theme, toggleTheme, isAnimating };
}