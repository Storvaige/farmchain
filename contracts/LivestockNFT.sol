// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./FarmCoin.sol";

contract LivestockNFT is ERC721, Ownable {
    using SafeERC20 for FarmCoin;

    FarmCoin public farmCoin;

    enum AnimalType { POULET, MOUTON, VACHE }
    mapping(AnimalType => uint256) public animalPrices;

    struct Animal {
        AnimalType animalType;
        uint256 lockUntil;
    }

    mapping(uint256 => Animal) public animals;
    mapping(address => uint256) public lastTransfer;
    uint256 private _nextTokenId = 1;

    constructor(address _farmCoin) 
        ERC721("LivestockNFT", "LSTK") 
        Ownable(msg.sender) 
    {
        farmCoin = FarmCoin(_farmCoin);
        animalPrices[AnimalType.POULET] = 1;
        animalPrices[AnimalType.MOUTON] = 20;
        animalPrices[AnimalType.VACHE] = 50;
    }

    // Mint gratuit d'un animal (accessible à tous)
    function mint(AnimalType _type) external {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        animals[tokenId] = Animal(_type, block.timestamp + 10 minutes);
    }

    // Brûlage gratuit (accessible au propriétaire)
    function burn(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        _burn(tokenId);
    }

    // Transfert avec paiement automatique en FarmCoins
    function transferFrom(address from, address to, uint256 tokenId) public override {
        // Vérification ownership/approbation manuelle
        address owner = ownerOf(tokenId);
        require(
            _msgSender() == owner || 
            isApprovedForAll(owner, _msgSender()) || 
            getApproved(tokenId) == _msgSender(),
            "Not approved"
        );

        require(block.timestamp >= animals[tokenId].lockUntil, "Locked");
        require(block.timestamp >= lastTransfer[from] + 5 minutes, "Cooldown");

        // Récupérer le prix fixe de l'animal
        uint256 price = animalPrices[animals[tokenId].animalType];

        // Transfert des FarmCoins de l'acheteur (to) au vendeur (from)
        farmCoin.safeTransferFrom(to, from, price);

        // Mise à jour des verrous et cooldown
        animals[tokenId].lockUntil = block.timestamp + 10 minutes;
        lastTransfer[from] = block.timestamp;

        super.transferFrom(from, to, tokenId);
    }
}