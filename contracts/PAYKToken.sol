// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract PAYKToken is Initializable, ERC20Upgradeable, OwnableUpgradeable {

    function initialize() public initializer {
        __ERC20_init("PAYK", "PAYK");
        __Ownable_init(msg.sender);
        _mint(msg.sender, 1_000_000_000 * 10 ** decimals());
    }

    /// @notice Mint new PAYK tokens to a specified address.
    /// @param to The address to receive the minted tokens.
    /// @param amount The amount of tokens to mint (with decimals applied).
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount); // amount is already in correct decimals
    }

    /// @notice Burn PAYK tokens from the caller's balance.
    /// @param amount The amount of tokens to burn (with decimals applied).
    function burn(uint256 amount) external {
        _burn(msg.sender, amount); // burns tokens from sender's balance
    }
}