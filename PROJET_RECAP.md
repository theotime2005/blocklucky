# Récapitulatif du Projet BlockLucky

## Vue d'ensemble

BlockLucky est un smart contract de loterie simple déployé sur la blockchain Ethereum. Les utilisateurs peuvent acheter des tickets et un propriétaire (owner) peut tirer au sort un gagnant qui remporte toute la cagnotte.

---

## Phase 1 : Initialisation du Projet

### Structure du projet

```
BlockLucky/
├── contracts/          # Smart contracts Solidity
│   └── BlockLucky.sol
├── test/              # Tests automatisés
│   └── BlockLucky.test.js
├── hardhat.config.js  # Configuration Hardhat
├── package.json       # Dépendances npm
└── .vscode/           # Configuration éditeur
    └── extensions.json
```

### Installation des dépendances

- **Hardhat** : Framework de développement Ethereum
- **@nomicfoundation/hardhat-toolbox** : Outils pour compiler, tester et déployer
- **Chai** : Bibliothèque d'assertions pour les tests
- **ethers.js** : Bibliothèque pour interagir avec la blockchain

**Problèmes rencontrés et résolus :**

- Projet sans `package.json` → Initialisé avec `npm init -y`
- Tentative ESM (type: "module") → Revenu à CommonJS (compatibilité Hardhat 2.x)
- Versions incompatibles → Utilisé Hardhat 2.27.0 + Toolbox 3.0.0

---

## Phase 2 : Le Smart Contract (BlockLucky.sol)

### Variables d'État

```solidity
address public owner;              // Propriétaire du contrat
uint256 public ticketPrice;        // Prix d'un ticket (0.1 ether)
address payable[] public players;   // Liste des participants
address public lastWinner;         // Dernier gagnant
```

**Logique :**

- `owner` : Initialisé au déploiement avec `msg.sender` (celui qui déploie)
- `ticketPrice` : Fixé à 0.1 ether dans le constructeur
- `players` : Tableau dynamique qui s'agrandit à chaque achat de ticket
- `lastWinner` : Mis à jour après chaque tirage

### Modifier `onlyOwner`

```solidity
modifier onlyOwner() {
    require(msg.sender == owner, "Not authorized");
    _;
}
```

**Logique :**

- Vérifie que l'appelant est le propriétaire
- `_` = point d'injection où le code de la fonction est exécuté
- Utilisé pour protéger `pickWinner()` (seul le owner peut tirer au sort)

### Fonction `buyTicket()`

```solidity
function buyTicket() external payable {
    require(msg.value == ticketPrice, "Incorrect ticket price");
    players.push(payable(msg.sender));
}
```

**Logique :**

- `external` : Peut être appelée depuis l'extérieur du contrat
- `payable` : Permet de recevoir des ethers
- `require` : Vérifie que le montant envoyé est EXACTEMENT égal au prix du ticket
- Si OK → ajoute l'adresse du participant au tableau `players`
- L'ether envoyé reste dans le contrat (cagnotte)

**Sécurité :**

- Vérification stricte du montant (pas de montant partiel accepté)
- Empêche les erreurs de transaction

### Fonction `pickWinner()` - Le Cœur du Système

```solidity
function pickWinner() external onlyOwner {
    require(players.length > 0, "No players");
    
    // Génération pseudo-aléatoire
    uint256 randomIndex = uint256(
        keccak256(
            abi.encodePacked(block.timestamp, block.difficulty, players.length)
        )
    ) % players.length;
    
    address payable winnerAddress = players[randomIndex];
    lastWinner = winnerAddress;
    
    uint256 prize = address(this).balance;
    require(prize > 0, "No funds to transfer");
    
    (bool success, ) = winnerAddress.call{value: prize}("");
    require(success, "Transfer failed");
    
    delete players;
}
```

**Logique étape par étape :**

1. **Vérification d'accès** : `onlyOwner` garantit que seul le propriétaire peut appeler
2. **Vérification des joueurs** : Doit y avoir au moins 1 participant
3. **Génération aléatoire** :
   - `keccak256()` : Fonction de hachage cryptographique
   - `abi.encodePacked()` : Combine plusieurs valeurs en bytes
   - `block.timestamp` : Temps du bloc actuel
   - `block.difficulty` : Difficulté du bloc (maintenant `prevrandao` sur Paris)
   - `players.length` : Nombre de participants
   - `% players.length` : Modulo pour obtenir un index valide (0 à length-1)
4. **Sélection du gagnant** : Récupère l'adresse à l'index aléatoire
5. **Mise à jour** : Enregistre le gagnant dans `lastWinner`
6. **Transfert** : Envoie TOUTE la balance du contrat au gagnant
   - `address(this).balance` : Solde total du contrat
   - `call{value: prize}("")` : Méthode moderne et sécurisée pour envoyer des ethers
7. **Réinitialisation** : Vide le tableau `players` pour le prochain tirage

**Important - Sécurité :**

- Cette méthode de randomisation est **prévisible** (pas sécurisée pour la production)
- Pour la production, utiliser Chainlink VRF (Verifiable Random Function)
- `block.difficulty` est déprécié → utiliser `block.prevrandao` sur les réseaux récents

