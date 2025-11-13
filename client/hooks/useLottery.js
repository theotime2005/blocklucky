'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { formatETH } from '../lib/ethersUtils';
import { TICKET_PRICE_ETH, CONTRACT_ADDRESS } from '../lib/constants';

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

  const resetState = useCallback(() => {
    setTicketPrice(null);
    setJackpot(null);
    setPlayers([]);
    setPlayersCount(0);
    setLastWinner(null);
    setOwner(null);
    setIsOwner(false);
    setLotteryPhase('Phase 1: Collecte des billets');
    setMaxParticipants(0);
    setRoundDuration(0);
    setRoundDeadline(0);
    setRoundId(1);
    setRoundActive(false);
    setRoundHistory([]);
    setError(null);
  }, []);

  const loadContractData = useCallback(async () => {
    const normalizedAddress = (CONTRACT_ADDRESS ?? '').trim();
    const effectiveProvider =
      provider ??
      new ethers.JsonRpcProvider(FALLBACK_RPC);

    if (!normalizedAddress) {
      resetState();
      setIsLoading(false);
      setError("Aucune adresse de contrat n'est configurée.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let onchainCode;
      try {
        onchainCode = await effectiveProvider.getCode(normalizedAddress);
      } catch (codeError) {
        if (codeError.code === 'CONTRACT_NOT_FOUND') {
          throw codeError;
        }
        const wrapped = new Error('Impossible de vérifier le contrat sur le RPC configuré.');
        wrapped.code = 'CONTRACT_CODE_LOOKUP_FAILED';
        wrapped.originalError = codeError;
        throw wrapped;
      }

      if (!onchainCode || onchainCode === '0x') {
        const notFound = new Error('Le contrat BlockLucky est introuvable à cette adresse. Vérifiez le déploiement.');
        notFound.code = 'CONTRACT_NOT_FOUND';
        throw notFound;
      }

      const { getContractWithProvider } = await import('../lib/contract');
      const contract = getContractWithProvider(effectiveProvider);

      const resultEntries = await Promise.allSettled([
        contract.ticketPrice?.(),
        contract.getBalance?.(),
        contract.getPlayers?.(),
        contract.lastWinner?.(),
        contract.owner?.(),
        contract.currentLotteryPhase?.(),
        contract.maxParticipants?.(),
        contract.roundDeadline?.(),
        contract.roundDuration?.(),
        contract.roundActive?.(),
        contract.roundId?.(),
        contract.getRoundCount?.(),
      ]);

      const firstFailure = resultEntries.find((entry) => entry.status === 'rejected');
      if (firstFailure) {
        const reason = firstFailure.reason ?? {};
        if (reason.code === 'BAD_DATA') {
          const mismatch = new Error("Le contrat déployé ne correspond pas à l’ABI utilisée côté front.");
          mismatch.code = 'CONTRACT_INTERFACE_MISMATCH';
          mismatch.originalError = reason;
          throw mismatch;
        }
        throw reason;
      }

      const getValue = (index) =>
        resultEntries[index]?.status === 'fulfilled' ? resultEntries[index].value : null;

      const price = getValue(0);
      const balance = getValue(1);
      const playersList = getValue(2) ?? [];
      const winner = getValue(3);
      const contractOwner = getValue(4);
      const phase = getValue(5);
      const maxPlayersValue = getValue(6);
      const deadlineValue = getValue(7);
      const durationValue = getValue(8);
      const activeValue = getValue(9);
      const roundIdValue = getValue(10);
      const roundCountValue = getValue(11);

      let history = [];
      const roundCount = Number(roundCountValue ?? 0);

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

      setTicketPrice(price ?? null);
      setJackpot(balance ?? null);
      setPlayers(playersList);
      setPlayersCount(playersList.length);
      setLastWinner(winner && winner !== ethers.ZeroAddress ? winner : null);
      setOwner(contractOwner ?? null);
      setIsOwner(contractOwner ? account?.toLowerCase() === contractOwner.toLowerCase() : false);
      setLotteryPhase(phase ?? 'Phase 1: Collecte des billets');
      setMaxParticipants(Number(maxPlayersValue ?? 0));
      setRoundDeadline(Number(deadlineValue ?? 0));
      setRoundDuration(Number(durationValue ?? 0));
      setRoundId(Number(roundIdValue ?? 1));
      setRoundActive(Boolean(activeValue));
      setRoundHistory(history);
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
          setError("Le contrat déployé ne correspond pas à l’ABI utilisée côté front.");
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

