const { task } = require("hardhat/config");

require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({path:__dirname+'/.env'})
require("hardhat/config")

// dotenv
const {API_URL, MNEMONIC, HARDHAT_CONTRACT, HARDHAT_ADDRESSES} = process.env 
const {GOERLI_CONTRACT, GOERLI_ADDRESSES} = process.env 
const hardhatAddrs = HARDHAT_ADDRESSES.split("\n")
const goerliAddrs = GOERLI_ADDRESSES.split("\n")

module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: API_URL,
      accounts: {
        mnemonic: MNEMONIC
      }
    }
  }
};

// hardhat tx task
task(
  "mint-hardhat",
  "usage: npx hardhat mint-hardhat <account-index> <royalty-recipient> <royalty-fraction> --network localhost")
  .addPositionalParam("account") // account index, start from 0
  .addPositionalParam("royaltyRecipient") // account index, start from 0
  .addPositionalParam("royaltyFraction") // account index, default 1000
  .setAction(async function(taskArguments) {
    // attach to deployed contract
    const RoyaltyNFT = await hre.ethers.getContractFactory('RoyaltyNFT');
    const royaltyNFT = await RoyaltyNFT.attach(HARDHAT_CONTRACT);
    
    // mint for account
    const indexA = parseInt(taskArguments.account);
    const indexB = parseInt(taskArguments.royaltyRecipient);
    const royaltyFraction = parseInt(taskArguments.royaltyFraction);
    const txResp = await royaltyNFT.mint(hardhatAddrs[indexA], hardhatAddrs[indexB], royaltyFraction);

    // log event
    const receipt = await txResp.wait();
    const [transferEvent] = receipt.events;
    const {tokenId} = transferEvent.args;
    console.log("minted token id is:",tokenId);
  }
);

task(
  "sell",
  "usage: npx hardhat sell <account> <tokenId> <salePrice> --network localhost")
  .addPositionalParam("account")
  .addPositionalParam("tokenId")
  .addPositionalParam("salePrice")
  .setAction(async function(taskArguments) {
    const RoyaltyNFT = await hre.ethers.getContractFactory('RoyaltyNFT');
    const royaltyNFT = await RoyaltyNFT.attach(HARDHAT_CONTRACT);
    const signers = await hre.ethers.getSigners();
    
    const idx = parseInt(taskArguments.account)
    const tokenId = parseInt(taskArguments.tokenId)
    const salePrice = hre.ethers.BigNumber.from(taskArguments.salePrice)

    // sell
    const royaltyNFTX = await royaltyNFT.connect(signers[idx])
    const txResp = await royaltyNFTX.sell(tokenId, salePrice)

    // log
    const receipt = await txResp.wait()
    console.log(receipt)    

  }
)


task(
  "buy",
  "usage: npx hardhat buy <account> <tokenId> <value> --network localhost")
  .addPositionalParam("account")
  .addPositionalParam("tokenId")
  .addPositionalParam("value")
  .setAction(async function(taskArguments) {
    // attach to deployed contract
    const RoyaltyNFT = await hre.ethers.getContractFactory('RoyaltyNFT');
    const royaltyNFT = await RoyaltyNFT.attach(HARDHAT_CONTRACT);
    const signers = await hre.ethers.getSigners();
        
    const idx = parseInt(taskArguments.account)
    const tokenId = parseInt(taskArguments.tokenId)
    const value = taskArguments.value
        
    // buy
    const royaltyNFTX = await royaltyNFT.connect(signers[idx])
    const txResp = await royaltyNFTX.buy(tokenId, {value: value})

    // log
    const receipt = await txResp.wait()
    console.log(receipt)
  }
)


// hardhat query task
task(
  "query-sale-info",
  "usage: npx hardhat query-sale-info <token-id> --network localhost")
  .addPositionalParam("tokenId").
  setAction(async function(taskArguments){
    const RoyaltyNFT = await hre.ethers.getContractFactory('RoyaltyNFT');
    const royaltyNFT = await RoyaltyNFT.attach(HARDHAT_CONTRACT);
    
    const tokenId = parseInt(taskArguments.tokenId)
    const info = await royaltyNFT.getSaleInfo(tokenId)
    console.log(info)
  }
)

task(
  "query-user-balance",
  "usage: npx hardhat query-user-balance <account-index> --network localhost")
  .addPositionalParam("account")
  .setAction(async function(taskArguments) {
    const provider = await hre.ethers.provider
    const signers = await hre.ethers.getSigners();

    const idx = parseInt(taskArguments.account)

    // balance
    const balance = await provider.getBalance(signers[idx].getAddress())
    console.log(balance)
  }
)

task(
  "query-nft-balance",
  "query nft balance of an address")
  .addPositionalParam("account")
  .setAction(async function(taskArguments) {
    // attach to deployed contract
    const RoyaltyNFT = await hre.ethers.getContractFactory('RoyaltyNFT');
    //const royaltyNFT = await RoyaltyNFT.attach(HARDHAT_CONTRACT);
    const royaltyNFT = await RoyaltyNFT.attach(GOERLI_CONTRACT);
    // query balance
    const index = parseInt(taskArguments.account);
    const balances = await royaltyNFT.balanceOf(goerliAddrs[index]);

    // log 
    console.log(balances)
  }
)

task(
  "query-nft-name",
  "usage: npx hardhat query-nft-name --network localhost")
  .setAction(async function() {
    const RoyaltyNFT = await hre.ethers.getContractFactory('RoyaltyNFT');
    const royaltyNFT = await RoyaltyNFT.attach(HARDHAT_CONTRACT);
    const name = await royaltyNFT.name();
    console.log(name)
  }
)

task(
  "query-nft-user",
  "usage: npx hardhat query-nft-user --network localhost")
  .addPositionalParam("tokenId")
  .setAction(async function(taskArguments) {
    const tokenId = parseInt(taskArguments.tokenId)

    const RoyaltyNFT = await hre.ethers.getContractFactory('RoyaltyNFT');
    const royaltyNFT = await RoyaltyNFT.attach(HARDHAT_CONTRACT);
    const address = await royaltyNFT.userOf(tokenId)
    
    console.log(address)
  }
)