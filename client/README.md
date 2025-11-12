# BlockLucky - Frontend

Interface Web3 moderne pour la loterie décentralisée BlockLucky.

## 🚀 Démarrage Rapide

### Installation

```bash
npm install
```

### Configuration

Créez un fichier `.env.local` à la racine du dossier `client/` :

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x...  # Adresse du contrat déployé
NEXT_PUBLIC_CHAIN_ID=1              # 1 pour Mainnet, 11155111 pour Sepolia
NEXT_PUBLIC_ETHERSCAN_URL=https://etherscan.io
```

### Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure

```
client/
├── app/              # Pages Next.js (App Router)
│   ├── page.js       # Landing page
│   ├── dashboard/    # Dashboard principal
│   ├── history/      # Historique des draws
│   └── how-it-works/ # FAQ et explications
├── components/       # Composants React réutilisables
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── TicketPurchase.jsx
│   └── StatsCard.jsx
├── hooks/           # Custom hooks
│   ├── useWallet.js
│   └── useLottery.js
└── lib/             # Utilitaires
    ├── constants.js
    ├── contract.js
    └── ethersUtils.js
```

## 🎨 Design System

### Couleurs

- **Primary Gradient**: `#1e1b4b` → `#312e81`
- **Accent Neon**: `#00CAFF`
- **Accent Purple**: `#B915CC`
- **Background**: `#0f0e1a`
- **Card**: `#1a1827`

### Technologies

- **Next.js 16** (App Router)
- **React 19**
- **Tailwind CSS v4**
- **Framer Motion** (animations)
- **Ethers.js v6** (Web3)
- **Sonner** (notifications)

## 🔧 Fonctionnalités

- ✅ Connexion wallet (MetaMask)
- ✅ Achat de tickets
- ✅ Affichage des statistiques en temps réel
- ✅ Interface owner pour tirer au sort
- ✅ Design responsive mobile-first
- ✅ Animations fluides
- ✅ Notifications de transactions

## 📝 Notes

- L'adresse du contrat doit être configurée dans `.env.local`
- L'application nécessite MetaMask ou un wallet Web3 compatible
- Les transactions nécessitent des ETH pour les gas fees