### Fonctions de Lecture (View)

```solidity
function getPlayers() external view returns (address payable[] memory)
function getManager() external view returns (address)
function getLastWinner() external view returns (address)
function getBalance() external view returns (uint256)
```

**Logique :**

- `view` : Fonctions en lecture seule (pas de modification d'état)
- Gratuites à appeler (pas de gas nécessaire)
- Permettent aux interfaces frontend de récupérer les données

---

## Phase 3 : Tests Automatisés

### Structure des Tests

**Framework :** Mocha + Chai + Hardhat

```javascript
describe("BlockLucky", function () {
  // Tests individuels avec it()
})
```

### Scénarios Testés

#### Test 1 : Déploiement

```javascript
it("deploys with correct owner and ticket price")
```

- Vérifie que le owner est bien celui qui déploie
- Vérifie que le ticketPrice est 0.1 ether

#### Test 2 : Achat de Ticket Réussi

```javascript
it("allows a player to buy a ticket with exact price")
```

- Un joueur achète un ticket avec le bon montant
- Vérifie qu'il est bien ajouté au tableau `players`

#### Test 3 : Échec d'Achat

```javascript
it("reverts when buying a ticket with incorrect value")
```

- Tente d'acheter avec un montant incorrect (0.05 ether)
- Vérifie que la transaction échoue avec le message d'erreur

#### Test 4 : Protection d'Accès

```javascript
it("restricts pickWinner to the owner")
```

- Un joueur tente d'appeler `pickWinner()`
- Vérifie que ça échoue avec "Not authorized"

#### Test 5 : Flux Complet

```javascript
it("completes the lottery flow and resets state")
```

1. 3 joueurs achètent des tickets
2. Vérifie que la balance = 0.3 ether (3 × 0.1)
3. Le owner tire au sort
4. Vérifie que la balance = 0 (tout transféré)
5. Vérifie que le tableau `players` est vide

**Logique des Fixtures :**

```javascript
async function deployContractFixture() {
  const [owner, player1, player2, player3] = await ethers.getSigners();
  // ...
}
```

- `getSigners()` : Récupère des comptes de test depuis Hardhat
- Réutilisable dans tous les tests (DRY principle)

---

## Phase 4 : Configuration

### hardhat.config.js

```javascript
solidity: {
  version: "0.8.20",  // Version du compilateur
  settings: {
    optimizer: {
      enabled: true,  // Réduit la taille du bytecode
      runs: 200,      // Optimise pour 200 exécutions
    },
  },
}
```

**Logique :**

- Optimizer : Réduit les coûts de déploiement et d'exécution
- `runs: 200` : Optimise pour des fonctions appelées ~200 fois

### package.json

```json
{
  "type": "commonjs",  // Format des modules
  "devDependencies": {
    "hardhat": "^2.27.0",
    "@nomicfoundation/hardhat-toolbox": "^3.0.0"
  }
}
```

### .vscode/extensions.json

Recommandations d'extensions pour la coloration syntaxique Solidity.

---

## Flux Complet d'Utilisation

```
1. Déploiement
   └─> Owner initialisé, ticketPrice = 0.1 ether

2. Achat de Tickets
   └─> Joueurs envoient 0.1 ether chacun
   └─> Ajoutés au tableau players
   └─> Cagnotte augmente

3. Tirage au Sort
   └─> Owner appelle pickWinner()
   └─> Génération d'un index aléatoire
   └─> Sélection du gagnant
   └─> Transfert de toute la cagnotte
   └─> Réinitialisation du tableau

4. Nouveau Cycle
   └─> Retour à l'étape 2
```

---

## Concepts Clés Appris

### Solidity

- **Modifiers** : Réutilisables pour vérifications
- **payable** : Recevoir des ethers
- **external/view** : Visibilité des fonctions
- **require** : Vérifications et messages d'erreur
- **keccak256** : Hachage cryptographique
- **call{value}** : Transfert sécurisé d'ether

### Hardhat

- **getSigners()** : Comptes de test
- **getContractFactory()** : Compilation et déploiement
- **connect()** : Appeler depuis un compte spécifique
- **expect().to.be.revertedWith()** : Tester les erreurs

### Tests

- **Fixtures** : Réutiliser le setup
- **Assertions** : Vérifier les résultats
- **Scénarios** : Couvrir succès et échecs

---

## Points d'Attention

1. **Randomisation** : Non sécurisée pour production
2. **block.difficulty** : Déprécié, utiliser `prevrandao`
3. **Gas** : Optimiser pour réduire les coûts
4. **Sécurité** : Toujours auditer avant déploiement mainnet

---

## Prochaines Étapes Possibles

- [ ] Intégrer Chainlink VRF pour randomisation sécurisée
- [ ] Ajouter un système de frais pour le owner
- [ ] Interface frontend (React/Next.js)
- [ ] Déploiement sur testnet (Sepolia)
- [ ] Audit de sécurité
- [ ] Documentation utilisateur

---

Projet créé pour apprendre les smart contracts Solidity.
