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
        _mintResource(to, name_, "Chicken", 1, ipfsHash_);
    }
}
