import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { parseCSVAddresses } from '../../utils/address';

interface AddressFileUploadProps {
  setAddresses: (addresses: string[]) => void;
}

export function AddressFileUpload({ setAddresses }: AddressFileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'text/csv': ['.csv'] },
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        parseCSVAddresses(acceptedFiles[0], setAddresses);
      }
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
        ${isDragActive 
          ? 'border-blue-500 bg-blue-500 bg-opacity-10' 
          : 'border-gray-700 hover:border-blue-500 hover:bg-gray-800'
        }`}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto h-8 w-8 text-gray-400" />
      <p className="mt-2 text-sm text-gray-400">
        Drag & drop a CSV file here, or click to select one
      </p>
      <p className="mt-1 text-xs text-gray-500">
        Supports CSV files with wallet addresses
      </p>
    </div>
  );
}