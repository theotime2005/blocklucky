import { ethers } from "ethers";

/**
 * Format an address to show first 6 and last 4 characters
 */
export function formatAddress(address) {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format ETH value to readable string
 */
export function formatETH(value, decimals = 4) {
  if (!value) return "0";
  try {
    const formatted = ethers.formatEther(value);
    return parseFloat(formatted).toFixed(decimals);
  } catch (error) {
    return "0";
  }
}

/**
 * Parse ETH string to BigNumber
 */
export function parseETH(value) {
  try {
    return ethers.parseEther(value.toString());
  } catch (error) {
    return ethers.parseEther("0");
  }
}

/**
 * Get Etherscan transaction URL
 */
export function getEtherscanTxUrl(txHash) {
  const baseUrl = process.env.NEXT_PUBLIC_ETHERSCAN_URL || "https://etherscan.io";
  return `${baseUrl}/tx/${txHash}`;
}

/**
 * Get Etherscan address URL
 */
export function getEtherscanAddressUrl(address) {
  const baseUrl = process.env.NEXT_PUBLIC_ETHERSCAN_URL || "https://etherscan.io";
  return `${baseUrl}/address/${address}`;
}

/**
 * Generate avatar URL from address (using DiceBear)
 */
export function getAvatarUrl(address) {
  if (!address) return "";
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`;
}

