import { Menu, Sun, Moon } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { Theme } from '../../hooks/useTheme';

interface NavbarProps {
  onMenuToggle: () => void;
  onNavigate: (page: 'multisender' | 'revoke') => void;
  currentPage: 'multisender' | 'revoke';
  theme: Theme;
  toggleTheme: () => void;
}

export function Navbar({ onMenuToggle, onNavigate, currentPage, theme, toggleTheme }: NavbarProps) {

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${theme === 'cream' ? 'bg-cream-100 border-bronze-300' : 'bg-baseBlack-800 border-baseBlack-600'} border-b shadow-md animate-fade-in`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 animate-fade-in">
          <div className="flex items-center">
            <button
              onClick={onMenuToggle}
              className={`inline-flex items-center justify-center p-2 rounded-xl transition-all duration-200 md:hidden hover:scale-105 focus:outline-none ${theme === 'cream' ? 'text-bronze-700 hover:text-bronze-900 hover:bg-cream-200' : 'text-baseBlue-300 hover:text-baseBlue-100 hover:bg-baseBlack-700'}`}
            >
              <Menu size={24} />
            </button>
            <Logo theme={theme} />
            
            {/* Desktop Navigation */}
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <div className="relative">
                <button 
                  onClick={() => onNavigate('multisender')}
                  className={`px-4 py-2 rounded-2xl transition-all duration-200 text-sm font-medium hover:animate-scale ${currentPage === 'multisender' 
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
                onClick={() => onNavigate('revoke')}
                className={`px-4 py-2 rounded-2xl transition-all duration-200 text-sm font-medium hover:animate-scale ${currentPage === 'revoke' 
                  ? theme === 'cream' ? 'bg-bronze-500 text-cream-50' : 'bg-baseBlue-600 text-white'
                  : theme === 'cream' ? 'text-bronze-700 hover:bg-cream-200' : 'text-baseBlue-300 hover:bg-baseBlack-700'}`}
              >
                Revoke
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-300 hover:animate-scale ${theme === 'cream' 
                ? 'bg-bronze-100 text-bronze-800 hover:bg-bronze-200 border border-bronze-300' 
                : 'bg-baseBlack-700 text-baseBlue-300 hover:bg-baseBlack-600 border border-baseBlack-500'}`}
            >
              {theme === 'base' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {theme === 'base' ? 'Cream Theme' : 'Base Theme'}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}