# 🎰 BlockLucky - Smart Contract Lottery

Un smart contract de loterie simple et sécurisé développé avec Solidity et Hardhat.

## 📋 Description

BlockLucky est un contrat intelligent qui permet aux utilisateurs d'acheter des tickets de loterie et à un propriétaire (owner) de tirer au sort un gagnant qui remporte toute la cagnotte.

## 🚀 Fonctionnalités

- ✅ Achat de tickets à prix fixe (0.1 ETH)
- ✅ Tirage au sort par le propriétaire
- ✅ Distribution automatique de la cagnotte au gagnant
- ✅ Réinitialisation automatique pour le prochain tirage
- ✅ Fonctions de lecture pour consulter l'état du contrat

## 🛠️ Technologies

- **Solidity** ^0.8.20
- **Hardhat** ^2.27.0
- **ethers.js** (via Hardhat Toolbox)
- **Chai** pour les tests

## 📦 Installation

```bash
npm install
```

## 🧪 Tests

```bash
npm t
```

## 📁 Structure du Projet

```
BlockLucky/
├── contracts/
│   └── BlockLucky.sol      # Smart contract principal
├── test/
│   └── BlockLucky.test.js  # Tests automatisés
├── hardhat.config.js        # Configuration Hardhat
└── package.json            # Dépendances
```

## 📖 Utilisation

### Déploiement

```bash
npm run deploy
```

### Fonctions Principales

- `buyTicket()` : Acheter un ticket (0.1 ETH requis)
- `pickWinner()` : Tirer au sort un gagnant (owner uniquement)
- `getPlayers()` : Voir tous les participants
- `getBalance()` : Voir la cagnotte actuelle
- `getLastWinner()` : Voir le dernier gagnant

## ⚠️ Avertissement

Ce contrat utilise une méthode de randomisation basique pour le prototypage. **Ne pas utiliser en production** sans intégrer une solution de randomisation vérifiable (ex: Chainlink VRF).

## 📝 Documentation

Voir [PROJET_RECAP.md](./PROJET_RECAP.md) pour une explication détaillée du projet.

## 📄 Licence

MIT

