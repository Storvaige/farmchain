// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ResourceRegistry.sol";

contract FarmCoin is ERC20, Ownable {
    ResourceRegistry public resourceRegistry;

    constructor() ERC20("FarmCoin", "FARM") Ownable(msg.sender) {}

    // On travaille en unités entières (pas de décimales)
    function decimals() public pure override returns (uint8) {
        return 0;
    }

    // Setter pour le ResourceRegistry
    function setResourceRegistry(address _registry) external onlyOwner {
        resourceRegistry = ResourceRegistry(_registry);
    }

    // Mint avec mise à jour du ResourceRegistry
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        if (address(resourceRegistry) != address(0)) {
            resourceRegistry.registerResource(
                "FarmCoin Mint",  // Nom de l'opération
                "mint",           // Type d'opération
                amount,           // Valeur en FarmCoin
                "",               // IPFS hash (vide ici)
                to                // Adresse du bénéficiaire
            );
        }
    }

    // Fonction wrapper pour transfer qui enregistre l'opération dans le ResourceRegistry
    function transferWithRegistry(address to, uint256 amount) external returns (bool) {
        bool success = transfer(to, amount);
        if (success && address(resourceRegistry) != address(0)) {
            resourceRegistry.registerResource(
                "FarmCoin Transfer",
                "transfer",
                amount,
                "",
                msg.sender
            );
        }
        return success;
    }
}
