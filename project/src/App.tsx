import { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { MobileMenu } from './components/layout/MobileMenu';
import { MultiSenderPage } from './pages/MultiSenderPage';
import { RevokePage } from './pages/RevokePage';

type Theme = 'cream' | 'base';

export default function App() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<'multisender' | 'revoke'>('multisender');
  const [theme, setTheme] = useState<Theme>('cream');
  const [isAnimating, setIsAnimating] = useState(false);

  // Initialize theme from localStorage if available
  useEffect(() => {
    const savedTheme = localStorage.getItem('nftMultiSenderTheme') as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'base');
    }
  }, []);

  // Update localStorage and document class when theme changes
  useEffect(() => {
    localStorage.setItem('nftMultiSenderTheme', theme);
    document.documentElement.classList.toggle('dark', theme === 'base');
  }, [theme]);

  const toggleTheme = () => {
    setIsAnimating(true);
    setTheme((prevTheme) => (prevTheme === 'cream' ? 'base' : 'cream'));
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const handleNavigate = (page: 'multisender' | 'revoke') => {
    setCurrentPage(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${theme === 'cream' ? 'bg-cream-50' : 'dark bg-baseBlack-900'} ${isAnimating ? 'animate-fade-in' : ''}`}>
      <Navbar 
        onMenuToggle={() => setIsMobileMenuOpen(true)} 
        onNavigate={handleNavigate}
        currentPage={currentPage}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {currentPage === 'multisender' && (
        <div className="pt-16 animate-fade-in">
          <MultiSenderPage theme={theme} toggleTheme={toggleTheme} />
        </div>
      )}
      
      {currentPage === 'revoke' && (
        <div className="animate-fade-in">
          <RevokePage theme={theme} />
        </div>
      )}
    </div>
  );
}