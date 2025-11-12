'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { useWallet } from '../../hooks/useWallet';
import { useWalletModal } from '../../context/WalletModalContext';
import { useLottery } from '../../hooks/useLottery';
import TicketPurchase from '../../components/TicketPurchase';
import StatsCard from '../../components/StatsCard';
import { formatAddress, getAvatarUrl } from '../../lib/ethersUtils';
import { getEtherscanTxUrl } from '../../lib/ethersUtils';

export default function Dashboard() {
  const { provider, signer, account, isConnected } = useWallet();
  const { openModal } = useWalletModal();
  const {
    ticketPrice,
    jackpot,
    players,
    playersCount,
    lastWinner,
    owner,
    isOwner,
    getUserTickets,
    buyTicket,
    pickWinner,
    refreshData,
    isLoading,
  } = useLottery(provider, signer, account);

  const [userTickets, setUserTickets] = useState(0);
  const [isPickingWinner, setIsPickingWinner] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({ name: '', chainId: '' });

  useEffect(() => {
    if (isConnected && account) {
      loadUserTickets();
    }
  }, [isConnected, account, players]);

  useEffect(() => {
    let mounted = true;
    if (!provider) {
      setNetworkInfo({ name: '', chainId: '' });
      return;
    }

    (async () => {
      try {
        const network = await provider.getNetwork();
        if (!mounted) return;
        setNetworkInfo({
          name: network.name || 'local',
          chainId: network.chainId ? network.chainId.toString() : '',
        });
      } catch (error) {
        console.error('Error fetching network info:', error);
        if (!mounted) return;
        setNetworkInfo({ name: 'local', chainId: '' });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [provider]);

  const loadUserTickets = async () => {
    const tickets = await getUserTickets();
    setUserTickets(tickets);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      await loadUserTickets();
      toast.success('Tableau mis a jour');
    } catch (error) {
      console.error('Error refreshing dashboard:', error);
      toast.error('Impossible de rafraichir', {
        description: error instanceof Error ? error.message : 'Veuillez reessayer',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePickWinner = async () => {
    if (!isOwner) {
      toast.error('Seul le proprietaire du contrat peut tirer un gagnant.');
      return;
    }

    setIsPickingWinner(true);
    try {
      const result = await pickWinner();

      toast.success('Transaction envoyee', {
        description: 'Le gagnant est en cours de selection...',
        action: {
          label: 'Voir sur Etherscan',
          onClick: () => window.open(getEtherscanTxUrl(result.hash), '_blank'),
        },
      });

      await result.tx.wait();

      toast.success('Gagnant designe', {
        description: 'La cagnotte vient d etre distribuee.',
      });

      await refreshData();
      await loadUserTickets();
    } catch (error) {
      console.error('Error picking winner:', error);
      toast.error('La transaction a echoue', {
        description: error instanceof Error ? error.message : 'Veuillez reessayer',
      });
    } finally {
      setIsPickingWinner(false);
    }
  };

  const recentPlayers = useMemo(() => [...players].slice(-6).reverse(), [players, playersCount]);
  const networkLabel = networkInfo.name
    ? `${networkInfo.name}${networkInfo.chainId ? ` #${networkInfo.chainId}` : ''}`
    : 'Reseau local';
  const jackpotDisplay = isLoading ? '...' : `${jackpot} ETH`;
  const ticketPriceDisplay = ticketPrice ? `${ticketPrice} ETH` : '0.00 ETH';

  const mockInsights = useMemo(() => {
    const safeNumber = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const numericTicketPrice = safeNumber(ticketPrice);
    const numericJackpot = safeNumber(jackpot);
    const tickets24h = Math.max(playersCount + 8, Math.max(playersCount, 0));
    const revenue24h = numericTicketPrice * tickets24h;
    const averagePot = numericJackpot > 0 && playersCount > 0
      ? `${(numericJackpot / playersCount).toFixed(2)} ETH`
      : `${numericTicketPrice.toFixed(2)} ETH`;

    return [
      {
        title: 'Billets vendus (24h)',
        value: `${tickets24h}`,
        hint: '+12% vs veille (mock)',
      },
      {
        title: 'Recettes estimees',
        value: `${revenue24h.toFixed(2)} ETH`,
        hint: `Ticket moyen ${numericTicketPrice.toFixed(2)} ETH`,
      },
      {
        title: 'Prix moyen du pot',
        value: averagePot,
        hint: 'Projection base tirage courant',
      },
      {
        title: 'Cours ETH spot',
        value: '2350 USD',
        hint: 'Gaz moyen: 18 gwei (mock)',
      },
    ];
  }, [playersCount, jackpot, ticketPrice]);

  if (!isConnected) {
    return (
      <div className="dashboard dashboard--empty">
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="panel panel--glass dashboard__connect"
        >
          <h2>Connecte ton wallet</h2>
          <p>
            Accede a ton tableau de bord, achete des billets et suis la cagnotte en temps reel en connectant ton
            wallet Ethereum.
          </p>
          <button type="button" onClick={openModal}>
            Connecter un wallet
          </button>
        </motion.section>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard__inner">
        <header className="dashboard__header">
          <div>
            <p className="dashboard__eyebrow">Tableau de bord</p>
            <h1>
              Salut <span>{formatAddress(account)}</span>
            </h1>
            <p>Gere ta participation, surveille la cagnotte et tire un gagnant si tu es owner.</p>
          </div>
          <div className="dashboard__badge">
            <span>Ticket</span>
            <strong>{ticketPrice || '...' } ETH</strong>
          </div>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="panel panel--glass dashboard__status"
        >
          <div className="dashboard__status-metric">
            <span>Jackpot live</span>
            <strong>{jackpotDisplay}</strong>
            <p>Solde cumule des billets actifs.</p>
          </div>
          <div className="dashboard__status-metric">
            <span>Prix du billet</span>
            <strong>{ticketPriceDisplay}</strong>
            <p>Tarif configure sur le smart contract.</p>
          </div>
          <div className="dashboard__status-metric">
            <span>Participants</span>
            <strong>{playersCount}</strong>
            <p>Billets enregistres pour le prochain tirage.</p>
          </div>
          <div className="dashboard__status-metric">
            <span>Tes billets</span>
            <strong>{userTickets}</strong>
            <p>Plus tu en possedes, plus tu augmentes tes chances.</p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="panel panel--glass dashboard__insights"
        >
          <div className="panel__header">
            <div>
              <p className="panel__eyebrow">Insights</p>
              <h2 className="panel__title">Vue temps reel (mock)</h2>
            </div>
            <span className="chip">Mode demo</span>
          </div>
          <div className="dashboard__insights-grid">
            {mockInsights.map((insight) => (
              <article key={insight.title} className="dashboard__insight-card">
                <p className="dashboard__insight-label">{insight.title}</p>
                <strong>{insight.value}</strong>
                <span>{insight.hint}</span>
              </article>
            ))}
          </div>
        </motion.section>

        {userTickets > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="panel panel--success dashboard__highlight"
          >
            <div>
              <p className="panel__eyebrow">Tes billets</p>
              <h2>{userTickets}</h2>
            </div>
            <p>Plus tu as de billets, plus tu maximises tes chances.</p>
          </motion.section>
        )}

        <div className="dashboard__grid">
          <TicketPurchase
            ticketPrice={ticketPrice}
            isLoading={isLoading}
            buyTicket={buyTicket}
            isConnected={isConnected}
            openWalletModal={openModal}
          />
          <StatsCard
            jackpot={jackpot}
            playersCount={playersCount}
            lastWinner={lastWinner}
            isLoading={isLoading}
          />
        </div>

        {lastWinner && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel panel--glass dashboard__winner"
          >
            <div className="dashboard__winner-media">
              <img src={getAvatarUrl(lastWinner)} alt="Dernier gagnant" />
            </div>
            <div>
              <span className="panel__eyebrow">Dernier gagnant</span>
              <h2>{formatAddress(lastWinner)}</h2>
              <p>Felicitations ! Le jackpot a ete envoye automatiquement.</p>
            </div>
          </motion.section>
        )}

        {isOwner && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel panel--warning dashboard__owner"
          >
            <div>
              <span className="panel__eyebrow">Espace owner</span>
              <h2>Declencher le tirage</h2>
              <p>
                Tu peux designer un gagnant des qu il y a des participants. Assure-toi que tout le monde a eu le temps
                d acheter ses billets.
              </p>
              <div className="dashboard__owner-meta">
                <span>Owner actuel</span>
                <strong>{owner ? formatAddress(owner) : 'Non defini'}</strong>
              </div>
            </div>
            <button
              type="button"
              onClick={handlePickWinner}
              disabled={isPickingWinner || playersCount === 0}
            >
              {isPickingWinner ? 'Tirage en cours...' : `Tirer au sort (${playersCount} participant(s))`}
            </button>
          </motion.section>
        )}

        {playersCount > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel panel--glass dashboard__participants"
          >
            <div className="panel__header">
              <div>
                <p className="panel__eyebrow">Participants</p>
                <h2>Ils tentent leur chance</h2>
              </div>
              <span className="chip">
                {playersCount} billet{playersCount > 1 ? 's' : ''}
              </span>
            </div>
            <div className="dashboard__participants-list">
              {players.slice(0, 18).map((player, index) => (
                <article key={`${player}-${index}`}>
                  <img src={getAvatarUrl(player)} alt="" aria-hidden />
                  <div>
                    <p>{formatAddress(player)}</p>
                    <span>Ticket #{index + 1}</span>
                  </div>
                </article>
              ))}
            </div>
            {playersCount > 18 && (
              <footer>+ {playersCount - 18} participant(s) supplementaires</footer>
            )}
          </motion.section>
        )}
      </div>
    </div>
  );
}

