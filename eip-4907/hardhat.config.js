const { task } = require("hardhat/config");

require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config({path:__dirname+'/.env'})
require("hardhat/config")

// dotenv
const {API_URL, MNEMONIC, HARDHAT_CONTRACT, HARDHAT_ADDRESSES} = process.env 
const hardhatAddrs = HARDHAT_ADDRESSES.split("\n")

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
  "usage: npx hardhat mint-hardhat <account-index> --network localhost")
  .addPositionalParam("account") // account index, start from 0
  .setAction(async function(taskArguments) {
    // attach to deployed contract
    const RentableNFT = await hre.ethers.getContractFactory('RentableNFT');
    const rentableNFT = await RentableNFT.attach(HARDHAT_CONTRACT);
    
    // mint for account
    const index = parseInt(taskArguments.account);
    const txResp = await rentableNFT.mint(hardhatAddrs[index]);

    // log event
    const receipt = await txResp.wait();
    const [transferEvent] = receipt.events;
    const {tokenId} = transferEvent.args;
    console.log("minted token id is:",tokenId);
  }
);

task(
  "lease",
  "usage: npx hardhat lease <account-idx> <nftId> <fee> --network localhost")
  .addPositionalParam("account")
  .addPositionalParam("nftId")
  .addPositionalParam("fee")
  .setAction(async function(taskArguments) {
    // attach to deployed contract
    const RentableNFT = await hre.ethers.getContractFactory('RentableNFT');
    const rentableNFT = await RentableNFT.attach(HARDHAT_CONTRACT);
    const signers = await hre.ethers.getSigners();

    const idx = parseInt(taskArguments.account)
    const nftId = parseInt(taskArguments.nftId)
    const fee = parseInt(taskArguments.fee)

    // lease
    const rentableNFTX = await rentableNFT.connect(signers[idx]) // connect signer
    const txResp = await rentableNFTX.lease(nftId, fee, true)
    
    // log event
    const receipt = await txResp.wait();
    const [approveEvent, leaseEvent] = receipt.events;
    const {tokenId, feePerMinute, rentable} = leaseEvent.args; 
    console.log(tokenId, feePerMinute, rentable);
  }
);
  
task(
  "rent",
  "usage: npx hardhat rent <account> <nftid> <expires>")
  .addPositionalParam("account")
  .addPositionalParam("nftId")
  .addPositionalParam("expires")
  .setAction(async function(taskArguments) {
    // attach to deployed contract
    const RentableNFT = await hre.ethers.getContractFactory('RentableNFT');
    const rentableNFT = await RentableNFT.attach(HARDHAT_CONTRACT);
    const signers = await hre.ethers.getSigners();

    const idx = parseInt(taskArguments.account)
    const nftId = parseInt(taskArguments.nftId)
    const expires = parseInt(taskArguments.expires)

    // rent
    const rentableNFTX = await rentableNFT.connect(signers[idx])
    const txResp = await rentableNFTX.rent(nftId, expires, {value: "100"})
    
    // log event
    const receipt = await txResp.wait();
    console.log(receipt);
  }
)

// hardhat query task
task(
  "get-accounts",
  "get related accounts in network",
  async function() {
    const signers = await hre.ethers.getSigners();

    for (const signer of signers) {
        console.log(signer.address);
    }
  }
);

task(
  "query-nft-balance",
  "query nft balance of an address")
  .addPositionalParam("account")
  .setAction(async function(taskArguments) {
    // attach to deployed contract
    const RentableNFT = await hre.ethers.getContractFactory('RentableNFT');
    const rentableNFT = await RentableNFT.attach(HARDHAT_CONTRACT);

    // query balance
    const index = parseInt(taskArguments.account);
    console.log(hardhatAddrs[index])
    const balances = await rentableNFT.balanceOf(hardhatAddrs[index]);

    // log 
    console.log(balances)
  }
)

task(
  "query-nft-name",
  "usage: npx hardhat query-nft-name --network localhost")
  .setAction(async function() {
    const RentableNFT = await hre.ethers.getContractFactory('RentableNFT');
    const rentableNFT = await RentableNFT.attach(HARDHAT_CONTRACT);
    const name = await rentableNFT.name();
    console.log(name)
  }
)

task(
  "query-nft-user",
  "usage: npx hardhat query-nft-user --network localhost")
  .addPositionalParam("tokenId")
  .setAction(async function(taskArguments) {
    const tokenId = parseInt(taskArguments.tokenId)

    const RentableNFT = await hre.ethers.getContractFactory('RentableNFT');
    const rentableNFT = await RentableNFT.attach(HARDHAT_CONTRACT);
    const address = await rentableNFT.userOf(tokenId)
    
    console.log(address)
  }
)

task(
  "query-nft-expires",
  "usage: npx hardhat query-nft-expires <tokenId> --network localhost")
  .addPositionalParam("tokenId")
  .setAction(async function(taskArguments) {
    const tokenId = parseInt(taskArguments.tokenId)

    const RentableNFT = await hre.ethers.getContractFactory('RentableNFT');
    const rentableNFT = await RentableNFT.attach(HARDHAT_CONTRACT);
    const timestamp = await rentableNFT.userExpires(tokenId)
    
    var currentTime = new Date(timestamp * 1000).toLocaleTimeString("zh-CN")

    console.log(currentTime)
  }
)
// deploy and automante one for each account