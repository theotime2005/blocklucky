import { ethers } from "ethers";
import { BLOCKLUCKY_ABI, CONTRACT_ADDRESS } from "./constants";

/**
 * Get contract instance
 */
export function getContract(signerOrProvider) {
  if (!CONTRACT_ADDRESS) {
    throw new Error("Contract address not set. Please set NEXT_PUBLIC_CONTRACT_ADDRESS in .env");
  }
  return new ethers.Contract(CONTRACT_ADDRESS, BLOCKLUCKY_ABI, signerOrProvider);
}

/**
 * Get contract instance with provider (read-only)
 */
export function getContractWithProvider(provider) {
  return getContract(provider);
}

/**
 * Get contract instance with signer (write operations)
 */
export function getContractWithSigner(signer) {
  return getContract(signer);
}

