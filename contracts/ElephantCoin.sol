// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ChickenCoin.sol";
import "./ResourceRegistry.sol";

contract ElephantCoin is ERC20, Ownable {
    ChickenCoin public chickenCoin;
    ResourceRegistry public resourceRegistry;
    uint256 public constant CHICKEN_PER_ELEPHANT = 1000; // 1 ElephantCoin = 1000 ChickenCoins

    constructor(address _chickenCoin) ERC20("ElephantCoin", "ELEPHANT") Ownable(msg.sender) {
        chickenCoin = ChickenCoin(_chickenCoin);
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function setResourceRegistry(address _registry) external onlyOwner {
        resourceRegistry = ResourceRegistry(_registry);
    }

    // Conversion : mint d'ElephantCoins en échange de ChickenCoins
    function mintElephant(uint256 elephantAmount) external {
        uint256 requiredChicken = elephantAmount * CHICKEN_PER_ELEPHANT;
        require(chickenCoin.transferFrom(msg.sender, address(this), requiredChicken), "Transfert de ChickenCoin echoue");
        _mint(msg.sender, elephantAmount);
        if (address(resourceRegistry) != address(0)) {
            resourceRegistry.registerResource(
                "ElephantCoin Conversion",
                "mint",
                elephantAmount,
                "",
                msg.sender
            );
        }
    }

    // Fonction wrapper pour transfer
    function transferWithRegistry(address to, uint256 amount) external returns (bool) {
        bool success = transfer(to, amount);
        if (success && address(resourceRegistry) != address(0)) {
            resourceRegistry.registerResource(
                "ElephantCoin Transfer",
                "transfer",
                amount,
                "",
                msg.sender
            );
        }
        return success;
    }

    function redeemElephant(uint256 elephantAmount) external {
        require(balanceOf(msg.sender) >= elephantAmount, "Solde insuffisant en ElephantCoin");
        uint256 chickenAmount = elephantAmount * CHICKEN_PER_ELEPHANT;
        _burn(msg.sender, elephantAmount);
        require(chickenCoin.transfer(msg.sender, chickenAmount), "Transfert de ChickenCoin echoue");
        if (address(resourceRegistry) != address(0)) {
            resourceRegistry.registerResource(
                "ElephantCoin Redemption",
                "redeem",
                elephantAmount,
                "",
                msg.sender
            );
        }
    }
}
