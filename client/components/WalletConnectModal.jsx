'use client';

import { AnimatePresence, motion } from 'framer-motion';

const OPTIONS = [
  {
    id: 'metamask',
    title: 'MetaMask',
    description: 'Extension navigateur & application mobile',
    badge: 'Recommande',
  },
  {
    id: 'walletconnect',
    title: 'WalletConnect',
    description: 'Scanne un QR code depuis ton wallet mobile',
  },
  {
    id: 'coinbase',
    title: 'Coinbase Wallet',
    description: 'Connexion via l application Coinbase Wallet',
  },
  {
    id: 'local',
    title: 'Wallet de developpement',
    description: 'Utilise un compte Hardhat local (127.0.0.1:8545)',
    badge: 'Dev only',
  },
];

export default function WalletConnectModal({ isOpen, onClose, onSelect, isConnecting }) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="wallet-modal__backdrop"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.25 }}
          className="wallet-modal__panel panel panel--glass"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="wallet-modal__header">
            <div>
              <p className="panel__eyebrow">Connecter un wallet</p>
              <h2 className="panel__title">Choisis ton fournisseur</h2>
            </div>
            <button type="button" onClick={onClose} aria-label="Fermer la fenetre" />
          </header>

          <div className="wallet-modal__options">
            {OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onSelect(option.id)}
                className="wallet-modal__option"
                disabled={isConnecting && option.id === 'metamask'}
              >
                <div>
                  <strong>{option.title}</strong>
                  <p>{option.description}</p>
                </div>
                <div className="wallet-modal__option-meta">
                  {option.badge && <span>{option.badge}</span>}
                  {isConnecting && option.id === 'metamask' && (
                    <svg viewBox="0 0 24 24" aria-hidden>
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  )}
                </div>
              </button>
            ))}
          </div>

          <footer className="wallet-modal__footer">
            <p>Besoin d aide ? Decouvre comment installer MetaMask ou connecter ton wallet mobile.</p>
            <a
              href="https://metamask.io/download/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Guide installation MetaMask
            </a>
          </footer>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

