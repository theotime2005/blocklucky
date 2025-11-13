'use client';

import { useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useLottery } from '../hooks/useLottery';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getEtherscanTxUrl } from '../lib/ethersUtils';

export default function TicketPurchase() {
  const { signer, isConnected, connectWallet } = useWallet();
  const { ticketPrice, buyTicket, isLoading } = useLottery(
    signer?.provider,
    signer,
    signer?.address
  );
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);

  const totalPrice = (parseFloat(ticketPrice) * quantity).toFixed(4);

  const handleBuy = async () => {
    if (!isConnected) {
      await connectWallet();
      return;
    }

    setIsBuying(true);
    try {
      const result = await buyTicket(quantity);
      
      toast.success('Transaction submitted!', {
        description: 'Your tickets are being processed...',
        action: {
          label: 'View on Etherscan',
          onClick: () => window.open(getEtherscanTxUrl(result.hash), '_blank'),
        },
      });

      // Wait for transaction confirmation
      await result.tx.wait();
      
      toast.success('Tickets purchased successfully!', {
        description: `You bought ${quantity} ticket(s)`,
      });

      setQuantity(1);
    } catch (error) {
      console.error('Error buying ticket:', error);
      toast.error('Transaction failed', {
        description: error.message || 'Please try again',
      });
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
    >
      <h2 className="text-2xl font-bold mb-6 gradient-text">Buy Tickets</h2>
      
      <div className="space-y-6">
        {/* Ticket Price Display */}
        <div className="p-4 bg-gradient-to-r from-[#1e1b4b] to-[#312e81] rounded-lg border border-[#00CAFF]/30">
          <div className="text-sm text-[#a0aec0] mb-1">Price per ticket</div>
          <div className="text-3xl font-bold text-[#00CAFF]">
            {ticketPrice} ETH
          </div>
        </div>

        {/* Quantity Selector */}
        <div>
          <label className="block text-sm text-[#a0aec0] mb-2">
            Quantity
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="w-10 h-10 rounded-lg bg-[#1a1827] border border-white/10 hover:border-[#00CAFF] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              className="flex-1 px-4 py-2 bg-[#1a1827] border border-white/10 rounded-lg text-white text-center focus:outline-none focus:border-[#00CAFF]"
            />
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="w-10 h-10 rounded-lg bg-[#1a1827] border border-white/10 hover:border-[#00CAFF] transition-all"
            >
              +
            </button>
          </div>
        </div>

        {/* Total Price */}
        <div className="p-4 bg-[#1a1827] rounded-lg border border-white/10">
          <div className="flex justify-between items-center">
            <span className="text-[#a0aec0]">Total</span>
            <span className="text-2xl font-bold text-white">
              {totalPrice} ETH
            </span>
          </div>
        </div>

        {/* Buy Button */}
        <button
          onClick={handleBuy}
          disabled={isBuying || isLoading}
          className="w-full py-4 btn-accent rounded-lg text-white font-bold text-lg glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isBuying ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </span>
          ) : isConnected ? (
            'Buy Tickets'
          ) : (
            'Connect Wallet to Buy'
          )}
        </button>
      </div>
    </motion.div>
  );
}

