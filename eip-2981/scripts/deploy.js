// deploy the RentableNFT;
require('dotenv').config({path:__dirname+'./env'})
const hre = require("hardhat");


const name = "IslandBookStore"
const symbol = "IBS"
const defaultRecipient = process.env.DEFAULT_RECIPIENT
const defaultRoyaltyFraction = parseInt(process.env.DEFAULT_ROYALTY_FRACTION)

async function main() {
  const RoyaltyNFT = await hre.ethers.getContractFactory("RoyaltyNFT");
  console.log('Deploying RoyaltyNFT...');
  const royaltyNFT = await RoyaltyNFT.deploy(name, symbol, defaultRecipient, defaultRoyaltyFraction);
  await royaltyNFT.deployed();
  console.log('RoyaltyNFT deployed to:', royaltyNFT.address)
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});
