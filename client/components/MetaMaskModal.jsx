'use client';

import { motion, AnimatePresence } from 'framer-motion';

export default function MetaMaskModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative glass rounded-2xl p-8 max-w-md w-full border border-[#00CAFF]/30"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-[#a0aec0] hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#00CAFF] to-[#B915CC] rounded-2xl flex items-center justify-center">
              <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#F6851B"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#E2761B"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#CD6116"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#E2761B"/>
              </svg>
            </div>

            <h2 className="text-3xl font-bold mb-4 gradient-text">MetaMask Required</h2>
            <p className="text-[#a0aec0] mb-8">
              To use BlockLucky, you need to install MetaMask, a Web3 wallet for Ethereum.
            </p>

            <div className="space-y-4">
              <a
                href="https://metamask.io/download"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full px-6 py-4 btn-accent rounded-lg text-white font-bold text-center glow"
              >
                Install MetaMask
              </a>
              <button
                onClick={onClose}
                className="block w-full px-6 py-4 bg-[#1a1827] border border-white/10 rounded-lg text-white font-medium hover:border-[#00CAFF] transition-all"
              >
                I'll install it later
              </button>
            </div>

            <p className="text-sm text-[#a0aec0] mt-6">
              MetaMask is free and takes less than a minute to install.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

