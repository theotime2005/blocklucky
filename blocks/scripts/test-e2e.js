const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("\n🧪 Starting BlockLucky end-to-end scenario\n");
  console.log("=".repeat(70));

  const [owner, player1, player2, player3] = await ethers.getSigners();
  console.log("\n📋 Accounts:");
  console.log(`   Owner:   ${owner.address}`);
  console.log(`   Player1: ${player1.address}`);
  console.log(`   Player2: ${player2.address}`);
  console.log(`   Player3: ${player3.address}`);

  console.log("\n🚀 Deploying BlockLucky...");
  const BlockLucky = await ethers.getContractFactory("BlockLucky");
  const blockLucky = await BlockLucky.deploy();
  await blockLucky.waitForDeployment();
  const contractAddress = await blockLucky.getAddress();
  console.log(`   ✅ Contract deployed at: ${contractAddress}`);

  const ticketPrice = await blockLucky.ticketPrice();
  console.log(`   🎟️ Ticket price: ${ethers.formatEther(ticketPrice)} ETH`);

  console.log("\n" + "=".repeat(70));
  console.log("🎯 PHASE 1 — Ticket collection");
  console.log("=".repeat(70));

  let roundId = await blockLucky.roundId();
  let maxParticipants = await blockLucky.maxParticipants();
  let roundDeadline = await blockLucky.roundDeadline();
  console.log(`   Round #${roundId} configured for ${maxParticipants} participants`);
  console.log(`   Deadline: ${new Date(Number(roundDeadline) * 1000).toLocaleString()}`);

  console.log("\n   🎟️ Players buying tickets...");
  await (await blockLucky.connect(player1).buyTicket({ value: ticketPrice })).wait();
  console.log("   ✅ Player 1 bought 1 ticket");
  await (await blockLucky.connect(player2).buyTicket({ value: ticketPrice })).wait();
  console.log("   ✅ Player 2 bought 1 ticket");
  await (await blockLucky.connect(player3).buyTicket({ value: ticketPrice })).wait();
  console.log("   ✅ Player 3 bought 1 ticket");

  const players = await blockLucky.getPlayers();
  console.log(`\n   👥 Registered tickets: ${players.length}`);
  console.log(`   👛 Contract balance: ${ethers.formatEther(await blockLucky.getBalance())} ETH`);

  console.log("\n" + "=".repeat(70));
  console.log("🎰 PHASE 2 — Automatic draw (threshold reached)");
  console.log("=".repeat(70));

  // Configure a small threshold to trigger immediately
  await (await blockLucky.updateConfiguration(ticketPrice, 3, 600)).wait();
  await (await blockLucky.connect(player1).buyTicket({ value: ticketPrice })).wait();
  await (await blockLucky.connect(player2).buyTicket({ value: ticketPrice })).wait();
  const tx = await blockLucky.connect(player3).buyTicket({ value: ticketPrice });
  const receipt = await tx.wait();

  const winnerEvent = receipt.logs
    .map((log) => {
      try {
        return blockLucky.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find((parsed) => parsed && parsed.name === 'WinnerSelected');

  if (winnerEvent) {
    console.log(`   🏆 Winner selected automatically: ${winnerEvent.args.winner}`);
    console.log(`   💰 Prize: ${ethers.formatEther(winnerEvent.args.prize)} ETH`);
  }

  console.log("\n   📊 Contract balance after draw: " + ethers.formatEther(await blockLucky.getBalance()) + " ETH");
  console.log("   🔁 Active round: #" + (await blockLucky.roundId()));

  console.log("\n" + "=".repeat(70));
  console.log("⏱️ PHASE 3 — Deadline based draw");
  console.log("=".repeat(70));

  // Configure a 3 participant round with a short deadline
  await (await blockLucky.updateConfiguration(ticketPrice, 6, 300)).wait();
  await (await blockLucky.connect(player1).buyTicket({ value: ticketPrice })).wait();
  await (await blockLucky.connect(player2).buyTicket({ value: ticketPrice })).wait();

  console.log("   🕒 Fast-forwarding time past the deadline...");
  await ethers.provider.send('evm_increaseTime', [3600]);
  await ethers.provider.send('hardhat_mine', []);

  console.log("   ✋ Forcing draw after deadline");
  const forceTx = await blockLucky.connect(player3).forceDraw();
  await forceTx.wait();

  const historyCount = await blockLucky.getRoundCount();
  const latestRound = await blockLucky.getRoundSummary(Number(historyCount) - 1);
  console.log(`   📘 Recorded round #${latestRound.roundId}`);
  console.log(`   🏅 Winner: ${latestRound.winner}`);
  console.log(`   💵 Prize: ${ethers.formatEther(latestRound.prize)} ETH`);

  console.log("\n" + "=".repeat(70));
  console.log("✅ Scenario completed successfully");
  console.log("=".repeat(70));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Scenario failed:");
    console.error(error);
    process.exit(1);
  });
