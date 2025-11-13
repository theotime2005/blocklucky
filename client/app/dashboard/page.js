'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { ethers } from 'ethers';

import { useWallet } from '../../hooks/useWallet';
import { useWalletModal } from '../../context/WalletModalContext';
import { useLottery } from '../../hooks/useLottery';
import TicketPurchase from '../../components/TicketPurchase';
import StatsCard from '../../components/StatsCard';
import { formatAddress, getAvatarUrl, getEtherscanTxUrl } from '../../lib/ethersUtils';

function formatCountdown(seconds) {
  if (seconds <= 0) {
    return 'Prêt pour le tirage';
  }
  const minutes = Math.floor(seconds / 60);
  const rem = seconds % 60;
  const hours = Math.floor(minutes / 60);
  const minPart = minutes % 60;

  if (hours > 0) {
    return `${hours}h ${minPart.toString().padStart(2, '0')}m`;
  }
  return `${minutes}m ${rem.toString().padStart(2, '0')}s`;
}

export default function Dashboard() {
  const { provider, signer, account, isConnected } = useWallet();
  const { openModal } = useWalletModal();
  const {
    ticketPrice,
    ticketPriceRaw,
    jackpot,
    players,
    playersCount,
    lastWinner,
    owner,
    isOwner,
    isLoading,
    error,
    lotteryPhase,
    maxParticipants,
    roundDuration,
    roundDeadline,
    roundId,
    roundActive,
    roundHistory,
    buyTicket,
    forceDraw,
    updateConfiguration,
    getUserTickets,
    refreshData,
  } = useLottery(provider, signer, account);

  const [userTickets, setUserTickets] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isForcing, setIsForcing] = useState(false);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [networkInfo, setNetworkInfo] = useState({ name: '', chainId: '' });
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [configForm, setConfigForm] = useState({
    ticketPrice: '0.1',
    maxParticipants: '5',
    durationMinutes: '60',
  });

  const loadUserTickets = useCallback(async () => {
    const tickets = await getUserTickets();
    setUserTickets(tickets);
  }, [getUserTickets]);

  useEffect(() => {
    if (isConnected && account) {
      loadUserTickets();
    } else {
      setUserTickets(0);
    }
  }, [isConnected, account, playersCount, loadUserTickets]);

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
      } catch (networkError) {
        console.error('Error fetching network info:', networkError);
        if (!mounted) return;
        setNetworkInfo({ name: 'local', chainId: '' });
      }
    })();

    return () => {
      mounted = false;
    };
  }, [provider]);

  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setConfigForm((prev) => ({
      ticketPrice: ticketPrice ?? prev.ticketPrice,
      maxParticipants: maxParticipants ? String(maxParticipants) : prev.maxParticipants,
      durationMinutes: roundDuration ? String(Math.max(Math.round(roundDuration / 60), 1)) : prev.durationMinutes,
    }));
  }, [ticketPrice, maxParticipants, roundDuration]);

  const timeRemaining = useMemo(
    () => (roundDeadline ? Math.max(roundDeadline - now, 0) : 0),
    [roundDeadline, now],
  );

  const formattedCountdown = useMemo(
    () => (roundActive ? formatCountdown(timeRemaining) : 'Round en pause'),
    [roundActive, timeRemaining],
  );

  const canForceDraw = roundActive && playersCount > 0 && timeRemaining === 0;
  const spotsRemaining = maxParticipants ? Math.max(maxParticipants - playersCount, 0) : 0;
  const networkLabel = networkInfo.name
    ? `${networkInfo.name}${networkInfo.chainId ? ` #${networkInfo.chainId}` : ''}`
    : 'Reseau local';

  const jackpotDisplay = isLoading ? '...' : `${jackpot} ETH`;
  const ticketPriceDisplay = ticketPrice ? `${ticketPrice} ETH` : '0.00 ETH';
  const participantsProgress = maxParticipants
    ? Math.round(Math.min((playersCount / maxParticipants) * 100, 100))
    : 0;

  const mockInsights = useMemo(() => {
    const safeNumber = (value) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const numericTicketPrice = safeNumber(ticketPrice);
    const numericJackpot = safeNumber(jackpot);
    const tickets24h = Math.max(playersCount + 5, playersCount || 0);
    const revenue24h = numericTicketPrice * tickets24h;
    const averagePot =
      numericJackpot > 0 && playersCount > 0
        ? `${(numericJackpot / playersCount).toFixed(2)} ETH`
        : `${numericTicketPrice.toFixed(2)} ETH`;

    return [
      {
        title: 'Round actif',
        value: `#${roundId}`,
        hint: roundActive ? 'Collecte en cours' : 'Round terminé',
      },
      {
        title: 'Temps restant',
        value: formattedCountdown,
        hint: `Durée round: ${Math.max(Math.round(roundDuration / 60) || 0, 1)} min`,
      },
      {
        title: 'Progression billets',
        value: `${participantsProgress}%`,
        hint: `${playersCount}/${maxParticipants || '?'} billets`,
      },
      {
        title: 'Recettes estimées (24h)',
        value: `${revenue24h.toFixed(2)} ETH`,
        hint: `Prix moyen ${numericTicketPrice.toFixed(2)} ETH`,
      },
      {
        title: 'Ticket moyen du pot',
        value: averagePot,
        hint: 'Projection basée sur round courant',
      },
      {
        title: 'Réseau',
        value: networkLabel,
        hint: 'Source RPC configurée',
      },
    ];
  }, [
    ticketPrice,
    jackpot,
    playersCount,
    maxParticipants,
    participantsProgress,
    formattedCountdown,
    roundDuration,
    roundActive,
    roundId,
    networkLabel,
  ]);

  const recentPlayers = useMemo(() => [...players].slice(-6).reverse(), [players]);
  const historyToDisplay = useMemo(() => roundHistory.slice(0, 8), [roundHistory]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
      await loadUserTickets();
      toast.success('Tableau mis à jour');
    } catch (refreshError) {
      console.error('Error refreshing dashboard:', refreshError);
      toast.error('Impossible de rafraîchir', {
        description: refreshError instanceof Error ? refreshError.message : 'Veuillez réessayer',
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleForceDraw = async () => {
    setIsForcing(true);
    try {
      const result = await forceDraw();
      toast.success('Tirage déclenché', {
        description: 'La transaction est en cours de finalisation...',
        action: {
          label: 'Voir sur Etherscan',
          onClick: () => window.open(getEtherscanTxUrl(result.hash), '_blank'),
        },
      });
      await result.tx.wait();
      toast.success('Tirage finalisé');
      await refreshData();
      await loadUserTickets();
    } catch (forceError) {
      console.error('Error forcing draw:', forceError);
      toast.error('Impossible de déclencher le tirage', {
        description: forceError instanceof Error ? forceError.message : 'Veuillez réessayer',
      });
    } finally {
      setIsForcing(false);
    }
  };

  const handleConfigSubmit = async (event) => {
    event.preventDefault();
    if (!isOwner) {
      toast.error('Seul le propriétaire peut modifier la configuration.');
      return;
    }

    try {
      const parsedPrice = ethers.parseEther(configForm.ticketPrice || '0');
      const parsedMax = Number(configForm.maxParticipants);
      const parsedDurationSeconds = Number(configForm.durationMinutes) * 60;

      if (!Number.isFinite(parsedMax) || parsedMax < 2) {
        throw new Error('Le nombre de participants doit être supérieur ou égal à 2.');
      }
      if (!Number.isFinite(parsedDurationSeconds) || parsedDurationSeconds < 300) {
        throw new Error('La durée doit être supérieure ou égale à 5 minutes.');
      }

      setIsConfiguring(true);
      const result = await updateConfiguration(parsedPrice, parsedMax, parsedDurationSeconds);
      toast.success('Configuration envoyée', {
        description: 'Mise à jour en cours...',
        action: {
          label: 'Voir sur Etherscan',
          onClick: () => window.open(getEtherscanTxUrl(result.hash), '_blank'),
        },
      });
      await result.tx.wait();
      toast.success('Configuration mise à jour');
      await refreshData();
    } catch (configError) {
      console.error('Error updating configuration:', configError);
      toast.error('Impossible de mettre à jour la configuration', {
        description: configError instanceof Error ? configError.message : 'Veuillez réessayer',
      });
    } finally {
      setIsConfiguring(false);
    }
  };

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
            Accède à ton tableau de bord, achète des billets et suis la cagnotte en temps réel en connectant ton wallet
            Ethereum.
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
            <p>Gère ta participation, surveille la cagnotte et laisse le contrat tirer automatiquement le gagnant.</p>
          </div>
          <div className="dashboard__badge">
            <span>Ticket</span>
            <strong>{ticketPrice || '...'} ETH</strong>
          </div>
        </header>

        {(error || !roundActive) && (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel panel--warning dashboard__notice"
          >
            <div>
              <p className="panel__eyebrow">État du round</p>
              <h2>{roundActive ? 'Informations' : 'Round en pause'}</h2>
              <p>{error || 'Le contrat prépare le prochain round automatiquement.'}</p>
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="panel panel--glass dashboard__status"
        >
          <div className="dashboard__status-metric">
            <span>Jackpot live</span>
            <strong>{jackpotDisplay}</strong>
            <p>Solde cumulé des billets actifs.</p>
          </div>
          <div className="dashboard__status-metric">
            <span>Prix du billet</span>
            <strong>{ticketPriceDisplay}</strong>
            <p>Tarif configuré sur le smart contract.</p>
          </div>
          <div className="dashboard__status-metric">
            <span>Participants</span>
            <strong>{playersCount}</strong>
            <p>Billets enregistrés pour le prochain tirage.</p>
          </div>
          <div className="dashboard__status-metric">
            <span>Tes billets</span>
            <strong>{userTickets}</strong>
            <p>Plus tu en possèdes, plus tu augmentes tes chances.</p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="panel panel--glass dashboard__round"
        >
          <div className="dashboard__round-header">
            <div>
              <p className="panel__eyebrow">Round #{roundId}</p>
              <h2>{lotteryPhase}</h2>
            </div>
            <div className="dashboard__round-meta">
              <span>{formattedCountdown}</span>
              <span>{spotsRemaining} place(s) restante(s)</span>
            </div>
          </div>
          <div className="dashboard__progress">
            <div className="dashboard__progress-track">
              <div className="dashboard__progress-bar" style={{ width: `${participantsProgress}%` }} />
            </div>
            <span>{participantsProgress}% rempli</span>
          </div>
          <div className="dashboard__round-actions">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="dashboard__round-button"
            >
              {isRefreshing ? 'Rafraîchissement...' : 'Rafraîchir les données'}
            </button>
            <button
              type="button"
              onClick={handleForceDraw}
              disabled={!canForceDraw || isForcing}
              className="dashboard__round-button dashboard__round-button--accent"
            >
              {isForcing ? 'Tirage en cours...' : 'Forcer le tirage'}
            </button>
          </div>
          {!canForceDraw && (
            <p className="dashboard__round-hint">
              Le tirage se déclenche automatiquement dès que le quota de billets est atteint ou à l’expiration du
              compte à rebours. Le bouton permet de déclencher manuellement après expiration.
            </p>
          )}
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
              <h2 className="panel__title">Vue temps réel</h2>
            </div>
            <span className="chip">Auto-draw</span>
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
          <StatsCard jackpot={jackpot} playersCount={playersCount} lastWinner={lastWinner} isLoading={isLoading} />
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
              <p>Félicitations ! Le jackpot a été envoyé automatiquement.</p>
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
              <h2>Configuration du round</h2>
              <p className="dashboard__phase-indicator">
                <strong>Owner actuel :</strong> {owner ? formatAddress(owner) : 'Non défini'}
              </p>
              <form className="dashboard__config-form" onSubmit={handleConfigSubmit}>
                <div className="dashboard__config-group">
                  <label htmlFor="config-ticket">Prix du ticket (ETH)</label>
                  <input
                    id="config-ticket"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={configForm.ticketPrice}
                    onChange={(event) =>
                      setConfigForm((prev) => ({ ...prev, ticketPrice: event.target.value }))
                    }
                    disabled={isConfiguring}
                  />
                </div>
                <div className="dashboard__config-group">
                  <label htmlFor="config-max">Participants max</label>
                  <input
                    id="config-max"
                    type="number"
                    min="2"
                    value={configForm.maxParticipants}
                    onChange={(event) =>
                      setConfigForm((prev) => ({ ...prev, maxParticipants: event.target.value }))
                    }
                    disabled={isConfiguring}
                  />
                </div>
                <div className="dashboard__config-group">
                  <label htmlFor="config-duration">Durée du round (minutes)</label>
                  <input
                    id="config-duration"
                    type="number"
                    min="5"
                    value={configForm.durationMinutes}
                    onChange={(event) =>
                      setConfigForm((prev) => ({ ...prev, durationMinutes: event.target.value }))
                    }
                    disabled={isConfiguring}
                  />
                </div>
                <button type="submit" disabled={isConfiguring} className="dashboard__round-button">
                  {isConfiguring ? 'Mise à jour...' : 'Enregistrer la configuration'}
                </button>
              </form>
              <p className="dashboard__config-hint">
                Les paramètres s’appliquent immédiatement au round en cours. Le tirage reste automatique lorsque les
                conditions sont atteintes.
              </p>
            </div>
          </motion.section>
        )}

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="panel panel--glass dashboard__history"
        >
          <div className="panel__header">
            <div>
              <p className="panel__eyebrow">Historique</p>
              <h2>Tirages récents</h2>
            </div>
            <span className="chip">{roundHistory.length} round(s)</span>
          </div>
          {historyToDisplay.length === 0 ? (
            <p>Aucun tirage passé pour le moment. Le premier gagnant apparaîtra ici.</p>
          ) : (
            <ul className="dashboard__history-list">
              {historyToDisplay.map((round) => (
                <li key={round.id}>
                  <div>
                    <strong>Round #{round.id}</strong>
                    <span>{new Date(round.completedAt * 1000).toLocaleString()}</span>
                  </div>
                  <div>
                    <p>{formatAddress(round.winner)}</p>
                    <span>{round.prize} ETH · {round.ticketCount} billets</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </motion.section>

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
            {playersCount > 18 && <footer>+ {playersCount - 18} participant(s) supplémentaires</footer>}
          </motion.section>
        )}
      </div>
    </div>
  );
}

