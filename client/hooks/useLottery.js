'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { formatETH } from '../lib/ethersUtils';
import { TICKET_PRICE_ETH } from '../lib/constants';

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

  // Load contract data
  const loadContractData = useCallback(async () => {
    if (!provider) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { getContractWithProvider } = await import('../lib/contract');
      const contract = getContractWithProvider(provider);

      const [price, balance, playersList, winner, contractOwner, phase, inProgress, commitActive, commitTime, deadline] = await Promise.all([
        contract.ticketPrice(),
        contract.getBalance(),
        contract.getPlayers(),
        contract.getLastWinner(),
        contract.owner(),
        contract.currentLotteryPhase(),
        contract.lotteryInProgress(),
        contract.commitmentActive(),
        contract.commitmentTimestamp(),
        contract.REVEAL_DEADLINE(),
      ]);

      setTicketPrice(price);
      setJackpot(balance);
      setPlayers(playersList);
      setPlayersCount(playersList.length);
      setLastWinner(winner !== ethers.ZeroAddress ? winner : null);
      setOwner(contractOwner);
      setIsOwner(account?.toLowerCase() === contractOwner.toLowerCase());
      setLotteryPhase(phase);
      setLotteryInProgress(inProgress);
      setCommitmentActive(commitActive);
      setCommitmentTimestamp(commitTime);
      setRevealDeadline(deadline);
    } catch (error) {
      console.error('Error loading contract data:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [provider, account]);

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

