// SPDX-License-Identifier: MIT
pragma solidity 0.7.0;

import '@openzeppelin/contracts/token/ERC721/IERC721.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract ReFungibleNFT is ERC20 {
    
    uint public icoSharePrice;
    uint public icoShareSupply;
    uint public icoEnd;

    uint public nftId;
    IERC721 public nft;
    IERC20 public dai;

    address public admin;

    constructor(
            string memory _name, 
            string memory _symbol, 
            address _nftAddress, 
            uint _nftId, 
            uint _icoSharePrice, 
            uint _icoShareSupply, 
            address _daiAddress
        ) 
        ERC20(_name, _symbol) 
        {
            nftId = _nftId;
            nft = IERC721(_nftAddress);
            icoShareSupply = _icoShareSupply;
            icoSharePrice = _icoSharePrice;
            dai = IERC20(_daiAddress);
            admin = msg.sender;
        }

        function startICO() external {
            require(msg.sender == admin, "Sorry! Only Admin is allowed to start ICO");
            nft.transferFrom(msg.sender, address(this), nftId);
            icoEnd = block.timestamp + 7 * 86400;
        }

        function buyShare(uint shareAmount) external {
            require(icoEnd > 0, "ICO not started yet.");
            require(block.timestamp <= icoEnd, "ICO not started yet.");
            require(totalSupply() + shareAmount <= icoShareSupply, "Not enough shares available.");
            uint daiAmount = shareAmount * icoSharePrice;
            dai.transferFrom(msg.sender, address(this), daiAmount);
            _mint(msg.sender, shareAmount);
        }

        function withdrawProfits() external {
            require(msg.sender == admin, "Sorry! Only Admin can withdraw funds.");
            require(block.timestamp > icoEnd, "ICO is not finished yet.");
            
            uint daiBalance = dai.balanceOf(address(this));
            if(daiBalance > 0) {
                dai.transfer(admin, daiBalance);
            }

            uint unsoldSharesBalance = icoShareSupply - totalSupply();
            if(unsoldSharesBalance > 0) {
                dai.transfer(admin, daiBalance);
            }
        }
}