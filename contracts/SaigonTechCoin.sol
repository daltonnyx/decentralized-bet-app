// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract SaigonTechCoin is ERC20, AccessControl {
    uint tokenPrice = 1 gwei;
    address tokenSeller;

    constructor(address defaultAdmin) ERC20("Saigon Tech Coin", "STC") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
    }

    function mint(address to, uint amount) public onlyRole(DEFAULT_ADMIN_ROLE) {
        _mint(to, amount);
    }

    function decimals() public pure override returns (uint8) {
        return 0;
    }

    function TopUp() public payable {
        require(msg.value >= tokenPrice, "Not enough money to buy");
        uint tokenToTransfer = msg.value / tokenPrice;
        uint remainderWei = msg.value - tokenToTransfer * tokenPrice;
        _mint(msg.sender, tokenToTransfer);
        payable(msg.sender).transfer(remainderWei);
    }

    function Withdraw(uint value) public payable {
        require(value <= balanceOf(msg.sender), "Not enough token");
        uint withdrawWei = (value * tokenPrice * 98) / 100;
        _burn(msg.sender, value);
        payable(msg.sender).transfer(withdrawWei);
    }
}
