// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Animal.sol";

/**
 * @title Sheep
 * @dev Contrat ERC721 pour reprÃ©senter un Sheep
 */
contract Sheep is Animal {
    constructor() Animal("Sheep", "SHEEP") {}

    function mintSheep(
        address to,
        string memory name_,
        string memory ipfsHash_
    ) external onlyOwner {
        _mintResource(to, name_, "Sheep", SHEEP_VALUE, ipfsHash_);
    }
}