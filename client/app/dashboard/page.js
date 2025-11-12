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
    commitRandomness,
    revealAndPickWinner,
    resetToPhase1,
    refreshData,
    isLoading,
    lotteryPhase,
    lotteryInProgress,
    commitmentActive,
    commitmentTimestamp,
    revealDeadline,
  } = useLottery(provider, signer, account);

  const [userTickets, setUserTickets] = useState(0);
  const [isPickingWinner, setIsPickingWinner] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({ name: '', chainId: '' });
  const [seed, setSeed] = useState('');
  const [storedSeed, setStoredSeed] = useState('');
  const [isCommitting, setIsCommitting] = useState(false);
  const [isRevealing, setIsRevealing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  const handleCommitRandomness = async () => {
    if (!isOwner) {
      toast.error('Seul le proprietaire du contrat peut commencer le tirage.');
      return;
    }

    if (!seed || seed.length < 10) {
      toast.error('Le seed doit contenir au moins 10 caracteres pour plus de securite.');
      return;
    }

    setIsCommitting(true);
    try {
      const result = await commitRandomness(seed);

      setStoredSeed(seed);
      localStorage.setItem('lottery_seed', seed);

      toast.success('Commitment enregistre', {
        description: 'Le hash a ete soumis. Conservez votre seed secret!',
        action: {
          label: 'Voir sur Etherscan',
          onClick: () => window.open(getEtherscanTxUrl(result.hash), '_blank'),
        },
      });

      await result.tx.wait();

      toast.success('Phase 2 activee', {
        description: 'Les joueurs ne peuvent plus acheter de billets.',
      });

      setSeed('');
      await refreshData();
    } catch (error) {
      console.error('Error committing randomness:', error);
      toast.error('La transaction a echoue', {
        description: error instanceof Error ? error.message : 'Veuillez reessayer',
      });
    } finally {
      setIsCommitting(false);
    }
  };

  const handleRevealAndPickWinner = async () => {
    if (!isOwner) {
      toast.error('Seul le proprietaire du contrat peut reveler le gagnant.');
      return;
    }

    const seedToUse = storedSeed || localStorage.getItem('lottery_seed');

    if (!seedToUse) {
      toast.error('Seed introuvable', {
        description: 'Vous devez entrer le seed utilise lors du commit.',
      });
      return;
    }

    setIsRevealing(true);
    try {
      const result = await revealAndPickWinner(seedToUse);

      toast.success('Transaction envoyee', {
        description: 'Le gagnant est en cours de selection...',
        action: {
          label: 'Voir sur Etherscan',
          onClick: () => window.open(getEtherscanTxUrl(result.hash), '_blank'),
        },
      });

      await result.tx.wait();

      toast.success('Gagnant designe!', {
        description: 'La cagnotte a ete distribuee automatiquement.',
      });

      setStoredSeed('');
      localStorage.removeItem('lottery_seed');

      await refreshData();
      await loadUserTickets();
    } catch (error) {
      console.error('Error revealing winner:', error);
      toast.error('La transaction a echoue', {
        description: error instanceof Error ? error.message : 'Veuillez reessayer',
      });
    } finally {
      setIsRevealing(false);
    }
  };

  const handleResetToPhase1 = async () => {
    if (!isOwner) {
      toast.error('Seul le proprietaire du contrat peut reinitialiser.');
      return;
    }

    setIsResetting(true);
    try {
      const result = await resetToPhase1();

      toast.success('Transaction envoyee', {
        description: 'Retour a la phase 1...',
        action: {
          label: 'Voir sur Etherscan',
          onClick: () => window.open(getEtherscanTxUrl(result.hash), '_blank'),
        },
      });

      await result.tx.wait();

      toast.success('Phase 1 reactivee', {
        description: 'Les joueurs peuvent a nouveau acheter des billets.',
      });

      await refreshData();
    } catch (error) {
      console.error('Error resetting to phase 1:', error);
      toast.error('La transaction a echoue', {
        description: error instanceof Error ? error.message : 'Veuillez reessayer',
      });
    } finally {
      setIsResetting(false);
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
              <h2>Gestion du tirage (Commit-Reveal)</h2>
              <p className="dashboard__phase-indicator">
                <strong>Phase actuelle:</strong> {lotteryPhase}
              </p>

              {!lotteryInProgress && (
                <>
                  <p>
                    Phase 1: Les joueurs peuvent acheter des billets. Quand tu es pret, entre un seed secret
                    (au moins 10 caracteres) et clique sur "Commit" pour verrouiller le tirage.
                  </p>
                  <div className="dashboard__seed-input">
                    <label htmlFor="seed-input">Seed secret</label>
                    <input
                      id="seed-input"
                      type="text"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      placeholder="Entrez un seed secret (min 10 caracteres)"
                      disabled={isCommitting}
                    />
                    <small>⚠️ Conservez ce seed, vous en aurez besoin pour la phase 3!</small>
                  </div>
                  <button
                    type="button"
                    onClick={handleCommitRandomness}
                    disabled={isCommitting || playersCount === 0 || !seed || seed.length < 10}
                  >
                    {isCommitting ? 'Commit en cours...' : `Phase 2: Commit le hash (${playersCount} participant(s))`}
                  </button>
                </>
              )}

              {lotteryInProgress && commitmentActive && (
                <>
                  <p>
                    Phase 2: Le commitment est actif. Les joueurs ne peuvent plus acheter de billets.
                    Clique sur "Reveal" pour reveler le seed et selectionner le gagnant.
                  </p>
                  {!storedSeed && (
                    <div className="dashboard__seed-input">
                      <label htmlFor="reveal-seed-input">Re-entrer le seed</label>
                      <input
                        id="reveal-seed-input"
                        type="text"
                        value={seed}
                        onChange={(e) => setSeed(e.target.value)}
                        placeholder="Entrez le seed utilise lors du commit"
                        disabled={isRevealing}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setStoredSeed(seed);
                          setSeed('');
                        }}
                        disabled={!seed}
                      >
                        Utiliser ce seed
                      </button>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={handleRevealAndPickWinner}
                    disabled={isRevealing || !storedSeed}
                  >
                    {isRevealing ? 'Reveal en cours...' : 'Phase 3: Reveal et tirer le gagnant'}
                  </button>
                </>
              )}

              {lotteryInProgress && !commitmentActive && (
                <>
                  <p>
                    Le tirage est termine. Clique sur "Reset" pour revenir a la phase 1 et permettre
                    aux joueurs d acheter des billets pour le prochain tirage.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetToPhase1}
                    disabled={isResetting}
                  >
                    {isResetting ? 'Reset en cours...' : 'Reset vers Phase 1'}
                  </button>
                </>
              )}

              <div className="dashboard__owner-meta">
                <span>Owner actuel</span>
                <strong>{owner ? formatAddress(owner) : 'Non defini'}</strong>
              </div>
            </div>
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

