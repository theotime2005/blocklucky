# 🚀 Setup & Test Guide - BlockLucky

## ✅ Configuration Complète

### 1. Contrat Déployé
- **Réseau**: Hardhat Local (Chain ID: 31337)
- **Prix Ticket**: 0.1 ETH

### 2. Variables d'Environnement
Créez un fichier `client/.env.local` en copiant `client/.env.example` :
```bash
cd client
cp .env.example .env.local
```

Puis remplissez les valeurs après avoir déployé le contrat :
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=<adresse_du_contrat_déployé>
NEXT_PUBLIC_CHAIN_ID=31337
NEXT_PUBLIC_ETHERSCAN_URL=http://localhost:8545
```

**Important** : Ne commitez jamais le fichier `.env.local` qui contient vos valeurs réelles.

### 3. Services en Cours d'Exécution
- ✅ Hardhat Node (localhost:8545)
- ✅ Frontend Next.js (http://localhost:3000)

## 🧪 Comment Tester

### Étape 1: Configurer MetaMask pour Hardhat Local

1. Ouvrez MetaMask
2. Ajoutez un réseau personnalisé :
   - **Network Name**: Hardhat Local
   - **RPC URL**: http://localhost:8545
   - **Chain ID**: 31337
   - **Currency Symbol**: ETH

3. Importez un compte de test :
   - La clé privée du premier compte Hardhat est disponible dans la console Hardhat
   - Ou utilisez : `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - Ce compte a 10000 ETH de test

### Étape 2: Tester l'Application

1. **Ouvrir l'application** : http://localhost:3000

2. **Connecter le wallet** :
   - Cliquez sur "Connect Wallet"
   - Sélectionnez MetaMask
   - Approuvez la connexion

3. **Acheter un ticket** :
   - Allez sur le Dashboard
   - Sélectionnez la quantité (1 par défaut)
   - Cliquez sur "Buy Tickets"
   - Confirmez la transaction dans MetaMask
   - Attendez la confirmation

4. **Vérifier les stats** :
   - Le jackpot devrait augmenter
   - Votre nombre de tickets devrait s'afficher
   - Les participants devraient apparaître

5. **Tirer au sort (Owner uniquement)** :
   - Si vous êtes le owner (premier compte), vous verrez le bouton "Pick Winner"
   - Cliquez dessus pour tirer au sort
   - Le gagnant recevra tout le jackpot

## 🔧 Commandes Utiles

### Redémarrer le nœud Hardhat
```bash
cd blocks
npx hardhat node
```

### Redéployer le contrat
```bash
cd blocks
npm run deploy:local
```

### Redémarrer le frontend
```bash
cd client
npm run dev
```

### Lancer les tests
```bash
cd blocks
npm test
```

## 📝 Notes Importantes

- Le nœud Hardhat doit être en cours d'exécution pour que les transactions fonctionnent
- Utilisez le premier compte Hardhat pour être le owner du contrat
- Les autres comptes peuvent acheter des tickets
- Toutes les transactions sont gratuites sur le réseau local (pas de vrai gas)

## 🎯 Prochaines Étapes pour Production

1. Déployer sur un testnet (Sepolia) :
   ```bash
   # Configurer hardhat.config.js avec Sepolia
   npx hardhat run scripts/deploy.js --network sepolia
   ```

2. Mettre à jour `.env.local` avec la nouvelle adresse du contrat déployé

3. Mettre à jour `NEXT_PUBLIC_CHAIN_ID` à `11155111` pour Sepolia dans `.env.local`

4. Tester sur le testnet avant la production

