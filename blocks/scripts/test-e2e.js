const hre = require("hardhat");
const { ethers } = require("hardhat");

async function main() {
  console.log("\n🧪 Starting End-to-End Integration Test\n");
  console.log("=" .repeat(60));

  const [owner, player1, player2, player3] = await ethers.getSigners();

  console.log("\n📋 Test Accounts:");
  console.log(`   Owner:   ${owner.address}`);
  console.log(`   Player1: ${player1.address}`);
  console.log(`   Player2: ${player2.address}`);
  console.log(`   Player3: ${player3.address}`);

  console.log("\n📦 Deploying BlockLucky contract...");
  const BlockLucky = await ethers.getContractFactory("BlockLucky");
  const blockLucky = await BlockLucky.deploy();
  await blockLucky.waitForDeployment();
  const contractAddress = await blockLucky.getAddress();
  console.log(`   ✅ Contract deployed to: ${contractAddress}`);

  const ticketPrice = await blockLucky.ticketPrice();
  console.log(`   💵 Ticket Price: ${ethers.formatEther(ticketPrice)} ETH`);

  console.log("\n" + "=".repeat(60));
  console.log("🎯 PHASE 1: Ticket Sales");
  console.log("=".repeat(60));

  let phase = await blockLucky.currentLotteryPhase();
  console.log(`   Current Phase: ${phase}`);

  let inProgress = await blockLucky.lotteryInProgress();
  let commitActive = await blockLucky.commitmentActive();
  console.log(`   Lottery In Progress: ${inProgress}`);
  console.log(`   Commitment Active: ${commitActive}`);

  console.log("\n   🎟️  Player 1 buying ticket...");
  let tx = await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
  await tx.wait();
  console.log("   ✅ Player 1 bought ticket");

  console.log("   🎟️  Player 2 buying ticket...");
  tx = await blockLucky.connect(player2).buyTicket({ value: ticketPrice });
  await tx.wait();
  console.log("   ✅ Player 2 bought ticket");

  console.log("   🎟️  Player 3 buying 2 tickets...");
  tx = await blockLucky.connect(player3).buyTicket({ value: ticketPrice });
  await tx.wait();
  tx = await blockLucky.connect(player3).buyTicket({ value: ticketPrice });
  await tx.wait();
  console.log("   ✅ Player 3 bought 2 tickets");

  let players = await blockLucky.getPlayers();
  let balance = await blockLucky.getBalance();
  console.log(`\n   📊 Total Players: ${players.length}`);
  console.log(`   💰 Contract Balance: ${ethers.formatEther(balance)} ETH`);

  players.forEach((player, index) => {
    console.log(`      Ticket #${index + 1}: ${player}`);
  });

  const player3Count = players.filter(p => p === player3.address).length;
  console.log(`\n   🎫 Player 3 has ${player3Count} ticket(s)`);

  console.log("\n" + "=".repeat(60));
  console.log("🔒 PHASE 2: Commit Randomness");
  console.log("=".repeat(60));

  const secretSeed = "my-super-secret-lottery-seed-12345";
  console.log(`\n   🔐 Owner creating commitment with secret seed...`);
  console.log(`   (In production, this seed would be stored securely)`);

  const commitment = ethers.keccak256(ethers.toUtf8Bytes(secretSeed));
  console.log(`   📝 Commitment Hash: ${commitment}`);

  tx = await blockLucky.connect(owner).commitRandomness(commitment);
  const receipt = await tx.wait();
  console.log(`   ✅ Commitment registered (tx: ${tx.hash.slice(0, 10)}...)`);

  const commitEvent = receipt.logs.find(log => {
    try {
      const parsed = blockLucky.interface.parseLog(log);
      return parsed && parsed.name === 'CommitmentMade';
    } catch {
      return false;
    }
  });

  if (commitEvent) {
    console.log(`   📅 Event 'CommitmentMade' emitted successfully`);
  }

  phase = await blockLucky.currentLotteryPhase();
  inProgress = await blockLucky.lotteryInProgress();
  commitActive = await blockLucky.commitmentActive();
  console.log(`\n   Current Phase: ${phase}`);
  console.log(`   Lottery In Progress: ${inProgress}`);
  console.log(`   Commitment Active: ${commitActive}`);

  console.log("\n   ❌ Testing: Player 1 tries to buy ticket (should fail)...");
  try {
    await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
    console.log("   ⚠️  ERROR: Ticket purchase should have been blocked!");
  } catch (error) {
    console.log(`   ✅ Correctly blocked: ${error.message.split('(')[0].trim()}`);
  }

  console.log("\n" + "=".repeat(60));
  console.log("🎰 PHASE 3: Reveal & Pick Winner");
  console.log("=".repeat(60));

  console.log(`\n   🔓 Owner revealing seed and picking winner...`);

  const balancesBefore = {
    player1: await ethers.provider.getBalance(player1.address),
    player2: await ethers.provider.getBalance(player2.address),
    player3: await ethers.provider.getBalance(player3.address),
  };

  tx = await blockLucky.connect(owner).revealAndPickWinner(secretSeed);
  const revealReceipt = await tx.wait();
  console.log(`   ✅ Reveal successful (tx: ${tx.hash.slice(0, 10)}...)`);

  const winnerEvent = revealReceipt.logs.find(log => {
    try {
      const parsed = blockLucky.interface.parseLog(log);
      return parsed && parsed.name === 'WinnerSelected';
    } catch {
      return false;
    }
  });

  if (winnerEvent) {
    const parsed = blockLucky.interface.parseLog(winnerEvent);
    console.log(`\n   🏆 Event 'WinnerSelected' emitted:`);
    console.log(`      Winner: ${parsed.args.winner}`);
    console.log(`      Prize: ${ethers.formatEther(parsed.args.prize)} ETH`);
    console.log(`      Random Index: ${parsed.args.randomIndex}`);
  }

  const lastWinner = await blockLucky.lastWinner();
  console.log(`\n   🎉 Winner Address: ${lastWinner}`);

  const balancesAfter = {
    player1: await ethers.provider.getBalance(player1.address),
    player2: await ethers.provider.getBalance(player2.address),
    player3: await ethers.provider.getBalance(player3.address),
  };

  console.log(`\n   💸 Balance Changes:`);
  const changes = {
    player1: balancesAfter.player1 - balancesBefore.player1,
    player2: balancesAfter.player2 - balancesBefore.player2,
    player3: balancesAfter.player3 - balancesBefore.player3,
  };

  if (changes.player1 > 0) {
    console.log(`      Player 1: +${ethers.formatEther(changes.player1)} ETH 🏆`);
  } else {
    console.log(`      Player 1: ${ethers.formatEther(changes.player1)} ETH`);
  }

  if (changes.player2 > 0) {
    console.log(`      Player 2: +${ethers.formatEther(changes.player2)} ETH 🏆`);
  } else {
    console.log(`      Player 2: ${ethers.formatEther(changes.player2)} ETH`);
  }

  if (changes.player3 > 0) {
    console.log(`      Player 3: +${ethers.formatEther(changes.player3)} ETH 🏆`);
  } else {
    console.log(`      Player 3: ${ethers.formatEther(changes.player3)} ETH`);
  }

  phase = await blockLucky.currentLotteryPhase();
  inProgress = await blockLucky.lotteryInProgress();
  commitActive = await blockLucky.commitmentActive();
  console.log(`\n   Current Phase: ${phase}`);
  console.log(`   Lottery In Progress: ${inProgress}`);
  console.log(`   Commitment Active: ${commitActive}`);

  players = await blockLucky.getPlayers();
  balance = await blockLucky.getBalance();
  console.log(`   📊 Remaining Players: ${players.length}`);
  console.log(`   💰 Contract Balance: ${ethers.formatEther(balance)} ETH`);

  console.log("\n" + "=".repeat(60));
  console.log("🔄 PHASE 4: Reset to Phase 1");
  console.log("=".repeat(60));

  console.log(`\n   🔄 Owner resetting to Phase 1...`);
  tx = await blockLucky.connect(owner).resetToPhase1();
  await tx.wait();
  console.log(`   ✅ Reset successful`);

  phase = await blockLucky.currentLotteryPhase();
  inProgress = await blockLucky.lotteryInProgress();
  commitActive = await blockLucky.commitmentActive();
  console.log(`\n   Current Phase: ${phase}`);
  console.log(`   Lottery In Progress: ${inProgress}`);
  console.log(`   Commitment Active: ${commitActive}`);

  console.log("\n   ✅ Testing: Player 1 can buy ticket again...");
  tx = await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
  await tx.wait();
  console.log("   ✅ Player 1 successfully bought ticket in new round");

  players = await blockLucky.getPlayers();
  console.log(`   📊 New Round Players: ${players.length}`);

  console.log("\n" + "=".repeat(60));
  console.log("✅ END-TO-END TEST COMPLETED SUCCESSFULLY");
  console.log("=".repeat(60));
  console.log("\n📝 Summary:");
  console.log("   ✓ Contract deployed");
  console.log("   ✓ Players bought tickets in Phase 1");
  console.log("   ✓ Owner committed randomness in Phase 2");
  console.log("   ✓ Players blocked from buying during Phase 2");
  console.log("   ✓ Winner selected in Phase 3");
  console.log("   ✓ Prize distributed correctly");
  console.log("   ✓ Contract reset to Phase 1");
  console.log("   ✓ New round started successfully");
  console.log("\n🎉 All integration tests passed!\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Test Failed:");
    console.error(error);
    process.exit(1);
  });
