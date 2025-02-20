// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ExchangeAnimals is Ownable {
    IERC721 public chickenContract;
    IERC721 public sheepContract;
    IERC721 public elephantContract;

    mapping(uint256 => bool) public chickenLocked;
    mapping(uint256 => bool) public sheepLocked;
    mapping(uint256 => bool) public elephantLocked;

    constructor(address _chickenAddress, address _sheepAddress, address _elephantAddress) {
        chickenContract = IERC721(_chickenAddress);
        sheepContract = IERC721(_sheepAddress);
        elephantContract = IERC721(_elephantAddress);
    }

    function lockChicken(uint256 tokenId) external onlyOwner {
        chickenLocked[tokenId] = true;
    }

    function unlockChicken(uint256 tokenId) external onlyOwner {
        chickenLocked[tokenId] = false;
    }

    function lockSheep(uint256 tokenId) external onlyOwner {
        sheepLocked[tokenId] = true;
    }

    function unlockSheep(uint256 tokenId) external onlyOwner {
        sheepLocked[tokenId] = false;
    }

    function lockElephant(uint256 tokenId) external onlyOwner {
        elephantLocked[tokenId] = true;
    }

    function unlockElephant(uint256 tokenId) external onlyOwner {
        elephantLocked[tokenId] = false;
    }

    function exchangeChickenForSheep(uint256[] calldata chickenTokenIds, uint256 sheepTokenId) external {
        require(chickenTokenIds.length == 3, "You must provide exactly 3 chicken token IDs");
        require(!sheepLocked[sheepTokenId], "Sheep token is locked");

        for (uint256 i = 0; i < chickenTokenIds.length; i++) {
            require(!chickenLocked[chickenTokenIds[i]], "Chicken token is locked");
            chickenContract.transferFrom(msg.sender, address(this), chickenTokenIds[i]);
        }

        sheepContract.transferFrom(address(this), msg.sender, sheepTokenId);
    }

    function exchangeSheepForElephant(uint256[] calldata sheepTokenIds, uint256 elephantTokenId) external {
        require(sheepTokenIds.length == 3, "You must provide exactly 3 sheep token IDs");
        require(!elephantLocked[elephantTokenId], "Elephant token is locked");

        for (uint256 i = 0; i < sheepTokenIds.length; i++) {
            require(!sheepLocked[sheepTokenIds[i]], "Sheep token is locked");
            sheepContract.transferFrom(msg.sender, address(this), sheepTokenIds[i]);
        }

        elephantContract.transferFrom(address(this), msg.sender, elephantTokenId);
    }

    function withdrawTokens(address tokenContract, uint256 tokenId) external onlyOwner {
        IERC721(tokenContract).transferFrom(address(this), msg.sender, tokenId);
    }
}