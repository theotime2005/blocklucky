'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '../hooks/useWallet';
import { formatAddress, formatETH } from '../lib/ethersUtils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Navbar() {
  const { account, balance, isConnected, connectWallet, disconnectWallet } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#00CAFF] to-[#B915CC] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">B</span>
            </div>
            <span className="text-9xl font-extrabold gradient-text ">BlockLucky</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-[#a0aec0] hover:text-white transition-colors">
              Home
            </Link>
            <Link href="/dashboard" className="text-[#a0aec0] hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/history" className="text-[#a0aec0] hover:text-white transition-colors">
              History
            </Link>
            <Link href="/how-it-works" className="text-[#a0aec0] hover:text-white transition-colors">
              How It Works
            </Link>
          </div>

          {/* Wallet Button */}
          <div className="hidden md:flex items-center space-x-4">
            {isConnected ? (
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm text-[#a0aec0]">
                    {formatAddress(account)}
                  </div>
                  {balance && (
                    <div className="text-xs text-[#00CAFF]">
                      {formatETH(balance, 4)} ETH
                    </div>
                  )}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="px-4 py-2 bg-[#1a1827] border border-[#00CAFF]/30 rounded-lg text-[#00CAFF] hover:bg-[#00CAFF]/10 transition-all"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="px-6 py-2 btn-accent rounded-lg text-white font-medium glow hover:glow-purple transition-all"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-white/10"
          >
            <div className="px-4 py-4 space-y-4">
              <Link href="/" className="block text-[#a0aec0] hover:text-white">
                Home
              </Link>
              <Link href="/dashboard" className="block text-[#a0aec0] hover:text-white">
                Dashboard
              </Link>
              <Link href="/history" className="block text-[#a0aec0] hover:text-white">
                History
              </Link>
              <Link href="/how-it-works" className="block text-[#a0aec0] hover:text-white">
                How It Works
              </Link>
              {isConnected ? (
                <div className="pt-4 border-t border-white/10">
                  <div className="text-sm text-[#a0aec0] mb-2">
                    {formatAddress(account)}
                  </div>
                  {balance && (
                    <div className="text-sm text-[#00CAFF] mb-4">
                      {formatETH(balance, 4)} ETH
                    </div>
                  )}
                  <button
                    onClick={disconnectWallet}
                    className="w-full px-4 py-2 bg-[#1a1827] border border-[#00CAFF]/30 rounded-lg text-[#00CAFF]"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="w-full px-6 py-2 btn-accent rounded-lg text-white font-medium"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

