'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { formatETH } from '../lib/ethersUtils';
import { TICKET_PRICE_ETH } from '../lib/constants';

const FALLBACK_RPC =
  process.env.NEXT_PUBLIC_PUBLIC_RPC_URL ||
  process.env.NEXT_PUBLIC_HARDHAT_RPC_URL ||
  'http://127.0.0.1:8545';

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
  const [lotteryPhase, setLotteryPhase] = useState('Phase 1: Collecte des billets');
  const [maxParticipants, setMaxParticipants] = useState(0);
  const [roundDuration, setRoundDuration] = useState(0);
  const [roundDeadline, setRoundDeadline] = useState(0);
  const [roundId, setRoundId] = useState(1);
  const [roundActive, setRoundActive] = useState(true);
  const [roundHistory, setRoundHistory] = useState([]);

  const loadContractData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { getContractWithProvider } = await import('../lib/contract');
      const effectiveProvider =
        provider ??
        new ethers.JsonRpcProvider(FALLBACK_RPC);

      const contract = getContractWithProvider(effectiveProvider);

      const [
        price,
        balance,
        playersList,
        winner,
        contractOwner,
        phase,
        maxPlayersValue,
        deadlineValue,
        durationValue,
        activeValue,
        roundIdValue,
        roundCountValue,
      ] = await Promise.all([
        contract.ticketPrice(),
        contract.getBalance(),
        contract.getPlayers(),
        contract.lastWinner(),
        contract.owner(),
        contract.currentLotteryPhase(),
        contract.maxParticipants(),
        contract.roundDeadline(),
        contract.roundDuration(),
        contract.roundActive(),
        contract.roundId(),
        contract.getRoundCount(),
      ]);

      const roundCount = Number(roundCountValue);
      let history = [];

      if (roundCount > 0) {
        const fetchCount = Math.min(roundCount, 10);
        const indices = Array.from({ length: fetchCount }, (_, idx) => roundCount - fetchCount + idx);
        const summaries = await Promise.all(indices.map((index) => contract.getRoundSummary(index)));

        history = summaries
          .map((summary) => ({
            id: Number(summary.roundId),
            winner: summary.winner,
            prize: formatETH(summary.prize),
            prizeRaw: summary.prize,
            ticketCount: Number(summary.ticketCount),
            completedAt: Number(summary.completedAt),
          }))
          .sort((a, b) => b.id - a.id);
      }

      setTicketPrice(price);
      setJackpot(balance);
      setPlayers(playersList);
      setPlayersCount(playersList.length);
      setLastWinner(winner !== ethers.ZeroAddress ? winner : null);
      setOwner(contractOwner);
      setIsOwner(account ? account.toLowerCase() === contractOwner.toLowerCase() : false);
      setLotteryPhase(phase);
      setMaxParticipants(Number(maxPlayersValue));
      setRoundDeadline(Number(deadlineValue));
      setRoundDuration(Number(durationValue));
      setRoundId(Number(roundIdValue));
      setRoundActive(Boolean(activeValue));
      setRoundHistory(history);
    } catch (loadError) {
      console.error('Error loading contract data:', loadError);
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, [provider, account]);

  useEffect(() => {
    loadContractData();
    const interval = setInterval(loadContractData, 12000);
    return () => clearInterval(interval);
  }, [loadContractData]);

  const buyTicket = useCallback(
    async (quantity = 1) => {
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
      } catch (purchaseError) {
        console.error('Error buying ticket:', purchaseError);
        throw purchaseError;
      }
    },
    [signer],
  );

  const forceDraw = useCallback(async () => {
    if (!signer) {
      throw new Error('Please connect your wallet');
    }

    try {
      const { getContractWithSigner } = await import('../lib/contract');
      const contract = getContractWithSigner(signer);
      const tx = await contract.forceDraw();
      return {
        success: true,
        tx,
        hash: tx.hash,
      };
    } catch (forceError) {
      console.error('Error forcing draw:', forceError);
      throw forceError;
    }
  }, [signer]);

  const updateConfiguration = useCallback(
    async (newTicketPrice, newMaxParticipants, newDuration) => {
      if (!signer) {
        throw new Error('Please connect your wallet');
      }
      if (!isOwner) {
        throw new Error('Only the contract owner can update the configuration');
      }

      try {
        const { getContractWithSigner } = await import('../lib/contract');
        const contract = getContractWithSigner(signer);
        const tx = await contract.updateConfiguration(newTicketPrice, newMaxParticipants, newDuration);
        return {
          success: true,
          tx,
          hash: tx.hash,
        };
      } catch (configError) {
        console.error('Error updating configuration:', configError);
        throw configError;
      }
    },
    [signer, isOwner],
  );

  const getUserTickets = useCallback(async () => {
    if (!account) return 0;

    try {
      const { getContractWithProvider } = await import('../lib/contract');
      const effectiveProvider =
        provider ??
        new ethers.JsonRpcProvider(FALLBACK_RPC);
      const contract = getContractWithProvider(effectiveProvider);
      const playersList = await contract.getPlayers();
      return playersList.filter((player) => player.toLowerCase() === account.toLowerCase()).length;
    } catch (ticketsError) {
      console.error('Error getting user tickets:', ticketsError);
      return 0;
    }
  }, [provider, account]);

  return {
    ticketPrice: ticketPrice ? formatETH(ticketPrice) : TICKET_PRICE_ETH,
    ticketPriceRaw: ticketPrice,
    jackpot: jackpot ? formatETH(jackpot) : '0',
    jackpotRaw: jackpot,
    players,
    playersCount,
    lastWinner,
    owner,
    isOwner,
    isLoading,
    error,
    lotteryPhase,
    maxParticipants,
    roundDuration,
    roundDeadline,
    roundId,
    roundActive,
    roundHistory,
    buyTicket,
    forceDraw,
    updateConfiguration,
    getUserTickets,
    refreshData: loadContractData,
  };
}

