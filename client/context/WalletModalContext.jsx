'use client';

import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { toast } from 'sonner';
import WalletConnectModal from '../components/WalletConnectModal';
import { useWallet } from '../hooks/useWallet';

const WalletModalContext = createContext({
  openModal: () => {},
  closeModal: () => {},
});

export function WalletModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const { connectWallet, connectLocal, isConnecting } = useWallet();

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  const handleSelect = useCallback(
    async (providerId) => {
      try {
        if (providerId === 'metamask') {
          await connectWallet();
          setIsOpen(false);
          return;
        }

        if (providerId === 'walletconnect') {
          toast.info('WalletConnect arrive bientot', {
            description: 'Nous finalisons l integration WalletConnect.',
          });
          return;
        }

        if (providerId === 'coinbase') {
          toast.info('Coinbase Wallet bientot disponible', {
            description: 'Connecteur Coinbase Wallet en cours de preparation.',
          });
          return;
        }

        if (providerId === 'local') {
          await connectLocal();
          setIsOpen(false);
          toast.success('Connecte au wallet de developpement');
          return;
        }

        toast.info('Option bientot disponible');
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Connexion interrompue';
        toast.error('Impossible de connecter le wallet', { description: message });
      }
    },
    [connectLocal, connectWallet],
  );

  const contextValue = useMemo(
    () => ({
      openModal,
      closeModal,
    }),
    [openModal, closeModal],
  );

  return (
    <WalletModalContext.Provider value={contextValue}>
      {children}
      <WalletConnectModal
        isOpen={isOpen}
        onClose={closeModal}
        onSelect={handleSelect}
        isConnecting={isConnecting}
      />
    </WalletModalContext.Provider>
  );
}

export function useWalletModal() {
  const context = useContext(WalletModalContext);
  if (!context) {
    throw new Error('useWalletModal must be used within a WalletModalProvider');
  }
  return context;
}

