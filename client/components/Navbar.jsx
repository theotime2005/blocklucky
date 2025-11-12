'use client';

import Link from 'next/link';
import { useWallet } from '../hooks/useWallet';
import { formatAddress, formatETH } from '../lib/ethersUtils';
import { useWalletModal } from '../context/WalletModalContext';

export default function Navbar() {
  const { account, balance, isConnected, disconnectWallet, isConnecting } = useWallet();
  const { openModal } = useWalletModal();

  return (
    <nav className="navbar">
      <div className="navbar__brand">
        <Link href="/">BlockLucky</Link>
      </div>

      <div className="navbar__links">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/history">Historique</Link>
        <Link href="/how-it-works">Fonctionnement</Link>
      </div>

      <div className="navbar__actions">
        {isConnected ? (
          <>
            <div className="navbar__pill">
              <span>{formatAddress(account)}</span>
              {balance && <span className="navbar__pill-balance">{formatETH(balance, 4)} ETH</span>}
            </div>
            <button
              type="button"
              className="navbar__button navbar__button--ghost"
              onClick={disconnectWallet}
            >
              Se deconnecter
            </button>
          </>
        ) : (
          <button
            type="button"
            className="navbar__button"
            onClick={openModal}
            disabled={isConnecting}
          >
            {isConnecting ? 'Connexion...' : 'Connecter un wallet'}
          </button>
        )}
      </div>
    </nav>
  );
}

