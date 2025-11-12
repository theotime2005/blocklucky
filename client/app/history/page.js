'use client';

import { motion } from 'framer-motion';

export default function History() {
  const draws = [];

  return (
    <div className="page">
      <div className="page__inner">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="page__header">
          <p className="page__eyebrow">Historique</p>
          <h1>Tirages passes</h1>
          <p>Suis l historique complet des jackpots distribues par BlockLucky.</p>
        </motion.header>

        {draws.length === 0 ? (
          <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="panel panel--glass page__empty">
            <span aria-hidden>📜</span>
            <h2>Pas encore de tirage</h2>
            <p>Le premier tirage apparaitra ici des qu un gagnant aura ete designe.</p>
          </motion.section>
        ) : (
          <section className="timeline">
            {draws.map((draw, index) => (
              <motion.article
                key={draw.hash ?? index}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08 }}
                className="timeline__item"
              >
                <div className="timeline__meta">
                  <span>#{draw.number}</span>
                  <time>{draw.date}</time>
                </div>
                <div className="timeline__content">
                  <p className="timeline__winner">{draw.winner}</p>
                  <p className="timeline__amount">{draw.amount} ETH</p>
                </div>
              </motion.article>
            ))}
          </section>
        )}
      </div>
    </div>
  );
}

