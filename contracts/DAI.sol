// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract DAI is ERC20 {
    constructor() ERC20("DAI Stablecoin", "DAI") {

    }
    
    function mint(address account, uint amount) external {
        _mint(account, amount);
    }
}