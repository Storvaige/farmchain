// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract Animal is ERC721, Ownable {
    uint256 public constant MAX_TOKENS_PER_OWNER = 10;
    uint256 public constant TRANSFER_COOLDOWN = 300;    // 5 minutes
    uint256 public constant ACQUISITION_LOCK = 600;     // 10 minutes

    uint256 public constant CHICKEN_VALUE = 1;
    uint256 public constant SHEEP_VALUE = 3;
    uint256 public constant ELEPHANT_VALUE = 9;

    // Token counter
    uint256 private _tokenIdCounter;

    // Mapping to track the last transfer time for cooldown
    mapping(address => uint256) public lastTransferTimestamp;

    // Special exchange address that can bypass cooldown and lock restrictions
    address public exchangeAddress;

    // Function to set the exchange address (only owner can call)
    function setExchangeAddress(address _exchange) external onlyOwner {
        exchangeAddress = _exchange;
    }

    // (Optional) For testing: a toggle to disable restrictions (if desired)
    bool public unlockRestrictions;
    function toggleUnlockRestrictions() external onlyOwner {
        unlockRestrictions = !unlockRestrictions;
    }

    // Structure for token metadata
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
    mapping(uint256 => ResourceMetadata) private _tokenMetadata;

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) {}

    // Internal mint function
    function _mintResource(
        address to,
        string memory _name,
        string memory _resourceType,
        uint256 _value,
        string memory _ipfsHash
    ) internal {
        require(balanceOf(to) < MAX_TOKENS_PER_OWNER, "Animal: receiver already has max tokens");

        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        ResourceMetadata storage meta = _tokenMetadata[newTokenId];
        meta.name = _name;
        meta.resourceType = _resourceType;
        meta.value = _value;
        meta.ipfsHash = _ipfsHash;
        meta.createdAt = block.timestamp;
        meta.lastTransferAt = block.timestamp;
        meta.ownersHistory.push(to);
        meta.lockedUntil = block.timestamp + ACQUISITION_LOCK;

        _safeMint(to, newTokenId);
    }

    // Public getter for metadata
    function getResourceMetadata(uint256 tokenId)
        external
        view
        returns (ResourceMetadata memory)
    {
        require(ownerOf(tokenId) != address(0), "Animal: Token does not exist");
        return _tokenMetadata[tokenId];
    }

    // _beforeTokenTransfer and _afterTokenTransfer implementations that enforce cooldown/lock
    // (Include your existing logic here, making sure to check if msg.sender == exchangeAddress to bypass restrictions)
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 startTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._beforeTokenTransfer(from, to, startTokenId, batchSize);
        if (from == address(0) || to == address(0)) return;
        require(balanceOf(to) < MAX_TOKENS_PER_OWNER, "Animal: receiver already has max tokens");

        if (!unlockRestrictions && msg.sender != exchangeAddress) {
            require(
                block.timestamp >= lastTransferTimestamp[from] + TRANSFER_COOLDOWN,
                "Animal: transfer cooldown not finished"
            );
            for (uint256 i = 0; i < batchSize; i++) {
                uint256 tokenId = startTokenId + i;
                ResourceMetadata storage meta = _tokenMetadata[tokenId];
                require(block.timestamp >= meta.lockedUntil, "Animal: token is locked after acquisition");
            }
        }
    }

    function _afterTokenTransfer(
        address from,
        address to,
        uint256 startTokenId,
        uint256 batchSize
    ) internal virtual override {
        super._afterTokenTransfer(from, to, startTokenId, batchSize);
        if (from == address(0) || to == address(0)) return;
        for (uint256 i = 0; i < batchSize; i++) {
            uint256 tokenId = startTokenId + i;
            _tokenMetadata[tokenId].lastTransferAt = block.timestamp;
            _tokenMetadata[tokenId].ownersHistory.push(to);
            _tokenMetadata[tokenId].lockedUntil = block.timestamp + ACQUISITION_LOCK;
        }
        if (!unlockRestrictions && msg.sender != exchangeAddress) {
            lastTransferTimestamp[from] = block.timestamp;
        }
    }
}
