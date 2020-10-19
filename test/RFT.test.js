const { time } = require("@openzeppelin/test-helpers");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");

const NFT = artifacts.require('NFT.sol');
const RFT = artifacts.require('ReFungibleNFT.sol');
const DAI = artifacts.require('DAI.sol');

const DAI_AMOUNT = web3.utils.toWei('25000');
const SHARE_AMOUNT = web3.utils.toWei('25000');

contract("RFT", async addresses => {
    const [admin, buyer1, buyer2, buyer3, buyer4, _] = addresses;

    it("ICO Should Work", async ()=> {
        //Deploy DAI and NFT Tokens
        const dai = await DAI.new();
        const nft = await NFT.new("MyNFT", "NFT");
        await nft.mint(admin, 1);
        await Promise.all([
            dai.mint(buyer1, DAI_AMOUNT),
            dai.mint(buyer2, DAI_AMOUNT),
            dai.mint(buyer3, DAI_AMOUNT),
            dai.mint(buyer4, DAI_AMOUNT),
        ]);

        //Deploy fungible NFT & Start ICO
        const rft = await RFT.new(
            "MyRFT", 
            "RFT", 
            nft.address, 
            1, 
            1, /*How much DAI we want to give as share for NFT*/
            web3.utils.toWei("100000"),
            dai.address
            );

        await nft.approve(rft.address, 1);
        await rft.startICO();
        
        //Invest in ICO
        await dai.approve(rft.address, DAI_AMOUNT, {from: buyer1});
        await rft.buyShare(SHARE_AMOUNT, {from: buyer1});

        await dai.approve(rft.address, DAI_AMOUNT, {from: buyer2});
        await rft.buyShare(SHARE_AMOUNT, {from: buyer2});

        await dai.approve(rft.address, DAI_AMOUNT, {from: buyer3});
        await rft.buyShare(SHARE_AMOUNT, {from: buyer3});

        await dai.approve(rft.address, DAI_AMOUNT, {from: buyer4});
        await rft.buyShare(SHARE_AMOUNT, {from: buyer4});

        //End ICO
        await time.increase(7 * 86400 + 1); // Test-Helpers Library helps us to increase time to test the ICO.
        await rft.withdrawProfits();

        //Check balances
        const balanceShareBuyer1 = await rft.balanceOf(buyer1);
        const balanceShareBuyer2 = await rft.balanceOf(buyer2);
        const balanceShareBuyer3 = await rft.balanceOf(buyer3);
        const balanceShareBuyer4 = await rft.balanceOf(buyer4);

        assert(balanceShareBuyer1.toString() === SHARE_AMOUNT);
        assert(balanceShareBuyer2.toString() === SHARE_AMOUNT);
        assert(balanceShareBuyer3.toString() === SHARE_AMOUNT);
        assert(balanceShareBuyer4.toString() === SHARE_AMOUNT);

        const balanceAdminDai = await dai.balanceOf(admin);
        assert(balanceAdminDai.toString() === web3.utils.toWei('100000'));
    });
});