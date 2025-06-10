import { isAddress } from 'viem';

export const validateAddress = (address: string): boolean => {
  return isAddress(address);
};

export const validateAddressList = (addresses: string[]): boolean => {
  return addresses.every(validateAddress);
};

export const validateNFTData = (contractAddress: string): boolean => {
  return isAddress(contractAddress);
};