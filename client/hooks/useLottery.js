'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { formatETH } from '../lib/ethersUtils';
import { TICKET_PRICE_ETH, CONTRACT_ADDRESS } from '../lib/constants';

export function useLottery(provider, signer, account) {
  const [ticketPrice, setTicketPrice] = useState(null);
  const [jackpot, setJackpot] = useState(null);
  const [players, setPlayers] = useState([]);
  const [playersCount, setPlayersCount] = useState(0);
  const [lastWinner, setLastWinner] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lotteryPhase, setLotteryPhase] = useState('Phase 1: Open for ticket sales');
  const [lotteryInProgress, setLotteryInProgress] = useState(false);
  const [commitmentActive, setCommitmentActive] = useState(false);
  const [commitmentTimestamp, setCommitmentTimestamp] = useState(null);
  const [revealDeadline, setRevealDeadline] = useState(null);

  const resetState = useCallback(() => {
    setTicketPrice(null);
    setJackpot(null);
    setPlayers([]);
    setPlayersCount(0);
    setLastWinner(null);
    setOwner(null);
    setIsOwner(false);
    setLotteryPhase('Phase 1: Open for ticket sales');
    setLotteryInProgress(false);
    setCommitmentActive(false);
    setCommitmentTimestamp(null);
    setRevealDeadline(null);
  }, []);

  // Load contract data
  const loadContractData = useCallback(async () => {
    const normalizedAddress = (CONTRACT_ADDRESS ?? '').trim();

    if (!provider) {
      resetState();
      setIsLoading(false);
      return;
    }

    if (!normalizedAddress) {
      resetState();
      setIsLoading(false);
      setError('Aucune adresse de contrat n\'est configurée.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { getContractWithProvider } = await import('../lib/contract');
      const contract = getContractWithProvider(provider);

      // Vérifie qu'un contrat est bien déployé à cette adresse
      try {
        const onchainCode = await provider.getCode(normalizedAddress);
        if (!onchainCode || onchainCode === '0x') {
          const notFoundError = new Error('Contrat introuvable à cette adresse.');
          notFoundError.code = 'CONTRACT_NOT_FOUND';
          throw notFoundError;
        }
      } catch (codeError) {
        if (codeError.code === 'CONTRACT_NOT_FOUND') {
          throw codeError;
        }
        const wrapped = new Error('Impossible de vérifier le contrat.');
        wrapped.code = 'CONTRACT_CODE_LOOKUP_FAILED';
        wrapped.originalError = codeError;
        throw wrapped;
      }

      const results = await Promise.allSettled([
        contract.ticketPrice?.(),
        contract.getBalance?.(),
        contract.getPlayers?.(),
        contract.getLastWinner?.(),
        contract.owner?.(),
        contract.currentLotteryPhase?.(),
        contract.lotteryInProgress?.(),
        contract.commitmentActive?.(),
        contract.commitmentTimestamp?.(),
        contract.REVEAL_DEADLINE?.(),
      ]);

      const firstFailure = results.find((entry) => entry.status === 'rejected');
      if (firstFailure) {
        const reason = firstFailure.reason ?? {};
        if (reason.code === 'BAD_DATA') {
          const mismatch = new Error('Le contrat déployé ne correspond pas à la version attendue.');
          mismatch.code = 'CONTRACT_INTERFACE_MISMATCH';
          mismatch.originalError = reason;
          throw mismatch;
        }
        throw reason;
      }

      const [
        price,
        balance,
        playersList,
        winner,
        contractOwner,
        phase,
        inProgress,
        commitActive,
        commitTime,
        deadline,
      ] = results.map((entry) => (entry.status === 'fulfilled' ? entry.value : null));

      setTicketPrice(price ?? null);
      setJackpot(balance ?? null);
      setPlayers(playersList ?? []);
      setPlayersCount(playersList ? playersList.length : 0);
      setLastWinner(winner && winner !== ethers.ZeroAddress ? winner : null);
      setOwner(contractOwner ?? null);
      setIsOwner(contractOwner ? account?.toLowerCase() === contractOwner.toLowerCase() : false);
      setLotteryPhase(phase ?? 'Phase 1: Open for ticket sales');
      setLotteryInProgress(!!inProgress);
      setCommitmentActive(!!commitActive);
      setCommitmentTimestamp(commitTime ?? null);
      setRevealDeadline(deadline ?? null);
    } catch (loadError) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Error loading contract data:', loadError);
      }

      resetState();

      switch (loadError.code) {
        case 'CONTRACT_NOT_FOUND':
          setError('Le contrat BlockLucky est introuvable à cette adresse. Vérifiez le déploiement.');
          break;
        case 'CONTRACT_INTERFACE_MISMATCH':
          setError('Le contrat déployé ne correspond pas à l’ABI utilisée côté front.');
          break;
        case 'CONTRACT_CODE_LOOKUP_FAILED':
          setError('Impossible de vérifier le contrat sur le RPC configuré.');
          break;
        default:
          setError(loadError.message || 'Impossible de charger les données du contrat.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [provider, account, resetState]);

  // Refresh data periodically
  useEffect(() => {
    loadContractData();
    if (provider) {
      const interval = setInterval(loadContractData, 10000); // Refresh every 10s
      return () => clearInterval(interval);
    }
  }, [provider, loadContractData]);

  // Buy ticket
  const buyTicket = useCallback(async (quantity = 1) => {
    if (!signer) {
      throw new Error('Please connect your wallet');
    }

    try {
      const { getContractWithSigner } = await import('../lib/contract');
      const contract = getContractWithSigner(signer);
      const price = await contract.ticketPrice();
      const totalPrice = price * BigInt(quantity);

      const tx = await contract.buyTicket({ value: totalPrice });
      return {
        success: true,
        tx,
        hash: tx.hash,
      };
    } catch (error) {
      console.error('Error buying ticket:', error);
      throw error;
    }
  }, [signer]);

  // Pick winner (owner only)
  const pickWinner = useCallback(async () => {
    if (!signer) {
      throw new Error('Please connect your wallet');
    }

    if (!isOwner) {
      throw new Error('Only the contract owner can pick a winner');
    }

    try {
      const { getContractWithSigner } = await import('../lib/contract');
      const contract = getContractWithSigner(signer);
      const tx = await contract.pickWinner();
      return {
        success: true,
        tx,
        hash: tx.hash,
      };
    } catch (error) {
      console.error('Error picking winner:', error);
      throw error;
    }
  }, [signer, isOwner]);

  // Get user's tickets
  const getUserTickets = useCallback(async () => {
    if (!provider || !account) return [];

    try {
      const { getContractWithProvider } = await import('../lib/contract');
      const contract = getContractWithProvider(provider);
      const playersList = await contract.getPlayers();

      const userTickets = playersList.filter(
        (player) => player.toLowerCase() === account.toLowerCase()
      ).length;

      return userTickets;
    } catch (error) {
      console.error('Error getting user tickets:', error);
      return 0;
    }
  }, [provider, account]);

  const commitRandomness = useCallback(async (seed) => {
    if (!signer) {
      throw new Error('Please connect your wallet');
    }

    if (!isOwner) {
      throw new Error('Only the contract owner can commit randomness');
    }

    try {
      const { getContractWithSigner } = await import('../lib/contract');
      const contract = getContractWithSigner(signer);

      const commitment = ethers.keccak256(ethers.toUtf8Bytes(seed));
      const tx = await contract.commitRandomness(commitment);

      return {
        success: true,
        tx,
        hash: tx.hash,
        commitment,
      };
    } catch (error) {
      console.error('Error committing randomness:', error);
      throw error;
    }
  }, [signer, isOwner]);

  const revealAndPickWinner = useCallback(async (seed) => {
    if (!signer) {
      throw new Error('Please connect your wallet');
    }

    if (!isOwner) {
      throw new Error('Only the contract owner can reveal and pick winner');
    }

    try {
      const { getContractWithSigner } = await import('../lib/contract');
      const contract = getContractWithSigner(signer);

      const tx = await contract.revealAndPickWinner(seed);

      return {
        success: true,
        tx,
        hash: tx.hash,
      };
    } catch (error) {
      console.error('Error revealing and picking winner:', error);
      throw error;
    }
  }, [signer, isOwner]);

  const resetToPhase1 = useCallback(async () => {
    if (!signer) {
      throw new Error('Please connect your wallet');
    }

    if (!isOwner) {
      throw new Error('Only the contract owner can reset');
    }

    try {
      const { getContractWithSigner } = await import('../lib/contract');
      const contract = getContractWithSigner(signer);

      const tx = await contract.resetToPhase1();

      return {
        success: true,
        tx,
        hash: tx.hash,
      };
    } catch (error) {
      console.error('Error resetting to phase 1:', error);
      throw error;
    }
  }, [signer, isOwner]);

  return {
    ticketPrice: ticketPrice ? formatETH(ticketPrice) : TICKET_PRICE_ETH,
    jackpot: jackpot ? formatETH(jackpot) : '0',
    players,
    playersCount,
    lastWinner,
    owner,
    isOwner,
    isLoading,
    error,
    lotteryPhase,
    lotteryInProgress,
    commitmentActive,
    commitmentTimestamp,
    revealDeadline,
    buyTicket,
    pickWinner,
    commitRandomness,
    revealAndPickWinner,
    resetToPhase1,
    getUserTickets,
    refreshData: loadContractData,
  };
}

