const hre = require("hardhat");

async function main() {
  console.log("Deploying BlockLucky contract...");

  const BlockLucky = await hre.ethers.getContractFactory("BlockLucky");
  const blockLucky = await BlockLucky.deploy();

  await blockLucky.waitForDeployment();

  const address = await blockLucky.getAddress();
  console.log("\n✅ BlockLucky deployed to:", address);
  console.log("\n📋 Contract Details:");
  console.log("   Address:", address);
  console.log("   Network:", hre.network.name);
  console.log("   Chain ID:", (await hre.ethers.provider.getNetwork()).chainId);
  
  // Verify deployment
  const ticketPrice = await blockLucky.ticketPrice();
  const owner = await blockLucky.owner();
  console.log("\n🔍 Verification:");
  console.log("   Ticket Price:", hre.ethers.formatEther(ticketPrice), "ETH");
  console.log("   Owner:", owner);

  console.log("\n📝 Next steps:");
  console.log("   1. Add this to client/.env.local:");
  console.log(`      NEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);
  console.log("   2. Update NEXT_PUBLIC_CHAIN_ID if needed");
  console.log("   3. Start the frontend: cd client && npm run dev");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

