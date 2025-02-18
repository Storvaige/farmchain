// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Animal (Base Contract)
 * @dev Contrat abstrait ERC721 qui gère :
 *      - Métadonnées (name, type, value, ipfsHash, ownersHistory, etc.)
 *      - Historique des propriétaires
 */
abstract contract Animal is ERC721, Ownable {
    // Compteur pour générer les tokenId
    uint256 private _tokenIdCounter;

    // Structure des métadonnées
    struct ResourceMetadata {
        string name;               // Nom de l'animal (ou ressource)
        string resourceType;       // Type de l'animal ("Chicken", "Sheep", "Elephant", etc.)
        uint256 value;             // Valeur associée (champ libre pour votre logique)
        string ipfsHash;           // Hash IPFS (image, doc, etc.)
        address[] ownersHistory;  // Historique des propriétaires
        uint256 createdAt;         // Date de création
        uint256 lastTransferAt;    // Date du dernier transfert
    }

    // tokenId => ResourceMetadata
    mapping(uint256 => ResourceMetadata) private _tokenMetadata;

    /**
     * @dev Constructeur de l'ERC721
     */
    constructor(string memory name_, string memory symbol_)
        ERC721(name_, symbol_)
    {}

    /**
     * @dev Fonction interne pour minter un nouvel animal
     * @param to Adresse de destination
     * @param _name Nom de l'animal
     * @param _resourceType Type de l'animal ("Chicken", "Sheep", "Elephant")
     * @param _value Valeur associée
     * @param _ipfsHash Hash IPFS (pour l'image ou doc)
     */
    function _mintResource(
        address to,
        string memory _name,
        string memory _resourceType,
        uint256 _value,
        string memory _ipfsHash
    ) internal {
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        // Créer la ressource
        ResourceMetadata storage meta = _tokenMetadata[newTokenId];
        meta.name = _name;
        meta.resourceType = _resourceType;
        meta.value = _value;
        meta.ipfsHash = _ipfsHash;
        meta.createdAt = block.timestamp;
        meta.lastTransferAt = block.timestamp;

        // Historique des propriétaires : on ajoute le propriétaire actuel
        meta.ownersHistory.push(to);

        _safeMint(to, newTokenId);
    }

    /**
     * @notice Récupère les métadonnées d'un token
     * @param tokenId Id du token
     */
    function getResourceMetadata(uint256 tokenId)
        external
        view
        returns (ResourceMetadata memory)
    {
        require(_exists(tokenId), "Animal: Token does not exist"); 
        return _tokenMetadata[tokenId];
    }

    /**
     * @dev Après transfert, on met à jour l'historique du propriétaire et le lastTransferAt
     */
    function _afterTokenTransfer(
        address from,
        address to,
        uint256 startTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._afterTokenTransfer(from, to, startTokenId, batchSize);

        if (from != address(0) && to != address(0)) {
            for (uint256 i = 0; i < batchSize; i++) {
                uint256 tokenId = startTokenId + i;
                _tokenMetadata[tokenId].lastTransferAt = block.timestamp;
                _tokenMetadata[tokenId].ownersHistory.push(to);
            }
        }
    }

}
