// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract ResourceRegistry {
    struct ResourceMetadata {
        string name;
        string resourceType; // "type" est un mot réservé, on utilise resourceType
        uint256 value; // Valeur associée à la ressource
        string ipfsHash; // Hash IPFS du document lié
        address[] previousOwners;
        uint256 createdAt;
        uint256 lastTransferAt;
    }
    
    uint256 public nextResourceId;
    mapping(uint256 => ResourceMetadata) public resources;
    
    event ResourceRegistered(uint256 resourceId, string name);
    event ResourceUpdated(uint256 resourceId, string name);

    // Enregistre une nouvelle ressource avec ses métadonnées
    function registerResource(
        string memory name,
        string memory resourceType,
        uint256 value,
        string memory ipfsHash,
        address initialOwner
    ) public returns (uint256) {
        ResourceMetadata storage resource = resources[nextResourceId];
        resource.name = name;
        resource.resourceType = resourceType;
        resource.value = value;
        resource.ipfsHash = ipfsHash;
        resource.previousOwners.push(initialOwner);
        resource.createdAt = block.timestamp;
        resource.lastTransferAt = block.timestamp;

        emit ResourceRegistered(nextResourceId, name);
        nextResourceId++;
        return nextResourceId - 1;
    }

    // Met à jour les informations lors d'un transfert de ressource
    function updateTransfer(uint256 resourceId, address newOwner) public {
        ResourceMetadata storage resource = resources[resourceId];
        resource.previousOwners.push(newOwner);
        resource.lastTransferAt = block.timestamp;
        emit ResourceUpdated(resourceId, resource.name);
    }

    // Récupère les métadonnées d'une ressource
    function getResource(uint256 resourceId) public view returns (ResourceMetadata memory) {
        return resources[resourceId];
    }
}
