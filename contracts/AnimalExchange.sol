// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IAnimal {
    struct ResourceMetadata {
        string name;
        string resourceType;
        string ipfsHash;
        uint256 value;
        address[] ownersHistory;
        uint256 createdAt;
        uint256 lastTransferAt;
        uint256 lockedUntil;
    }
    
    function ownerOf(uint256 tokenId) external view returns (address);
    function getResourceMetadata(uint256 tokenId) external view returns (ResourceMetadata memory);
    function transferFrom(address from, address to, uint256 tokenId) external;
}

contract AnimalExchange {
    /**
     * @notice Exchange multiple tokens from one contract for multiple tokens from another.
     *         The total value of tokens on side A must equal the total value on side B.
     *         For example, exchanging 3 chickens (value = 1 each) for 1 sheep (value = 3).
     * @dev All tokens on each side must be owned by the same address.
     */
    function exchangeMultipleForMultiple(
        address contractA,
        uint256[] calldata tokenIdsA,
        address contractB,
        uint256[] calldata tokenIdsB
    ) external {
        require(tokenIdsA.length > 0, "Need tokens from side A");
        require(tokenIdsB.length > 0, "Need tokens from side B");

        IAnimal a = IAnimal(contractA);
        IAnimal b = IAnimal(contractB);

        // Determine owner and sum values for side A
        address ownerA = a.ownerOf(tokenIdsA[0]);
        uint256 sumA = 0;
        for (uint256 i = 0; i < tokenIdsA.length; i++) {
            require(a.ownerOf(tokenIdsA[i]) == ownerA, "All side A tokens must have same owner");
            IAnimal.ResourceMetadata memory metaA = a.getResourceMetadata(tokenIdsA[i]);
            sumA += metaA.value;
        }

        // Determine owner and sum values for side B
        address ownerB = b.ownerOf(tokenIdsB[0]);
        uint256 sumB = 0;
        for (uint256 i = 0; i < tokenIdsB.length; i++) {
            require(b.ownerOf(tokenIdsB[i]) == ownerB, "All side B tokens must have same owner");
            IAnimal.ResourceMetadata memory metaB = b.getResourceMetadata(tokenIdsB[i]);
            sumB += metaB.value;
        }

        require(ownerA != ownerB, "Cannot exchange tokens with yourself");
        require(sumA == sumB, "Total values do not match");

        // Perform the exchange transfers.
        // Note: Because the exchange contract is calling transferFrom,
        // if your Animal contracts have setExchangeAddress(exchangeAddress),
        // then the lock and cooldown checks are bypassed.
        for (uint256 i = 0; i < tokenIdsA.length; i++) {
            a.transferFrom(ownerA, ownerB, tokenIdsA[i]);
        }
        for (uint256 i = 0; i < tokenIdsB.length; i++) {
            b.transferFrom(ownerB, ownerA, tokenIdsB[i]);
        }
    }
}
