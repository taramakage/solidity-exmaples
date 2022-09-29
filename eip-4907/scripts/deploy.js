// deploy the RentableNFT;
const hre = require("hardhat");

const name = "IslandBookStore"
const symbol = "IBS"

async function main() {
  const RentableNFT = await hre.ethers.getContractFactory("RentableNFT");
  console.log('Deploying RentableNFT...');
  const rentableNFT = await RentableNFT.deploy(name, symbol);
  await rentableNFT.deployed();
  console.log('RentableNFT deployed to:', rentableNFT.address)
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});
