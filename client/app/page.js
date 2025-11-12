'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '../hooks/useWallet';
import { useWalletModal } from '../context/WalletModalContext';
import { useLottery } from '../hooks/useLottery';
import MetaMaskModal from '../components/MetaMaskModal';
import Link from 'next/link';

export default function Home() {
  const { provider, signer, account, isConnected, error } = useWallet();
  const { openModal } = useWalletModal();
  const { jackpot, isLoading } = useLottery(provider, signer, account);
  const [showMetaMaskModal, setShowMetaMaskModal] = useState(false);
  const [timeLabel, setTimeLabel] = useState('');

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

  const handleConnect = async () => {
    openModal();
  };

  return (
    <div className="home">
      <section className="hero">
        <header className="hero__top">
          <span className="hero__time">{timeLabel}</span>
          <span className="hero__breadcrumbs">BlockLucky · Loterie d&apos;EtherBay</span>
        </header>

        <div className="hero__canvas">
          <div className="hero__heading">
            <h1 className="hero__title">
              Block<span>Lucky</span>
            </h1>
            <p className="hero__subtitle">Loterie d&apos;EtherBay</p>
          </div>

          <div className="hero__visual">
            <span className="hero__visual-orb" aria-hidden />
            <span className="hero__visual-ring" aria-hidden />
          </div>
        </div>

        <div className="hero__summary">
          <div>
            <p className="hero__summary-title">Tentez de remporter la cagnotte&nbsp;!</p>
            <p className="hero__summary-text">
              Participez a la loterie blockchain 100% transparente et equitable.
            </p>
          </div>

          <div className="hero__pot-card">
            <p className="hero__pot-label">Cagnotte actuelle</p>
            <p className="hero__pot-amount">
              {isLoading ? '...' : `${jackpot} ETH`}
            </p>
            <p className="hero__pot-caption">Mises regroupees en temps reel.</p>
          </div>
        </div>

        <div className="hero__cta">
          {isConnected ? (
            <Link href="/dashboard" className="hero__cta-button hero__cta-button--connected">
              Acceder au tableau de bord
            </Link>
          ) : (
            <button onClick={handleConnect} className="hero__cta-button">
              Se connecter pour participer
            </button>
          )}
        </div>

        <footer className="hero__footer">
          <p className="hero__footer-text">
            100% smart-contract - Frais reduits - Tirage automatise
          </p>
          <button className="hero__cookie-button" type="button">
            Gerer mes preferences
          </button>
        </footer>
      </section>

      <MetaMaskModal isOpen={showMetaMaskModal} onClose={() => setShowMetaMaskModal(false)} />
    </div>
  );
}
