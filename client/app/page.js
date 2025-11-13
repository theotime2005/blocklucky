'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useWallet } from '../hooks/useWallet';
import { useLottery } from '../hooks/useLottery';
import MetaMaskModal from '../components/MetaMaskModal';

export default function Home() {
  const { provider, signer, account, connectWallet, isConnected, error } = useWallet();
  const { jackpot, playersCount, isLoading } = useLottery(provider, signer, account);
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);

  useEffect(() => {
    if (error === 'METAMASK_NOT_INSTALLED') {
      setShowMetaMaskModal(true);
    }
  }, [error]);

  const handleConnect = async () => {
    await connectWallet();
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0f0e1a] via-[#1e1b4b] to-[#0f0e1a]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,202,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(185,21,204,0.1),transparent_50%)]" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-[#00CAFF] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#B915CC] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1a1827] border border-[#00CAFF]/30 rounded-full mb-8"
            >
              <span className="w-2 h-2 bg-[#00CAFF] rounded-full animate-pulse" />
              <span className="text-sm text-[#00CAFF]">Live on Ethereum</span>
            </motion.div>

            {/* Main Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight"
            >
              <span className="block bg-gradient-to-r from-[#00CAFF] via-[#B915CC] to-[#00CAFF] bg-clip-text text-transparent bg-[length:200%_auto] animate-[shimmer_3s_linear_infinite]">
                BlockLucky
              </span>
              <span className="block text-white mt-2">Decentralized Lottery</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-xl md:text-2xl text-[#a0aec0] max-w-3xl mx-auto mb-12 leading-relaxed"
            >
              The fairest lottery on Ethereum. Transparent, secure, and completely decentralized.
              <br />
              <span className="text-[#00CAFF]">Buy tickets, join the draw, and win the jackpot!</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            >
              {isConnected ? (
                <Link
                  href="/dashboard"
                  className="group relative px-10 py-5 bg-gradient-to-r from-[#00CAFF] to-[#B915CC] rounded-xl text-white font-bold text-lg overflow-hidden glow hover:glow-purple transition-all transform hover:scale-105"
                >
                  <span className="relative z-10">Go to Dashboard</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#B915CC] to-[#00CAFF] opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ) : (
                <button
                  onClick={handleConnect}
                  className="group relative px-10 py-5 bg-gradient-to-r from-[#00CAFF] to-[#B915CC] rounded-xl text-white font-bold text-lg overflow-hidden glow hover:glow-purple transition-all transform hover:scale-105"
                >
                  <span className="relative z-10">Connect Wallet & Start</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#B915CC] to-[#00CAFF] opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              )}
              <Link
                href="/how-it-works"
                className="px-10 py-5 bg-[#1a1827]/80 backdrop-blur-sm border-2 border-white/10 rounded-xl text-white font-semibold text-lg hover:border-[#00CAFF] hover:bg-[#1a1827] transition-all"
              >
                Learn More
              </Link>
            </motion.div>

            {/* Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1,ease: "easeOut" }}
              className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto mt-2 px-6"
            >
              {[
                {
                  label: 'Current Jackpot',
                  value: isLoading ? '...' : `${jackpot} ETH`,
                  icon: '💰',
                  gradient: 'from-cyan-400 via-sky-500 to-indigo-500',
                  
                },
                {
                  label: 'Tickets Sold',
                  value: isLoading ? '...' : playersCount.toString(),
                  icon: '🎫',
                  gradient: 'from-fuchsia-500 via-purple-500 to-pink-500',
                },
                {
                  label: 'Per Ticket',
                  value: '0.1 ETH',
                  icon: '⚡',
                  gradient: 'from-[#10b981] to-[#10b981]',
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="group relative p-6 bg-[#1a1827]/80 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#00CAFF]/50 transition-all hover:scale-105"
                >
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className={`text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-[#a0aec0]">{stat.label}</div>
                  <div className="absolute inset-0 bg-gradient-to-r from-[#00CAFF]/0 to-[#B915CC]/0 group-hover:from-[#00CAFF]/5 group-hover:to-[#B915CC]/5 rounded-2xl transition-all" />
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-[#00CAFF] via-[#B915CC] to-[#00CAFF] bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-xl md:text-2xl text-[#a0aec0] max-w-3xl mx-auto">
              Simple, transparent, and fair. Here's how BlockLucky works:
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Wallet',
                description: 'Connect your MetaMask or any Web3 wallet to get started. It takes less than a minute!',
                icon: '🔗',
                color: 'from-[#00CAFF] to-[#00CAFF]',
              },
              {
                step: '02',
                title: 'Buy Tickets',
                description: 'Purchase lottery tickets at 0.1 ETH each. Buy as many as you want to increase your chances!',
                icon: '🎫',
                color: 'from-[#B915CC] to-[#B915CC]',
              },
              {
                step: '03',
                title: 'Win Big',
                description: 'The owner draws a winner randomly. The entire jackpot goes to the winner automatically!',
                icon: '🏆',
                color: 'from-[#10b981] to-[#10b981]',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="group relative p-8 bg-[#1a1827]/80 backdrop-blur-sm border border-white/10 rounded-2xl hover:border-[#00CAFF]/50 transition-all hover:scale-105"
              >
                <div className="absolute -top-4 -left-4 w-16 h-16 bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-xl flex items-center justify-center border border-[#00CAFF]/30">
                  <span className="text-[#00CAFF] font-bold">{item.step}</span>
                </div>
                <div className="text-6xl mb-6">{item.icon}</div>
                <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                <p className="text-[#a0aec0] leading-relaxed">{item.description}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-b-2xl`} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative p-12 bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#1e1b4b] rounded-3xl border-2 border-[#00CAFF]/30 overflow-hidden"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,202,255,0.2),transparent_70%)]" />
            <div className="relative z-10 text-center">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-[#00CAFF] to-[#B915CC] bg-clip-text text-transparent">
                  Ready to Try Your Luck?
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-[#a0aec0] mb-10 max-w-2xl mx-auto">
                Join thousands of players in the fairest lottery on Ethereum. Your chance to win big starts now!
              </p>
              {isConnected ? (
                <Link
                  href="/dashboard"
                  className="inline-block px-10 py-5 bg-gradient-to-r from-[#00CAFF] to-[#B915CC] rounded-xl text-white font-bold text-lg glow hover:glow-purple transition-all transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <button
                  onClick={handleConnect}
                  className="inline-block px-10 py-5 bg-gradient-to-r from-[#00CAFF] to-[#B915CC] rounded-xl text-white font-bold text-lg glow hover:glow-purple transition-all transform hover:scale-105"
                >
                  Connect Wallet & Start
                </button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* MetaMask Modal */}
      <MetaMaskModal 
        isOpen={showMetaMaskModal} 
        onClose={() => setShowMetaMaskModal(false)} 
      />
    </div>
  );
}
 