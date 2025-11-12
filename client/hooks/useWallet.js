'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';

const WalletContext = createContext(null);

const LOCAL_RPC_URL = process.env.NEXT_PUBLIC_HARDHAT_RPC_URL || 'http://127.0.0.1:8545';
const LOCAL_PRIVATE_KEY =
  process.env.NEXT_PUBLIC_HARDHAT_PRIVATE_KEY ||
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const updateBalance = useCallback(
    async (currentProvider = provider, currentAccount = account) => {
      if (!currentProvider || !currentAccount) return;

      try {
        const balanceValue = await currentProvider.getBalance(currentAccount);
        setBalance(balanceValue);
      } catch (balanceError) {
        console.error('Error fetching balance:', balanceError);
      }
    },
    [provider, account],
  );

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setBalance(null);
    setIsConnected(false);
    setError(null);
  }, []);

  const connectWallet = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window === 'undefined' || !window.ethereum) {
        setError('METAMASK_NOT_INSTALLED');
        throw new Error('METAMASK_NOT_INSTALLED');
      }

      const providerInstance = new ethers.BrowserProvider(window.ethereum);
      const accounts = await providerInstance.send('eth_requestAccounts', []);
      const signerInstance = await providerInstance.getSigner();
      const primaryAccount = accounts[0];

      setProvider(providerInstance);
      setSigner(signerInstance);
      setAccount(primaryAccount);
      setIsConnected(true);
      await updateBalance(providerInstance, primaryAccount);
    } catch (connectError) {
      console.error('Error connecting wallet:', connectError);
      setError(connectError.message || 'CONNECTION_ERROR');
    } finally {
      setIsConnecting(false);
    }
  }, [updateBalance]);

  const connectLocal = useCallback(async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const providerInstance = new ethers.JsonRpcProvider(LOCAL_RPC_URL);
      const signerInstance = new ethers.Wallet(LOCAL_PRIVATE_KEY, providerInstance);
      const walletAddress = await signerInstance.getAddress();

      setProvider(providerInstance);
      setSigner(signerInstance);
      setAccount(walletAddress);
      setIsConnected(true);
      await updateBalance(providerInstance, walletAddress);
      setError(null);
    } catch (localError) {
      console.error('Error connecting local wallet:', localError);
      setError(localError.message || 'LOCAL_CONNECTION_ERROR');
    } finally {
      setIsConnecting(false);
    }
  }, [updateBalance]);

  const handleAccountsChanged = useCallback(
    (accounts) => {
      if (!accounts || accounts.length === 0) {
        disconnectWallet();
        return;
      }
      const nextAccount = accounts[0];
      setAccount(nextAccount);
      setIsConnected(true);
      updateBalance(provider, nextAccount);
    },
    [disconnectWallet, updateBalance, provider],
  );

  const checkConnection = useCallback(async () => {
    if (typeof window === 'undefined' || !window.ethereum) return;
    try {
      const accounts = await window.ethereum.request({ method: 'eth_accounts' });
      if (accounts.length > 0) {
        await connectWallet();
      }
    } catch (checkError) {
      console.error('Error checking connection:', checkError);
    }
  }, [connectWallet]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.ethereum) return;

    const { ethereum } = window;
    const handleChainChanged = () => window.location.reload();

    checkConnection();
    ethereum.on('accountsChanged', handleAccountsChanged);
    ethereum.on('chainChanged', handleChainChanged);

    return () => {
      ethereum.removeListener('accountsChanged', handleAccountsChanged);
      ethereum.removeListener('chainChanged', handleChainChanged);
    };
  }, [checkConnection, handleAccountsChanged]);

  useEffect(() => {
    if (!provider || !account) return;

    updateBalance();
    const interval = setInterval(() => updateBalance(), 10000);
    return () => clearInterval(interval);
  }, [provider, account, updateBalance]);

  const contextValue = useMemo(
    () => ({
      account,
      provider,
      signer,
      balance,
      isConnected,
      isConnecting,
      error,
      connectWallet,
      connectLocal,
      disconnectWallet,
      updateBalance,
    }),
    [
      account,
      provider,
      signer,
      balance,
      isConnected,
      isConnecting,
      error,
      connectWallet,
      connectLocal,
      disconnectWallet,
      updateBalance,
    ],
  );

  return <WalletContext.Provider value={contextValue}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
