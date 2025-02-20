// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Animal.sol";

/**
 * @title Chicken
 * @dev Contrat ERC721 pour représenter un Chicken
 */
contract Chicken is Animal {
    constructor() Animal("Chicken", "CHKN") {}

    /**
     * @notice Mint d'un nouveau Chicken
     * @param to Adresse de réception
     * @param name_ Nom du Chicken
     * @param ipfsHash_ Hash IPFS (image, doc, etc.)
     */
    function mintChicken(
        address to,
        string memory name_,
        string memory ipfsHash_
    ) external onlyOwner {
        _mintResource(to, name_, "Chicken", CHICKEN_VALUE, ipfsHash_);
    }

    /**
     * @notice Brûler un Chicken existant
     * @param tokenId ID du token à brûler
     */
    function burnResource(uint256 tokenId) external {
        // Vérifier que l'appelant est le propriétaire ou approuvé
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Chicken: caller is not owner nor approved");
        _burnResource(tokenId);
    }
}