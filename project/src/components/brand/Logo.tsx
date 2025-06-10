import React from 'react';
import { Theme } from '../../hooks/useTheme';

interface LogoProps {
  className?: string;
  theme?: Theme;
}

export function Logo({ className = '', theme = 'cream' }: LogoProps) {
  return (
    <div className={`flex items-center ml-4 transition-all duration-300 hover:animate-pulse-subtle ${theme === 'cream' ? 'text-bronze-600' : 'text-baseBlue-400'} ${className}`}>
      <span className={`font-bold text-xl ${theme === 'cream' ? 'text-bronze-800' : 'text-baseBlue-200'}`}>
        爪ㄒㄖㄖㄥ丂
      </span>
    </div>
  );
}