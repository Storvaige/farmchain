// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @dev Interfaces simplifiées pour invoquer les sous-contrats
 */
interface IChicken {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

interface ISheep {
    function ownerOf(uint256 tokenId) external view returns (address);
    function transferFrom(address from, address to, uint256 tokenId) external;
    function mintSheep(address to, string memory name_, string memory ipfsHash_, uint256 value_) external;
}

interface IElephant {
    function mintElephant(address to, string memory name_, string memory ipfsHash_, uint256 value_) external;
}

contract ExchangeAnimals {
    address public chicken;
    address public sheep;
    address public elephant;

    constructor(address _chicken, address _sheep, address _elephant) {
        chicken = _chicken;
        sheep = _sheep;
        elephant = _elephant;
    }

    /**
     * @dev Convertir 10 Chicken en 1 Sheep
     */
    function convertChickenToSheep(
        uint256[] calldata chickenTokenIds,
        string memory sheepName,
        string memory ipfsHash,
        uint256 sheepValue
    ) external {
        require(chickenTokenIds.length == 10, "Need exactly 10 Chicken tokens");

        IChicken chickenContract = IChicken(chicken);

        // Transfert des 10 Chicken tokens vers ce contrat
        for (uint256 i = 0; i < chickenTokenIds.length; i++) {
            require(chickenContract.ownerOf(chickenTokenIds[i]) == msg.sender, "Not owner of these Chicken tokens");
            chickenContract.transferFrom(msg.sender, address(this), chickenTokenIds[i]);
        }

        // Mint 1 Sheep
        ISheep sheepContract = ISheep(sheep);
        sheepContract.mintSheep(msg.sender, sheepName, ipfsHash, sheepValue);
    }

    /**
     * @dev Convertir 10 Sheep en 1 Elephant
     */
    function convertSheepToElephant(
        uint256[] calldata sheepTokenIds,
        string memory elephantName,
        string memory ipfsHash,
        uint256 elephantValue
    ) external {
        require(sheepTokenIds.length == 10, "Need exactly 10 Sheep tokens");

        ISheep sheepContract = ISheep(sheep);

        // Transfert des 10 Sheep tokens vers ce contrat
        for (uint256 i = 0; i < sheepTokenIds.length; i++) {
            require(sheepContract.ownerOf(sheepTokenIds[i]) == msg.sender, "Not owner of these Sheep tokens");
            sheepContract.transferFrom(msg.sender, address(this), sheepTokenIds[i]);
        }

        // Mint 1 Elephant
        IElephant elephantContract = IElephant(elephant);
        elephantContract.mintElephant(msg.sender, elephantName, ipfsHash, elephantValue);
    }
}
