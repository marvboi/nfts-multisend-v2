import React from 'react';
import { Snowflake, CloudOff } from 'lucide-react';

interface SnowToggleProps {
  isSnowing: boolean;
  onToggle: () => void;
}

export function SnowToggle({ isSnowing, onToggle }: SnowToggleProps) {
  return (
    <button
      onClick={onToggle}
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg
        font-medium transition-all duration-200 transform hover:scale-105
        ${isSnowing 
          ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg' 
          : 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200'
        }`}
    >
      {isSnowing ? (
        <>
          <CloudOff size={20} />
          <span>Stop Snow</span>
        </>
      ) : (
        <>
          <Snowflake size={20} className="animate-spin-slow" />
          <span>Let it Snow</span>
        </>
      )}
    </button>
  );
}