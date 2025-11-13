'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { href: '/how-it-works', label: 'Comment ça marche' },
    { href: '/history', label: 'Historique' },
    { href: '/dashboard', label: 'Dashboard' },
  ];

  return (
    <motion.footer
      className="footer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className="footer__content">
        <div className="footer__brand">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            © {currentYear} BlockLucky
          </motion.p>
          <motion.p
            className="footer__subtitle"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Construite sur Ethereum · Décentralisée · Transparente
          </motion.p>
        </div>

        <nav className="footer__nav">
          {footerLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <Link href={link.href}>
                <motion.span
                  whileHover={{ scale: 1.05, color: '#7c5cff' }}
                  whileTap={{ scale: 0.95 }}
                >
                  {link.label}
                </motion.span>
              </Link>
            </motion.div>
          ))}
        </nav>
      </div>
    </motion.footer>
  );
}

