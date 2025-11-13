'use client';

import { motion } from 'framer-motion';

export default function History() {
  // TODO: Implement history fetching from events
  const draws = []; // Will be populated from contract events

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 gradient-text">Draw History</h1>
          <p className="text-[#a0aec0]">View all past lottery draws and winners</p>
        </motion.div>

        {draws.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-16"
          >
            <div className="text-6xl mb-4">📜</div>
            <h2 className="text-2xl font-bold mb-2 text-white">No History Yet</h2>
            <p className="text-[#a0aec0]">
              Once the first draw happens, the history will appear here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {draws.map((draw, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-[#a0aec0] mb-1">Draw #{draw.number}</div>
                    <div className="text-xl font-bold text-white">{draw.winner}</div>
                    <div className="text-sm text-[#00CAFF]">{draw.amount} ETH</div>
                  </div>
                  <div className="text-[#a0aec0]">{draw.date}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

