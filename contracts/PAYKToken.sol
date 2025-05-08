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

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount); // <-- важливо! amount уже в правильній точності
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount); // <-- важливо! без додаткового множення
    }
}