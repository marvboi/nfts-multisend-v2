import { X, Sun, Moon } from 'lucide-react';
import { Theme } from '../../hooks/useTheme';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: 'multisender' | 'revoke') => void;
  currentPage: 'multisender' | 'revoke';
  theme: Theme;
  toggleTheme: () => void;
}

export function MobileMenu({ isOpen, onClose, onNavigate, currentPage, theme, toggleTheme }: MobileMenuProps) {
  if (!isOpen) return null;

  const handleNavigate = (page: 'multisender' | 'revoke') => {
    onNavigate(page);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 md:hidden animate-fade-in">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className={`fixed inset-y-0 left-0 w-72 shadow-lg transform transition-all duration-300 ease-in-out animate-slide-in ${theme === 'cream' ? 'bg-cream-50 text-bronze-900' : 'bg-baseBlack-900 text-baseBlue-200'}`}>
        <div className="p-4">
          <button
            onClick={onClose}
            className={`absolute top-4 right-4 p-2 rounded-full transition-all duration-200 hover:scale-110 ${theme === 'cream' ? 'text-bronze-600 hover:bg-cream-200 hover:text-bronze-800' : 'text-baseBlue-400 hover:bg-baseBlack-800 hover:text-baseBlue-200'}`}
          >
            <X size={24} />
          </button>
          <div className="mt-12 space-y-6 px-2">
            <div className="relative">
              <button 
                onClick={() => handleNavigate('multisender')}
                className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-105 ${currentPage === 'multisender' 
                  ? theme === 'cream' ? 'bg-bronze-500 text-cream-50' : 'bg-baseBlue-600 text-white'
                  : theme === 'cream' ? 'text-bronze-700 hover:bg-cream-200' : 'text-baseBlue-300 hover:bg-baseBlack-700'}`}
              >
                NFT MultiSender
              </button>
              {/* BETA Badge */}
              <span className={`absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-bold rounded-full transition-all duration-200 ${theme === 'cream' 
                ? 'bg-orange-500/70 text-white backdrop-blur-sm' 
                : 'bg-orange-600/70 text-white backdrop-blur-sm'} shadow-sm border border-white/20`}>
                BETA
              </span>
            </div>
            <button 
              onClick={() => handleNavigate('revoke')}
              className={`w-full text-left px-4 py-3 rounded-2xl transition-all duration-200 hover:scale-105 ${currentPage === 'revoke' 
                ? theme === 'cream' ? 'bg-bronze-500 text-cream-50' : 'bg-baseBlue-600 text-white'
                : theme === 'cream' ? 'text-bronze-700 hover:bg-cream-200' : 'text-baseBlue-300 hover:bg-baseBlack-700'}`}
            >
              Revoke
            </button>
            
            <div className={`border-t my-6 pt-4 ${theme === 'cream' ? 'border-bronze-200' : 'border-baseBlack-700'}`}></div>
            
            <button
              onClick={toggleTheme}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-300 hover:scale-105 ${theme === 'cream' 
                ? 'bg-bronze-100 text-bronze-800 hover:bg-bronze-200 border border-bronze-300' 
                : 'bg-baseBlack-700 text-baseBlue-300 hover:bg-baseBlack-600 border border-baseBlack-500'}`}
            >
              {theme === 'base' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {theme === 'base' ? 'Switch to Cream Theme' : 'Switch to Base Theme'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}