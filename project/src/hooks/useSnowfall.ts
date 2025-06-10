import { useState, useEffect } from 'react';

export function useSnowfall() {
  const [isSnowing, setIsSnowing] = useState(() => {
    const saved = localStorage.getItem('snowfall-enabled');
    return saved !== null ? JSON.parse(saved) : true;
  });
  
  useEffect(() => {
    localStorage.setItem('snowfall-enabled', JSON.stringify(isSnowing));
  }, [isSnowing]);

  const toggleSnow = () => setIsSnowing(prev => !prev);
  
  return {
    isSnowing,
    toggleSnow
  };
}