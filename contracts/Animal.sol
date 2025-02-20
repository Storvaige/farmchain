// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Animal (Base Contract)
 * @dev Contrat ERC721 avec :
 *      - Limite de possession (10 tokens par utilisateur, par type/contrat)
 *      - Cooldown de 5 minutes entre deux transferts pour le même sender
 *      - Lock de 10 minutes après acquisition, empêchant un re-transfert immédiat
 */
abstract contract Animal is ERC721, Ownable {
    // CONSTANTES
    uint256 public constant MAX_TOKENS_PER_OWNER = 10;
    uint256 public constant TRANSFER_COOLDOWN = 300;    // 5 minutes
    uint256 public constant ACQUISITION_LOCK = 600;     // 10 minutes

    uint256 public constant CHICKEN_VALUE = 1;
    uint256 public constant SHEEP_VALUE = 3;
    uint256 public constant ELEPHANT_VALUE = 9;

    // Compteur d'ID pour la génération des tokens
    uint256 private _tokenIdCounter;

    // lastTransferTimestamp[sender] => timestamp du dernier transfert, pour le cooldown
    mapping(address => uint256) public lastTransferTimestamp;

    // Structure des métadonnées
    struct ResourceMetadata {
        string name;               // Nom de l'animal
        string resourceType;       // Type ("Chicken", "Sheep", "Elephant", ...)
        string ipfsHash;           // Hash IPFS
        uint256 value;             // Valeur associée (optionnelle)
        address[] ownersHistory;   // Historique des propriétaires
        uint256 createdAt;         // Date de création du token
        uint256 lastTransferAt;    // Dernier transfert
        uint256 lockedUntil;       // Le token est "locké" jusqu'à ce timestamp
    }

    // tokenId => ResourceMetadata
    mapping(uint256 => ResourceMetadata) private _tokenMetadata;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    /**
     * @dev Fonction interne pour minter un nouvel animal
     * @param to Adresse de destination
     * @param _name Nom de l'animal
     * @param _resourceType Type ("Chicken", "Sheep", "Elephant", etc.)
     * @param _value Valeur associée (optionnelle)
     * @param _ipfsHash Hash IPFS
     */
    function _mintResource(
        address to,
        string memory _name,
        string memory _resourceType,
        uint256 _value,
        string memory _ipfsHash
    ) internal {
        // -- Vérifier la limite de possession : 10 tokens max pour ce contrat --
        require(
            balanceOf(to) < MAX_TOKENS_PER_OWNER,
            "Animal: receiver already has 10 tokens of this type"
        );

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        // Remplir la structure
        ResourceMetadata storage meta = _tokenMetadata[newTokenId];
        meta.name = _name;
        meta.resourceType = _resourceType;
        meta.value = _value;
        meta.ipfsHash = _ipfsHash;
        meta.createdAt = block.timestamp;
        meta.lastTransferAt = block.timestamp;
        meta.ownersHistory.push(to);

        // Lock de 10 minutes après la mint
        meta.lockedUntil = block.timestamp + ACQUISITION_LOCK;

        _safeMint(to, newTokenId);
    }

    /**
     * @dev Fonction interne pour brûler un token existant
     * @param tokenId ID du token à brûler
     */
    function _burnResource(uint256 tokenId) internal {
        // Vérifier que le token existe
        require(_exists(tokenId), "Animal: Token does not exist");

        // Supprimer les métadonnées associées
        delete _tokenMetadata[tokenId];

        // Brûler le token
        _burn(tokenId);
    }

    /**
     * @notice Récupère les métadonnées d'un token
     */
    function getResourceMetadata(uint256 tokenId)
        external
        view
        returns (ResourceMetadata memory)
    {
        // Sur OZ 5.x, on fait ownerOf(tokenId) pour s'assurer qu'il existe,
        // ou on implémente un check custom
        require(ownerOf(tokenId) != address(0), "Animal: Token does not exist");
        return _tokenMetadata[tokenId];
    }

    // ===========================================================
    // =          LOGIQUE DE TRANSFERT ET CONTRAINTES            =
    // ===========================================================

    /**
     * @dev Hook "beforeTokenTransfer" (OZ 5.x) avec 4 paramètres :
     *      (address from, address to, uint256 startTokenId, uint256 batchSize)
     *      Ici, on applique :
     *        - La limite de possession : 10
     *        - Le cooldown : 5 min après la dernière TX du from
     *        - Vérification que le token n'est plus lock
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 startTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, startTokenId, batchSize);

        // Mint (from == address(0)) ou Burn (to == address(0)) => pas de check
        if (from == address(0) || to == address(0)) {
            return;
        }

        // Pour chaque token transféré (dans un batch)
        for (uint256 i = 0; i < batchSize; i++) {
            uint256 tokenId = startTokenId + i;

            // (1) Vérifier la limite de possession pour le "to"
            require(
                balanceOf(to) < MAX_TOKENS_PER_OWNER,
                "Animal: receiver has 10 tokens already"
            );

            // (2) Vérifier le cooldown pour le "from"
            uint256 lastTx = lastTransferTimestamp[from];
            require(
                block.timestamp >= lastTx + TRANSFER_COOLDOWN,
                "Animal: transfer cooldown not finished"
            );

            // (3) Vérifier que le token n'est pas lock (10 min)
            ResourceMetadata storage meta = _tokenMetadata[tokenId];
            require(
                block.timestamp >= meta.lockedUntil,
                "Animal: token is locked after acquisition"
            );
        }
    }

    /**
     * @dev Hook "afterTokenTransfer"
     *      - On met à jour lastTransferAt, ownersHistory, lockedUntil
     *      - On met à jour lastTransferTimestamp[from] = block.timestamp (cooldown)
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 startTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._afterTokenTransfer(from, to, startTokenId, batchSize);

        // Ignorer si mint ou burn
        if (from == address(0) || to == address(0)) {
            return;
        }

        for (uint256 i = 0; i < batchSize; i++) {
            uint256 tokenId = startTokenId + i;

            // (1) Mettre à jour lastTransferAt
            _tokenMetadata[tokenId].lastTransferAt = block.timestamp;

            // (2) Ajouter le nouveau owner dans ownersHistory
            _tokenMetadata[tokenId].ownersHistory.push(to);

            // (3) Lock pour 10 minutes
            _tokenMetadata[tokenId].lockedUntil = block.timestamp + ACQUISITION_LOCK;
        }

        // (4) Mettre à jour le cooldown pour le "from"
        lastTransferTimestamp[from] = block.timestamp;
    }
}