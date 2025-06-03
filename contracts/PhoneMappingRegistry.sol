// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract PhoneMappingRegistry is Ownable {
    mapping(bytes32 => address) private phoneToAddress;

    constructor(address initialOwner) Ownable(initialOwner) {}

    function setMapping(bytes32 phoneHash, address userAddress) external onlyOwner {
        address current = phoneToAddress[phoneHash];
        require(current == address(0) || msg.sender == owner(), "Mapping already set");
        phoneToAddress[phoneHash] = userAddress;
    }

    function getMapping(bytes32 phoneHash) external view returns (address) {
        return phoneToAddress[phoneHash];
    }
}