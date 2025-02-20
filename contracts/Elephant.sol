// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Animal.sol";

/**
 * @title Elephant
 * @dev Contrat ERC721 pour reprÃ©senter un Elephant
 */
contract Elephant is Animal {
    constructor() Animal("Elephant", "ELPH") {}

    function mintElephant(
        address to,
        string memory name_,
        string memory ipfsHash_
    ) external onlyOwner {
        _mintResource(to, name_, "Elephant", ELEPHANT_VALUE, ipfsHash_);
    }

    /**
     * @notice Brûler un Elephant existant
     * @param tokenId ID du token à brûler
     */
    function burnResource(uint256 tokenId) external {
        // Vérifier que l'appelant est le propriétaire ou approuvé
        require(_isApprovedOrOwner(_msgSender(), tokenId), "Elephant: caller is not owner nor approved");
        _burnResource(tokenId);
    }
}