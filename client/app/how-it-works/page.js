'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function HowItWorks() {
  const faqs = [
    {
      question: 'How does BlockLucky work?',
      answer: 'BlockLucky is a decentralized lottery on Ethereum. Users buy tickets at 0.1 ETH each. The contract owner can draw a winner randomly, and the entire jackpot goes to the winner.',
    },
    {
      question: 'Is it fair?',
      answer: 'The lottery uses blockchain technology for transparency. All transactions are public and verifiable on Ethereum. However, note that the current random selection method is basic and suitable for prototypes only.',
    },
    {
      question: 'How much does a ticket cost?',
      answer: 'Each ticket costs exactly 0.1 ETH. You can buy multiple tickets to increase your chances.',
    },
    {
      question: 'When is the draw?',
      answer: 'The contract owner decides when to draw a winner. There\'s no fixed schedule - the owner can pick a winner at any time when there are players.',
    },
    {
      question: 'What happens to the jackpot?',
      answer: 'The entire balance of the contract (all ticket purchases) goes to the winner. The contract owner cannot access these funds.',
    },
    {
      question: 'Do I need to pay gas fees?',
      answer: 'Yes, you need to pay Ethereum gas fees for all transactions (buying tickets, picking winner). Gas fees vary based on network congestion.',
    },
    {
      question: 'Is this secure?',
      answer: 'The smart contract is deployed on Ethereum and all code is transparent. However, this is a prototype - for production use, a more secure random number generation method (like Chainlink VRF) should be used.',
    },
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl font-bold mb-4 gradient-text">How It Works</h1>
          <p className="text-xl text-[#a0aec0]">
            Everything you need to know about BlockLucky
          </p>
        </motion.div>

        {/* Process Steps */}
        <div className="space-y-8 mb-16">
          {[
            {
              step: 1,
              title: 'Connect Your Wallet',
              description: 'Use MetaMask or any Web3 wallet to connect to Ethereum. Make sure you have ETH for tickets and gas fees.',
            },
            {
              step: 2,
              title: 'Buy Tickets',
              description: 'Each ticket costs 0.1 ETH. You can buy as many tickets as you want. More tickets = higher chances of winning!',
            },
            {
              step: 3,
              title: 'Wait for the Draw',
              description: 'The contract owner will pick a winner randomly from all ticket holders. The entire jackpot goes to the winner.',
            },
            {
              step: 4,
              title: 'Win Big!',
              description: 'If you win, the ETH is automatically transferred to your wallet. No manual claims needed!',
            },
          ].map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="card"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-[#00CAFF] to-[#B915CC] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 text-white">{item.title}</h3>
                  <p className="text-[#a0aec0]">{item.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-8 gradient-text text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1 }}
                className="card"
              >
                <h3 className="text-xl font-bold mb-2 text-white">{faq.question}</h3>
                <p className="text-[#a0aec0]">{faq.answer}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5 }}
          className="mt-16 text-center"
        >
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 btn-accent rounded-lg text-white font-bold text-lg glow"
          >
            Get Started
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

