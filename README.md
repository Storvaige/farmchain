# Project Farmchain

## URL du repo

```
https://github.com/Storvaige/farmchain
```

## Etapes de configuration

**Terminal 1** :
```shell
npm install
npx hardhat node
```

**Terminal 2** :

Lancer le serveur IPFS
```shell
ipfs daemon 
```

**Terminal 3** :

*Déployer*
```shell
npx hardhat run scripts/deploy.js --network localhost
```
puis remplacer deploy.js par le nom du fichier script au besoin (dans dossier scripts)

*Lancer les tests*
```shell
npx hardhat test
```