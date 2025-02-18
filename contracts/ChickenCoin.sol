// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./FarmCoin.sol";
import "./ResourceRegistry.sol";

contract ChickenCoin is ERC20, Ownable {
    FarmCoin public farmCoin;
    ResourceRegistry public resourceRegistry;
    uint256 public constant FARM_PER_CHICKEN = 1000; // 1 ChickenCoin = 1000 FarmCoins

    constructor(address _farmCoin) ERC20("ChickenCoin", "CHICKEN") Ownable(msg.sender) {
        farmCoin = FarmCoin(_farmCoin);
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function setResourceRegistry(address _registry) external onlyOwner {
        resourceRegistry = ResourceRegistry(_registry);
    }

    // Conversion : mint des ChickenCoins en échange de FarmCoins
    function mintChicken(uint256 chickenAmount) external {
        uint256 requiredFarm = chickenAmount * FARM_PER_CHICKEN;
        require(
            farmCoin.transferFrom(msg.sender, address(this), requiredFarm),
            unicode"Transfert de FarmCoin échoue"
        );
        _mint(msg.sender, chickenAmount);
        if (address(resourceRegistry) != address(0)) {
            resourceRegistry.registerResource(
                "ChickenCoin Conversion",
                "mint",
                chickenAmount,
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
                "ChickenCoin Transfer",
                "transfer",
                amount,
                "",
                msg.sender
            );
        }
        return success;
    }

    function redeemChicken(uint256 chickenAmount) external {
        require(balanceOf(msg.sender) >= chickenAmount, "Solde insuffisant en ChickenCoin");
        uint256 farmAmount = chickenAmount * FARM_PER_CHICKEN;
        _burn(msg.sender, chickenAmount);
        require(farmCoin.transfer(msg.sender, farmAmount), "Transfert de FarmCoin echoue");
        if (address(resourceRegistry) != address(0)) {
            resourceRegistry.registerResource(
                "ChickenCoin Redemption",
                "redeem",
                chickenAmount,
                "",
                msg.sender
            );
        }
    }
}
