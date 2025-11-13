'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '../hooks/useWallet';
import { formatAddress, formatETH } from '../lib/ethersUtils';
import { useWalletModal } from '../context/WalletModalContext';

export default function Navbar() {
  const { account, balance, isConnected, disconnectWallet, isConnecting } = useWallet();
  const { openModal } = useWalletModal();
  const pathname = usePathname();

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/history', label: 'Historique' },
    { href: '/how-it-works', label: 'Fonctionnement' },
  ];

  return (
    <motion.nav
      className="navbar"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <motion.div className="navbar__brand">
        <Link href="/">
          <motion.span whileHover={{ scale: 1.05 }} className="gradient-text navbar__brand-text">
            BlockLucky
          </motion.span>
        </Link>
      </motion.div>

      <div className="navbar__links">
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <motion.span
                className={isActive ? 'navbar__link--active' : ''}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
              </motion.span>
              {isActive && (
                <motion.div
                  className="navbar__link-indicator"
                  layoutId="navbar-indicator"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      <div className="navbar__actions">
        {isConnected ? (
          <>
            <motion.div
              className="navbar__pill"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05 }}
            >
              <span>{formatAddress(account)}</span>
              {balance && (
                <motion.span
                  className="navbar__pill-balance"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {formatETH(balance, 4)} ETH
                </motion.span>
              )}
            </motion.div>
            <motion.button
              type="button"
              className="navbar__button navbar__button--ghost"
              onClick={disconnectWallet}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Se déconnecter
            </motion.button>
          </>
        ) : (
          <motion.button
            type="button"
            className="navbar__button"
            onClick={openModal}
            disabled={isConnecting}
            whileHover={{ scale: isConnecting ? 1 : 1.05 }}
            whileTap={{ scale: isConnecting ? 1 : 0.95 }}
          >
            {isConnecting ? 'Connexion...' : 'Connecter un wallet'}
          </motion.button>
        )}
      </div>
    </motion.nav>
  );
}

