import React from 'react';
import { AddressTextArea } from './AddressTextArea';
import { AddressFileUpload } from './AddressFileUpload';
import { AddressCounter } from './AddressCounter';

interface AddressInputProps {
  addresses: string[];
  setAddresses: (addresses: string[]) => void;
}

export function AddressInput({ addresses, setAddresses }: AddressInputProps) {
  return (
    <div className="space-y-4">
      <AddressTextArea 
        addresses={addresses} 
        setAddresses={setAddresses} 
      />
      <AddressFileUpload setAddresses={setAddresses} />
      <AddressCounter count={addresses.length} />
    </div>
  );
}