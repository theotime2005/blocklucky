'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useWallet } from '../hooks/useWallet';
import { useWalletModal } from '../context/WalletModalContext';
import { useLottery } from '../hooks/useLottery';
import MetaMaskModal from '../components/MetaMaskModal';
import Link from 'next/link';

export default function Home() {
  const { provider, signer, account, isConnected, error } = useWallet();
  const { openModal } = useWalletModal();
  const { jackpot, playersCount, isLoading } = useLottery(provider, signer, account);
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);
  const [timeLabel, setTimeLabel] = useState('');
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeLabel(
        now.toLocaleTimeString('fr-FR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (error === 'METAMASK_NOT_INSTALLED') {
      setShowMetaMaskModal(true);
    }
  }, [error]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleConnect = async () => {
    openModal();
  };

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

  return (
    <div className="home">
      <motion.section
        className="hero"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.header className="hero__top" variants={itemVariants}>
          <span className="hero__time">{timeLabel}</span>
          <span className="hero__breadcrumbs">BlockLucky · Loterie décentralisée</span>
        </motion.header>

        <div className="hero__canvas">
          <motion.div className="hero__heading" variants={itemVariants}>
            <motion.h1
              className="hero__title"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              Block<span className="gradient-text">Lucky</span>
            </motion.h1>
            <motion.p
              className="hero__subtitle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              La loterie blockchain transparente et équitable
            </motion.p>
          </motion.div>

          <motion.div
            className="hero__visual"
            variants={itemVariants}
            animate={{
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            <motion.span
              className="hero__visual-orb"
              aria-hidden
              animate={{
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
            <motion.span
              className="hero__visual-ring"
              aria-hidden
              animate={{
                rotate: 360,
                scale: [1, 1.1, 1],
              }}
              transition={{
                rotate: {
                  duration: 30,
                  repeat: Infinity,
                  ease: 'linear',
                },
                scale: {
                  duration: 6,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
            />
          </motion.div>
        </div>

        <motion.div className="hero__summary" variants={itemVariants}>
          <div>
            <motion.p
              className="hero__summary-title"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Tentez de remporter la cagnotte !
            </motion.p>
            <motion.p
              className="hero__summary-text"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              Participez à la loterie blockchain 100% transparente et équitable. Chaque ticket
              augmente vos chances de gagner le jackpot.
            </motion.p>
          </div>

          <motion.div
            className="hero__pot-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            <p className="hero__pot-label">Cagnotte actuelle</p>
            <motion.p
              className="hero__pot-amount"
              key={jackpot}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {isLoading ? (
                <span className="shimmer">...</span>
              ) : (
                `${jackpot} ETH`
              )}
            </motion.p>
            <p className="hero__pot-caption">
              {playersCount > 0 ? `${playersCount} participant${playersCount > 1 ? 's' : ''}` : 'Aucun participant'}
            </p>
          </motion.div>
        </motion.div>

        <motion.div className="hero__cta" variants={itemVariants}>
          {isConnected ? (
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href="/dashboard" className="hero__cta-button hero__cta-button--connected">
                Accéder au tableau de bord
              </Link>
            </motion.div>
          ) : (
            <motion.button
              onClick={handleConnect}
              className="hero__cta-button"
              whileHover={{ scale: 1.05, boxShadow: '0 32px 80px rgba(103, 76, 255, 0.7)' }}
              whileTap={{ scale: 0.95 }}
            >
              Se connecter pour participer
            </motion.button>
          )}
        </motion.div>

        <motion.footer className="hero__footer" variants={itemVariants}>
          <p className="hero__footer-text">
            🔒 100% smart-contract · ⚡ Frais réduits · 🤖 Tirage automatisé
          </p>
          <motion.button
            className="hero__cookie-button"
            type="button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Gérer mes préférences
          </motion.button>
        </motion.footer>
      </motion.section>

      <MetaMaskModal isOpen={showMetaMaskModal} onClose={() => setShowMetaMaskModal(false)} />
    </div>
  );
}
