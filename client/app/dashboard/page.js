'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '../../hooks/useWallet';
import { useLottery } from '../../hooks/useLottery';
import TicketPurchase from '../../components/TicketPurchase';
import StatsCard from '../../components/StatsCard';
import { motion } from 'framer-motion';
import { formatAddress, getAvatarUrl } from '../../lib/ethersUtils';
import { toast } from 'sonner';
import { getEtherscanTxUrl } from '../../lib/ethersUtils';

export default function Dashboard() {
  const { provider, signer, account, isConnected, connectWallet } = useWallet();
  const {
    ticketPrice,
    jackpot,
    players,
    playersCount,
    lastWinner,
    owner,
    isOwner,
    getUserTickets,
    pickWinner,
    refreshData,
  } = useLottery(provider, signer, account);

  const [userTickets, setUserTickets] = useState(0);
  const [isPickingWinner, setIsPickingWinner] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      loadUserTickets();
    }
  }, [isConnected, account, players]);

  const loadUserTickets = async () => {
    const tickets = await getUserTickets();
    setUserTickets(tickets);
  };

  const handlePickWinner = async () => {
    if (!isOwner) {
      toast.error('Only the contract owner can pick a winner');
      return;
    }

    setIsPickingWinner(true);
    try {
      const result = await pickWinner();
      
      toast.success('Transaction submitted!', {
        description: 'Winner is being selected...',
        action: {
          label: 'View on Etherscan',
          onClick: () => window.open(getEtherscanTxUrl(result.hash), '_blank'),
        },
      });

      await result.tx.wait();
      
      toast.success('Winner selected!', {
        description: 'The jackpot has been distributed',
      });

      refreshData();
    } catch (error) {
      console.error('Error picking winner:', error);
      toast.error('Transaction failed', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsPickingWinner(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card max-w-md text-center"
        >
          <h2 className="text-2xl font-bold mb-4 gradient-text">Connect Your Wallet</h2>
          <p className="text-[#a0aec0] mb-6">
            Please connect your wallet to access the dashboard
          </p>
          <button
            onClick={connectWallet}
            className="px-8 py-4 btn-accent rounded-lg text-white font-bold glow"
          >
            Connect Wallet
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 gradient-text">Dashboard</h1>
          <p className="text-[#a0aec0]">Welcome back, {formatAddress(account)}</p>
        </motion.div>

        {/* User Tickets */}
        {userTickets > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 card bg-gradient-to-r from-[#10b981]/20 to-[#10b981]/10 border-[#10b981]/30"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#a0aec0] mb-1">Your Tickets</div>
                <div className="text-3xl font-bold text-[#10b981]">{userTickets}</div>
              </div>
              <div className="text-5xl">🎫</div>
            </div>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <TicketPurchase />
          <StatsCard />
        </div>

        {/* Last Winner */}
        {lastWinner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card mb-8"
          >
            <h2 className="text-2xl font-bold mb-6 gradient-text">Last Winner</h2>
            <div className="flex items-center space-x-4">
              <img
                src={getAvatarUrl(lastWinner)}
                alt="Winner"
                className="w-16 h-16 rounded-full border-2 border-[#00CAFF]"
              />
              <div>
                <div className="text-sm text-[#a0aec0] mb-1">Congratulations!</div>
                <div className="text-xl font-bold text-white">{formatAddress(lastWinner)}</div>
                <div className="text-sm text-[#00CAFF]">Won the jackpot!</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Owner Actions */}
        {isOwner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card border-[#ff7e00]/30 bg-gradient-to-r from-[#ff7e00]/10 to-[#ff7e00]/5"
          >
            <h2 className="text-2xl font-bold mb-4 text-[#ff7e00]">Owner Actions</h2>
            <p className="text-[#a0aec0] mb-4">
              As the contract owner, you can pick a winner when there are players.
            </p>
            <button
              onClick={handlePickWinner}
              disabled={isPickingWinner || playersCount === 0}
              className="px-6 py-3 bg-[#ff7e00] hover:bg-[#ff7e00]/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-white font-bold transition-all"
            >
              {isPickingWinner ? 'Picking Winner...' : `Pick Winner (${playersCount} players)`}
            </button>
          </motion.div>
        )}

        {/* Players List */}
        {playersCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h2 className="text-2xl font-bold mb-6 gradient-text">Participants</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {players.slice(0, 12).map((player, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-[#1a1827] rounded-lg border border-white/5"
                >
                  <img
                    src={getAvatarUrl(player)}
                    alt="Player"
                    className="w-10 h-10 rounded-full"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{formatAddress(player)}</div>
                    <div className="text-xs text-[#a0aec0]">Ticket #{index + 1}</div>
                  </div>
                </div>
              ))}
            </div>
            {playersCount > 12 && (
              <div className="mt-4 text-center text-[#a0aec0]">
                +{playersCount - 12} more participants
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}

