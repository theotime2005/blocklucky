'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00CAFF] to-[#B915CC] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold gradient-text">BlockLucky</span>
            </div>
            <p className="text-sm text-[#a0aec0]">
              Decentralized lottery on Ethereum. Fair, transparent, and secure.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/dashboard" className="text-sm text-[#a0aec0] hover:text-[#00CAFF] transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/history" className="text-sm text-[#a0aec0] hover:text-[#00CAFF] transition-colors">
                  History
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-[#a0aec0] hover:text-[#00CAFF] transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://ethereum.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#a0aec0] hover:text-[#00CAFF] transition-colors"
                >
                  Ethereum
                </a>
              </li>
              <li>
                <a
                  href="https://metamask.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#a0aec0] hover:text-[#00CAFF] transition-colors"
                >
                  MetaMask
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-white font-semibold mb-4">Community</h3>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-[#a0aec0] hover:text-[#00CAFF] transition-colors"
              >
                Twitter
              </a>
              <a
                href="#"
                className="text-[#a0aec0] hover:text-[#00CAFF] transition-colors"
              >
                Discord
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-[#a0aec0]">
          <p>&copy; 2025 BlockLucky. Built on Ethereum.</p>
        </div>
      </div>
    </footer>
  );
}

