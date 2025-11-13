# BlockLucky - Smart Contract Lottery

Une application de loterie simple basée sur un smart contract Ethereum, développée avec Solidity et Hardhat, accompagnée d'une interface client Next.js.

## But

- BlockLucky permet aux utilisateurs d'acheter des tickets à prix fixe (0.1 ETH).
- Le contrat sélectionne automatiquement un gagnant dès que le quota de participants est atteint ou qu'une durée prédéfinie expire.
- La cagnotte est transférée au gagnant et un nouveau round s'ouvre immédiatement.

---

## Table des matières

- Prérequis
- Installation (root / blocks / client)
- Variables d'environnement
- Commandes utiles
- Déploiement local
- Tests
- API du contrat
- Structure du projet
- Sécurité & limitations
- Contribution
- Licence

---

## Prérequis

- Node.js (>= 18 recommandé)
- npm
- Git
- Pour le développement local de la blockchain : Hardhat (installé via npm dans `blocks`)

Remarque : ce projet contient deux sous-projets : `blocks/` (smart contracts + scripts Hardhat) et `client/` (interface Next.js). Certaines commandes doivent être exécutées depuis la racine, d'autres depuis ces dossiers.

---

## Installation

1. Cloner le dépôt :

```bash
git clone https://github.com/theotime2005/blocklucky.git
cd blocklucky
```

2. Installer les dépendances (à la racine les scripts CI installent les sous-dépendances) :

```bash
npm install
# puis (optionnel) installer séparément les sous-projets
cd blocks && npm install && cd ../client && npm install && cd ..
```

Alternativement, depuis la racine :

```bash
npm run ci-all
```

---

## Variables d'environnement

Fichiers possibles (exemples) :

- `client/.env.local` (pour l'interface Next.js)
  - NEXT_PUBLIC_CONTRACT_ADDRESS=0x... # adresse du contrat déployé

- `blocks/.env` (si vous déployez vers un réseau réel/testnet)
  - PRIVATE_KEY=0x...      # clé privée du compte deployer (ne pas committer)
  - RPC_URL=https://...     # endpoint RPC du réseau cible (Infura, Alchemy, etc.)

Important : ne commitez jamais de clés privées ou d'URLs avec secrets dans le dépôt.

---

## Commandes utiles

Depuis la racine (script helper) :

- Installer les dépendances des sous-projets :
  - npm run ci-blocks
  - npm run ci-client

- Lancer tous les tests (exécute les tests blocks et client) :
  - npm test

Dans `blocks/` (smart contracts)

- Installer :
  - npm install
- Compiler les contrats :
  - npm run compile
- Lancer les tests Hardhat :
  - npm test
  - ou: npx hardhat test
- Déployer (par défaut via `scripts/deploy.js`) :
  - npm run deploy            # utilise la configuration par défaut de hardhat
  - npm run deploy:local      # deployment explicite sur `localhost` (Hardhat node)
- Lancer un nœud local Hardhat :
  - npx hardhat node

Dans `client/` (interface Next.js)

- Installer :
  - npm install
- Lancer le serveur de développement :
  - npm run dev
- Builder :
  - npm run build
- Démarrer la version build :
  - npm run start
- Lancer les tests unitaires :
  - npm test

---

## Déploiement local (rapide)

1. Démarrer un nœud local Hardhat (dans `blocks/`) :

```bash
cd blocks
npx hardhat node
```

2. Dans un autre terminal, déployer le contrat sur ce réseau local :

```bash
cd blocks
npm run deploy:local
```

3. Lancer l’interface web :

```bash
# À la racine du projet
npm run dev
```

La sortie de déploiement affichera l'adresse du contrat ; copiez-la dans `client/.env.local` sous la clé `NEXT_PUBLIC_CONTRACT_ADDRESS` pour que l'interface puisse interagir avec le contrat local.

---

## Tests

- Tests des contrats (Hardhat) :

```bash
cd blocks
npm test
```

- Tests du client (Jest) :

```bash
cd client
npm test
```

- Depuis la racine (exécute les deux suites) :

```bash
npm test
```

---

## API du contrat (rappel rapide)

Les fonctions principales exposées par le smart contract `BlockLucky` :

- buyTicket() : payable — acheter un ticket (0.1 ETH attendu)
- pickWinner() : onlyOwner — tirer un gagnant et envoyer la cagnotte
- getPlayers() view — retourne la liste des joueurs actuels
- getBalance() view — retourne le solde du contrat
- getLastWinner() view — retourne la dernière adresse gagnante

Pour les signatures exactes et la logique, consultez `blocks/contracts/BlockLucky.sol` et les artefacts compilés dans `blocks/artifacts/`.

---

## Structure du projet

```
blocklucky/
├─ blocks/        # smart contracts, scripts de déploiement et tests (Hardhat)
│  ├─ contracts/
│  ├─ scripts/
│  ├─ test/
│  └─ package.json
├─ client/        # interface Next.js
│  ├─ app/
│  ├─ components/
│  └─ package.json
├─ PROJET_RECAP.md
├─ README.md      # ce fichier
└─ package.json   # scripts utilitaires pour installer / tester les sous-projets
```

---

## Sécurité & limitations

- La méthode de randomisation utilisée dans le contrat est basique et non sécurisée pour la production. Pour un usage réel, utilisez une source de hasard vérifiable (ex: Chainlink VRF).
- Attention aux frais gas lors des tests sur testnets/mainnet.
- Ne stockez jamais de clés privées dans le dépôt. Utilisez des variables d'environnement et un vault si nécessaire.

---

## Contribution

Si vous souhaitez contribuer :

1. Forkez le projet
2. Créez une branche feature/fix
3. Faites vos modifications et tests
4. Ouvrez une Pull Request

Merci de respecter les bonnes pratiques Git et d'ajouter des tests pour les changements significatifs.

---

## Liens utiles

- Artefacts Hardhat : `blocks/artifacts/`
- Tests contrats : `blocks/test/`
- Tests client : `client/__tests__/` et `client/__tests__`
- Documentation du projet : `PROJET_RECAP.md`

---

## Licence

MIT
