'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { getEtherscanTxUrl } from '../lib/ethersUtils';

export default function TicketPurchase({
  ticketPrice,
  isLoading,
  buyTicket,
  isConnected,
  openWalletModal,
}) {
  const [quantity, setQuantity] = useState(1);
  const [isBuying, setIsBuying] = useState(false);

  const priceValue = Number(ticketPrice);
  const totalPrice = Number.isFinite(priceValue)
    ? (priceValue * quantity).toFixed(4)
    : '...';

  const handleBuy = async () => {
    if (!isConnected) {
      openWalletModal();
      return;
    }

    setIsBuying(true);
    try {
      const result = await buyTicket(quantity);

      toast.success('Transaction soumise', {
        description: 'Vos billets sont en cours de validation...',
        action: {
          label: 'Voir sur Etherscan',
          onClick: () => window.open(getEtherscanTxUrl(result.hash), '_blank'),
        },
      });

      await result.tx.wait();

      toast.success('Achat confirme', {
        description: `Vous avez achete ${quantity} billet(s).`,
      });

      setQuantity(1);
    } catch (error) {
      console.error('Error buying ticket:', error);
      const message = error instanceof Error ? error.message : 'Veuillez reessayer';
      toast.error('Echec de la transaction', { description: message });
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="panel panel--primary ticket"
    >
      <div className="panel__header">
        <div>
          <p className="panel__eyebrow">Billets</p>
          <h2 className="panel__title">Achetez vos chances</h2>
        </div>
        <span className="chip chip--accent">
          {Number.isFinite(priceValue) ? `${ticketPrice} ETH / billet` : '...'}
        </span>
      </div>

      <div className="ticket__content">
        <div className="ticket__section">
          <span className="ticket__label">Quantite</span>
          <div className="ticket__quantity">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              -
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(event) =>
                setQuantity(Math.max(1, parseInt(event.target.value, 10) || 1))
              }
            />
            <button type="button" onClick={() => setQuantity(quantity + 1)}>
              +
            </button>
          </div>
          <div className="ticket__presets">
            {[1, 3, 5].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setQuantity(preset)}
                className={quantity === preset ? 'is-active' : undefined}
              >
                x{preset}
              </button>
            ))}
          </div>
        </div>

        <div className="ticket__summary">
          <div>
            <span className="ticket__label">Total estime</span>
            <p className="ticket__total">{totalPrice} ETH</p>
          </div>
          <p className="ticket__hint">Frais de gas en sus selon le reseau.</p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleBuy}
        disabled={isBuying || isLoading}
        className="panel__cta"
      >
        {isBuying ? (
          <span className="panel__cta-loading">
            <svg viewBox="0 0 24 24" className="spinner" aria-hidden>
              <circle className="spinner__track" cx="12" cy="12" r="9" />
              <path className="spinner__head" d="M21 12a9 9 0 0 1-9 9" />
            </svg>
            Traitement...
          </span>
        ) : isConnected ? (
          'Confirmer l\'achat'
        ) : (
          'Connecter un wallet pour acheter'
        )}
      </button>
    </motion.section>
  );
}

