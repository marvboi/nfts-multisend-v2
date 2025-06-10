import React, { KeyboardEvent } from 'react';
import { parseAddressInput } from '../../utils/address';
import { validateAddress } from '../../utils/validation';

interface AddressTextAreaProps {
  addresses: string[];
  setAddresses: (addresses: string[]) => void;
}

export function AddressTextArea({ addresses, setAddresses }: AddressTextAreaProps) {
  const [inputValue, setInputValue] = React.useState(addresses.join('\n'));

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        // Allow natural line break with Shift+Enter
        return;
      }
      e.preventDefault();
      const input = e.currentTarget.value;
      const cursorPosition = e.currentTarget.selectionStart;
      const newValue = input.slice(0, cursorPosition) + '\n' + input.slice(cursorPosition);
      setInputValue(newValue);
      
      // Update valid addresses
      const addressList = parseAddressInput(newValue);
      setAddresses(addressList);
      
      // Set cursor position after the new line
      setTimeout(() => {
        e.currentTarget.setSelectionRange(cursorPosition + 1, cursorPosition + 1);
      }, 0);
    }
  };

  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    setInputValue(input);
    const addressList = parseAddressInput(input);
    setAddresses(addressList);
  };

  return (
    <div className="space-y-2">
      <textarea
        className="w-full h-[400px] p-4 bg-gray-900 border border-gray-700 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white
                   font-mono text-sm leading-relaxed resize-y"
        placeholder="Enter wallet addresses (one per line)
Example:
0x742d35Cc6634C0532925a3b844Bc454e4438f44e
0x123..."
        value={inputValue}
        onChange={handleTextInput}
        onKeyDown={handleKeyDown}
        spellCheck={false}
      />
      <div className="flex flex-col gap-1 text-xs text-gray-400">
        <p>Press Shift + Enter or Enter for new line</p>
        <p>Supports up to 500 addresses</p>
        <p className="text-blue-400">{addresses.length} valid addresses loaded</p>
      </div>
    </div>
  );
}