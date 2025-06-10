import React from 'react';

interface AddressCounterProps {
  count: number;
}

export function AddressCounter({ count }: AddressCounterProps) {
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-400">
        {count} addresses loaded
      </h3>
    </div>
  );
}