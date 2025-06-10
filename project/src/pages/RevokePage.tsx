import React from 'react';
import { Theme } from '../hooks/useTheme';

interface RevokePageProps {
  theme?: Theme;
}

export const RevokePage: React.FC<RevokePageProps> = ({ theme = 'cream' }) => {
  return (
    <main className="max-w-2xl mx-auto px-4 pt-20 pb-8 sm:px-6 lg:px-8 animate-fade-in">
      <div className="space-y-8">
        <header className="text-center space-y-4">
          <h1 className={`text-4xl font-bold transition-all duration-300 animate-float ${theme === 'cream' ? 'text-bronze-800' : 'text-baseBlue-400'}`}>
            Wanna Revoke?
          </h1>
        </header>
        
        <div className={`rounded-2xl p-6 shadow-lg transition-all duration-300 animate-scale ${theme === 'cream' ? 'bg-cream-100 border border-bronze-200' : 'bg-baseBlack-800 border border-baseBlack-600'}`}>
          <div className="flex flex-col items-center space-y-6">
            <img 
              src="https://i.ibb.co/60264cym/Chat-GPT-Image-Jun-9-2025-01-02-28-AM.png" 
              alt="Revoke Cash Logo" 
              className="w-32 h-32 object-contain"
            />
            
            <div className={`text-center ${theme === 'cream' ? 'text-bronze-700' : 'text-baseBlue-200'}`}>
              <p className="text-lg font-medium mb-4">
                Go to Revoke.cash to revoke approvals for any NFT you've approved
              </p>
              
              <a 
                href="https://revoke.cash" 
                target="_blank" 
                rel="noopener noreferrer"
                className={`inline-block px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                  theme === 'cream' 
                    ? 'bg-bronze-600 text-cream-50 hover:bg-bronze-700' 
                    : 'bg-baseBlue-500 text-baseBlack-900 hover:bg-baseBlue-400'
                }`}
              >
                Visit Revoke.cash
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
