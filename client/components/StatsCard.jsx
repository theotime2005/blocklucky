'use client';

import { motion } from 'framer-motion';
import { useLottery } from '../hooks/useLottery';
import { useWallet } from '../hooks/useWallet';

export default function StatsCard() {
  const { provider, signer, account } = useWallet();
  const { jackpot, playersCount, lastWinner, isLoading } = useLottery(
    provider,
    signer,
    account
  );

  const stats = [
    {
      label: 'Total Jackpot',
      value: `${jackpot} ETH`,
      icon: '💰',
      gradient: 'from-[#00CAFF] to-[#00CAFF]',
    },
    {
      label: 'Tickets Sold',
      value: playersCount.toString(),
      icon: '🎫',
      gradient: 'from-[#B915CC] to-[#B915CC]',
    },
    {
      label: 'Last Winner',
      value: lastWinner ? 'Winner!' : 'No winner yet',
      icon: '🏆',
      gradient: 'from-[#10b981] to-[#10b981]',
    },
  ];

  if (isLoading) {
    return (
      <div className="card">
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#1a1827] rounded-lg shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card"
    >
      <h2 className="text-2xl font-bold mb-6 gradient-text">Lottery Stats</h2>
      
      <div className="space-y-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 + index * 0.1 }}
            className="p-4 bg-gradient-to-r from-[#1e1b4b] to-[#312e81] rounded-lg border border-white/10 hover:border-[#00CAFF]/50 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{stat.icon}</div>
                <div>
                  <div className="text-sm text-[#a0aec0]">{stat.label}</div>
                  <div className={`text-2xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between text-sm text-[#a0aec0] mb-2">
          <span>Progress</span>
          <span>{playersCount} participants</span>
        </div>
        <div className="h-2 bg-[#1a1827] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((playersCount / 10) * 100, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#00CAFF] to-[#B915CC]"
          />
        </div>
      </div>
    </motion.div>
  );
}

