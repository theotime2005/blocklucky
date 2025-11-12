'use client';

import { motion } from 'framer-motion';
import { formatAddress } from '../lib/ethersUtils';

export default function StatsCard({ jackpot, playersCount, lastWinner, owner, isLoading }) {
  const progress = Math.min((Number(playersCount) / 10) * 100, 100);
  const lastWinnerLabel = lastWinner ? formatAddress(lastWinner) : 'En attente';
  const ownerLabel = owner ? formatAddress(owner) : 'Non defini';

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="panel panel--glass stats"
    >
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Statistiques</p>
          <h2 className="panel__title">Vue d ensemble</h2>
        </div>
        <span className="chip">Temps reel</span>
      </div>

      {isLoading ? (
        <div className="stats__skeleton">
          {[1, 2, 3].map((item) => (
            <span key={item} />
          ))}
        </div>
      ) : (
        <>
          <div className="stats__grid">
            <article>
              <span className="stats__label">Jackpot total</span>
              <p className="stats__value">{jackpot} ETH</p>
              <span className="stats__icon" aria-hidden>
                💰
              </span>
            </article>
            <article>
              <span className="stats__label">Nombre de billets</span>
              <p className="stats__value">{playersCount}</p>
              <span className="stats__icon" aria-hidden>
                🎟️
              </span>
            </article>
            <article>
              <span className="stats__label">Dernier gagnant</span>
              <p className="stats__value stats__value--secondary">{lastWinnerLabel}</p>
              <span className="stats__icon" aria-hidden>
                🏆
              </span>
            </article>
            <article>
              <span className="stats__label">Owner du contrat</span>
              <p className="stats__value stats__value--secondary">{ownerLabel}</p>
              <span className="stats__icon" aria-hidden>
                👑
              </span>
            </article>
          </div>

          <div className="stats__progress">
            <div>
              <span>Progression du tirage</span>
              <span>{playersCount} participant(s)</span>
            </div>
            <div className="stats__progress-bar">
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        </>
      )}
    </motion.section>
  );
}

