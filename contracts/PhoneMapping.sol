// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PhoneMapping {

    mapping(address => bytes32) private phoneHashes;

    event PhoneHashMapped(address indexed user, bytes32 phoneHash);

    function savePhoneHash(bytes32 phoneHash) external {
        require(phoneHashes[msg.sender] == 0, "PhoneHash already mapped");
        phoneHashes[msg.sender] = phoneHash;
        emit PhoneHashMapped(msg.sender, phoneHash);
    }

    function isPhoneHashMapped(address user) external view returns (bool) {
        return phoneHashes[user] != 0;
    }

    function getPhoneHash(address user) external view returns (bytes32) {
        return phoneHashes[user];
    }
}