import { validateAddress } from './validation';
import Papa from 'papaparse';

export function parseAddressInput(input: string): string[] {
  // First split by common separators (newlines, commas, spaces)
  const addresses = input
    .split(/[\n,\s]+/)
    .map(addr => addr.trim())
    .filter(addr => addr.length > 0);

  // Deduplicate addresses
  const uniqueAddresses = [...new Set(addresses)];

  // Validate and limit to 500 addresses
  return uniqueAddresses
    .filter(addr => validateAddress(addr))
    .slice(0, 500);
}

export function parseCSVAddresses(file: File, callback: (addresses: string[]) => void): void {
  Papa.parse(file, {
    complete: (results) => {
      const addresses = results.data
        .flat()
        .map((addr: any) => addr?.toString().trim())
        .filter((addr: string) => addr?.length > 0);
      
      callback(parseAddressInput(addresses.join('\n')));
    },
    error: (error) => {
      console.error('Error parsing CSV:', error);
      callback([]);
    }
  });
}