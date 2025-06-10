import { useState } from 'react';
import NFTMultiSender, { NFTMultiSenderProps } from '../components/NFTMultiSender';
import ProModeNFTSelector from '../components/ProModeNFTSelector';
import { WalletConnect } from '../components/WalletConnect';
import { Theme } from '../hooks/useTheme';

interface MultiSenderPageProps {
  theme: Theme;
  toggleTheme: () => void;
}

export function MultiSenderPage({ theme }: MultiSenderPageProps) {
  const [isProMode, setIsProMode] = useState(false);
  const [selectedNFTs, setSelectedNFTs] = useState<{ contractAddress: string; tokenIds: string[] }[]>([]);

  const handleNFTsSelected = (nfts: { contractAddress: string; tokenIds: string[] }[]) => {
    setSelectedNFTs(nfts);
  };

  const toggleProMode = () => {
    setIsProMode(prev => !prev);
    // Reset selected NFTs when toggling off pro mode
    if (isProMode) {
      setSelectedNFTs([]);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className={`text-2xl font-semibold transition-all duration-300 ${theme === 'cream' ? 'text-bronze-800' : 'text-baseBlue-400'}`}>
            NFT Multi-Sender
          </h1>
          
          <div className="flex items-center">
            <span className={`mr-2 text-sm ${theme === 'cream' ? 'text-bronze-700' : 'text-baseBlue-400'}`}>
              Pro Mode
            </span>
            <button
              onClick={toggleProMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 ${isProMode 
                ? theme === 'cream' ? 'bg-bronze-500' : 'bg-baseBlue-500'
                : theme === 'cream' ? 'bg-cream-300' : 'bg-baseBlack-600'}`}
              role="switch"
              aria-checked={isProMode}
            >
              <span 
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${isProMode ? 'translate-x-6' : 'translate-x-1'}`} 
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
        
        <div className="mb-6 flex justify-center animate-fade-in">
          <WalletConnect />
        </div>
        
        <div className={`shadow overflow-hidden sm:rounded-2xl transition-all duration-300 animate-scale ${theme === 'cream' ? 'bg-cream-100 border border-bronze-200' : 'bg-baseBlack-800 border border-baseBlack-600'}`}>
          {isProMode ? (
            <div className="px-4 py-5 sm:p-6">
              <ProModeNFTSelector 
                theme={theme} 
                onNFTsSelected={handleNFTsSelected} 
              />
              {selectedNFTs.length > 0 && (
                <div className="mt-6">
                  <NFTMultiSender 
                    theme={theme} 
                    preSelectedNFTs={selectedNFTs} 
                  />
                </div>
              )}
            </div>
          ) : (
            <div className="px-4 py-5 sm:p-6">
              <NFTMultiSender theme={theme} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MultiSenderPage;
