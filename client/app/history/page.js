'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

import { useWallet } from '../../hooks/useWallet';
import { useLottery } from '../../hooks/useLottery';
import { formatAddress } from '../../lib/ethersUtils';

export default function History() {
  const { provider, signer, account } = useWallet();
  const { roundHistory, refreshData, isLoading, roundId } = useLottery(provider, signer, account);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const historyEntries = useMemo(() => roundHistory, [roundHistory]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="page">
      <motion.div className="page__inner" variants={containerVariants} initial="hidden" animate="visible">
        <motion.header variants={itemVariants} className="page__header">
          <p className="page__eyebrow">Historique</p>
          <h1>Tirages passés</h1>
          <p>Suivez l&apos;historique complet des jackpots distribués par BlockLucky.</p>
          <div className="page__actions">
            <div className="page__cta">
              <button type="button" onClick={handleRefresh} disabled={isRefreshing}>
                {isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir'}
              </button>
            </div>
            <span className="page__meta">Round courant : #{roundId}</span>
          </div>
        </motion.header>

        {isLoading ? (
          <motion.section variants={itemVariants} className="panel panel--glass page__empty">
            <p>Chargement des tirages...</p>
          </motion.section>
        ) : historyEntries.length === 0 ? (
          <motion.section variants={itemVariants} className="panel panel--glass page__empty" whileHover={{ scale: 1.02 }}>
            <motion.span
              aria-hidden
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{ fontSize: '4rem' }}
            >
              📜
            </motion.span>
            <h2>Pas encore de tirage</h2>
            <p>Le premier tirage apparaîtra ici dès qu&apos;un gagnant aura été désigné.</p>
            <motion.div style={{ marginTop: '1.5rem' }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/dashboard" className="page__cta">
                <span>Accéder au dashboard</span>
              </Link>
            </motion.div>
          </motion.section>
        ) : (
          <motion.section className="timeline" variants={containerVariants}>
            {historyEntries.map((round, index) => (
              <motion.article
                key={round.id}
                variants={itemVariants}
                className="timeline__item"
                whileHover={{ scale: 1.02, x: 8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                <div className="timeline__meta">
                  <span>#{round.id}</span>
                  <time>{new Date(round.completedAt * 1000).toLocaleString()}</time>
                </div>
                <div className="timeline__content">
                  <p className="timeline__winner">{formatAddress(round.winner)}</p>
                  <motion.p
                    className="timeline__amount"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.08 }}
                  >
                    {round.prize} ETH · {round.ticketCount} billet{round.ticketCount > 1 ? 's' : ''}
                  </motion.p>
                </div>
              </motion.article>
            ))}
          </motion.section>
        )}
      </motion.div>
    </div>
  );
}

