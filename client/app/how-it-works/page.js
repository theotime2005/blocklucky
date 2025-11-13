'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const steps = [
  {
    title: 'Connecte ton wallet',
    description:
      'Utilise MetaMask ou tout wallet Web3 compatible. Vérifie que tu disposes de 0.1 ETH + gas pour chaque billet.',
  },
  {
    title: 'Achète des billets',
    description:
      "Un billet coûte 0.1 ETH. Tu peux en acheter plusieurs pour augmenter tes chances et faire grimper la cagnotte.",
  },
  {
    title: 'Laisse le contrat surveiller',
    description:
      'Les tirages se déclenchent automatiquement dès que le quota de billets est atteint ou à l\'expiration du timer. En cas de besoin, n\'importe qui peut forcer le tirage après la deadline.',
  },
  {
    title: 'Empoche la cagnotte',
    description:
      'Le gagnant reçoit immédiatement 100% du pot sur son wallet, sans intervention manuelle.',
  },
];

const faqs = [
  {
    question: 'Comment fonctionne BlockLucky ?',
    answer:
      'BlockLucky est une loterie décentralisée sur Ethereum. Les joueurs achètent des billets, le contrat calcule automatiquement le gagnant et distribue la cagnotte sans intermédiaire.',
  },
  {
    question: 'Le tirage est-il fiable ?',
    answer:
      'Le prototype utilise un hasard déterministe basé sur les données du bloc. Pour la production, nous prévoyons d\'intégrer un service de VRF (Chainlink, etc.) pour un hasard vérifiable.',
  },
  {
    question: 'Quand le tirage a-t-il lieu ?',
    answer:
      'Dès que le nombre maximum de billets est atteint ou que la durée paramétrée arrive à son terme. Si personne ne déclenche de transaction, n\'importe quel utilisateur peut appeler forceDraw après la deadline.',
  },
  {
    question: 'Quels sont les frais ?',
    answer:
      'Chaque billet coûte 0.1 ETH. À cela s\'ajoutent les frais de gas normaux d\'Ethereum. Ils varient selon la congestion du réseau.',
  },
  {
    question: 'Qui peut retirer la cagnotte ?',
    answer:
      'Seul le smart contract peut transférer la cagnotte au gagnant. Les fonds ne sont jamais accessibles au propriétaire.',
  },
  {
    question: 'Puis-je consulter les tirages précédents ?',
    answer:
      'Oui, toutes les transactions sont on-chain et visibles dans la section Historique, ainsi que sur Etherscan.',
  },
  {
    question: 'Quels wallets sont compatibles ?',
    answer:
      'Tout wallet injectant `window.ethereum` (MetaMask, Rainbow, etc.) fonctionnera. Assure-toi d\'être sur la bonne chaîne (localhost ou testnet).',
  },
];

export default function HowItWorks() {
  return (
    <div className="page page--narrow">
      <div className="page__inner">
        <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="page__header">
          <p className="page__eyebrow">Guides</p>
          <h1>Comment ca marche ?</h1>
          <p>Comprends les etapes cles pour participer, tirer au sort et gagner avec BlockLucky.</p>
        </motion.header>

        <section className="steps">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h2>{step.title}</h2>
                <p>{step.description}</p>
              </div>
            </motion.article>
          ))}
        </section>

        <section className="faq">
          <motion.h2 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            Questions frequentes
          </motion.h2>
          <div className="faq__grid">
            {faqs.map((faq, index) => (
              <motion.article
                key={faq.question}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.08 }}
              >
                <h3>{faq.question}</h3>
                <p>{faq.answer}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <motion.footer initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="page__cta">
          <Link href="/dashboard">Acceder au dashboard</Link>
        </motion.footer>
      </div>
    </div>
  );
}

