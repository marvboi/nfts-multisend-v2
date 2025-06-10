import React from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Upload } from 'lucide-react';
import { validateAddressList } from '../utils/validation';

interface AddressInputProps {
  addresses: string[];
  setAddresses: (addresses: string[]) => void;
}

export function AddressInput({ addresses, setAddresses }: AddressInputProps) {
  const handleTextInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const input = e.target.value;
    const addressList = input
      .split(/[\n,]/) // Split by newline or comma
      .map(addr => addr.trim())
      .filter(addr => addr.length > 0);

    if (validateAddressList(addressList)) {
      setAddresses(addressList);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
    },
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      Papa.parse(file, {
        complete: (results) => {
          const addressList = results.data
            .flat()
            .map((addr: any) => addr?.toString().trim())
            .filter((addr: string) => addr?.length > 0);
          
          if (validateAddressList(addressList)) {
            setAddresses(addressList);
          }
        },
      });
    },
  });

  return (
    <div className="space-y-4">
      <textarea
        className="w-full h-32 p-3 bg-gray-900 border border-gray-700 rounded-lg 
                   focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white"
        placeholder="Enter wallet addresses (one per line or comma-separated)"
        value={addresses.join('\n')}
        onChange={handleTextInput}
      />

      <div
        {...getRootProps()}
        className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-500 bg-opacity-10' : 'border-gray-700 hover:border-blue-500 hover:bg-gray-800'}`}
      >
        <input {...getInputProps()} />
        <Upload className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-400">
          Drag & drop a CSV file here, or click to select one
        </p>
      </div>

      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-400">
          {addresses.length} addresses loaded
        </h3>
      </div>
    </div>
  );
}