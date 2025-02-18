# Project Farmchain

Etapes de configuration

Terminal 1 :
```shell
npm install
npx hardhat node
```


Terminal 2 :
```shell
npx hardhat run scripts/deploy.js --network localhost
```
puis remplacer deploy.js par le nom du fichier script au besoin (dans dossier scripts)

Lancer les tests unitaires
```shell
    npx hardhat test
```