// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Animal.sol";

/**
 * @title Elephant
 * @dev Contrat ERC721 pour représenter un Elephant
 */
contract Elephant is Animal {
    constructor() Animal("Elephant", "ELPH") {}

    function mintElephant(
        address to,
        string memory name_,
        string memory ipfsHash_
    ) external onlyOwner {
        _mintResource(to, name_, "Elephant", 6, ipfsHash_);
    }
}
