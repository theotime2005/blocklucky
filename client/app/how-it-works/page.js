'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const steps = [
  {
    title: 'Connecte ton wallet',
    description:
      'Utilise MetaMask ou tout wallet Web3 compatible. Verifie que tu disposes de 0.1 ETH + gas pour chaque billet.',
  },
  {
    title: 'Achete des billets',
    description:
      "Un billet coute 0.1 ETH. Tu peux en acheter plusieurs pour augmenter tes chances d'etre tire au sort.",
  },
  {
    title: 'Patiente jusqu au tirage',
    description:
      'Le proprietaire du contrat declenche le tirage quand il le souhaite. Tous les billets actifs participent.',
  },
  {
    title: 'Empoche la cagnotte',
    description:
      'Le gagnant recoit automatiquement l integralite des fonds sur son wallet. Rien a reclamer a la main.',
  },
];

const faqs = [
  {
    question: 'Comment fonctionne BlockLucky ?',
    answer:
      'BlockLucky est une loterie decentralisee sur Ethereum. Les joueurs achetent des billets, un owner declenche le tirage, le gagnant recoit la cagnotte instantanement.',
  },
  {
    question: 'Le tirage est-il fiable ?',
    answer:
      'Le prototype utilise une source d aleatoire simple. Pour la production, nous prevoyons d integrer un service de VRF (Chainlink, etc.) pour un hasard verifiable.',
  },
  {
    question: 'Quels sont les frais ?',
    answer:
      'Chaque billet coute 0.1 ETH. A cela s ajoutent les frais de gas normaux d Ethereum. Ils varient selon la congestion du reseau.',
  },
  {
    question: 'Qui peut retirer la cagnotte ?',
    answer:
      'Seul le smart contract peut transferer la cagnotte au gagnant. Les fonds ne sont jamais accessibles au proprietaire.',
  },
  {
    question: 'Puis-je consulter les tirages precedents ?',
    answer:
      'Oui, toutes les transactions sont on-chain et visibles dans la section Historique, ainsi que sur Etherscan.',
  },
  {
    question: 'Quels wallets sont compatibles ?',
    answer:
      'Tout wallet injectant `window.ethereum` (MetaMask, Rainbow, etc.) fonctionnera. Assure-toi d etre sur la bonne chaine (localhost ou testnet).',
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
              whileHover={{ scale: 1.02, x: 8 }}
            >
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
              >
                {String(index + 1).padStart(2, '0')}
              </motion.span>
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
                whileHover={{ scale: 1.02, borderColor: 'rgba(124, 92, 255, 0.4)' }}
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

