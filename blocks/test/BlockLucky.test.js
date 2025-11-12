const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlockLucky", function () {
  const ticketPrice = ethers.parseEther("0.1");

  async function deployContractFixture() {
    const [owner, player1, player2, player3] = await ethers.getSigners();
    const BlockLucky = await ethers.getContractFactory("BlockLucky");
    const blockLucky = await BlockLucky.deploy();
    await blockLucky.waitForDeployment();

    return { blockLucky, owner, player1, player2, player3 };
  }

  // TEST 1: Deploy with correct owner and ticket price (Phase 0: Deployment)
  it("deploys with correct owner and ticket price", async function () {
    const { blockLucky, owner } = await deployContractFixture();
    expect(await blockLucky.owner()).to.equal(owner.address);
    expect(await blockLucky.ticketPrice()).to.equal(ticketPrice);
  });

  // TEST 2: Allow player to buy ticket with exact price (Phase 1: Ticket Sales)
  it("allows a player to buy a ticket with exact price", async function () {
    const { blockLucky, player1 } = await deployContractFixture();

    await expect(
      blockLucky.connect(player1).buyTicket({ value: ticketPrice })
    ).to.not.be.reverted;

    expect(await blockLucky.players(0)).to.equal(player1.address);
  });

  // TEST 3: Revert when buying ticket with incorrect price (Phase 1: Validation)
  it("reverts when buying a ticket with incorrect value", async function () {
    const { blockLucky, player1 } = await deployContractFixture();

    await expect(
      blockLucky.connect(player1).buyTicket({ value: ethers.parseEther("0.05") })
    ).to.be.revertedWith("Incorrect ticket price");
  });

  // TEST 4: Restrict pickWinner to owner only (Access Control)
  it("restricts pickWinner to the owner", async function () {
    const { blockLucky, player1 } = await deployContractFixture();

    await expect(blockLucky.connect(player1).pickWinner()).to.be.revertedWith(
      "Not authorized"
    );
  });

  // TEST 5: Complete old lottery flow and reset state (Backward Compatibility)
  it("completes the lottery flow and resets state", async function () {
    const { blockLucky, owner, player1, player2, player3 } =
      await deployContractFixture();

    await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player2).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player3).buyTicket({ value: ticketPrice });

    expect(
      await ethers.provider.getBalance(await blockLucky.getAddress())
    ).to.equal(ticketPrice * BigInt(3));

    await expect(blockLucky.connect(owner).pickWinner()).to.not.be.reverted;

    expect(
      await ethers.provider.getBalance(await blockLucky.getAddress())
    ).to.equal(0);

    const playersAfter = await blockLucky.getPlayers();
    expect(playersAfter.length).to.equal(0);
  });

    // ===== TESTS FOR GRAIN DE SABLE / TWO-PHASE LOTTERY =====

  // TEST 1, Should commit randomness with valid seed
  it("should successfully commit randomness with valid seed", async function () {
    const { blockLucky, owner, player1, player2 } = await deployContractFixture();

    await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

    const testSeed = "test-seed-for-lottery";

    const commitment = ethers.keccak256(ethers.toUtf8Bytes(testSeed));

    await expect(blockLucky.connect(owner).commitRandomness(commitment))
      .to.emit(blockLucky, "CommitmentMade");

    expect(await blockLucky.randomCommitment()).to.equal(commitment);
    expect(await blockLucky.commitmentActive()).to.equal(true);
    expect(await blockLucky.lotteryInProgress()).to.equal(true);
    expect(await blockLucky.currentLotteryPhase()).to.include("Phase 2");
  });

  // TEST 2, Should revert if non-owner tries to commit randomness
  it("should revert if non-owner tries to commit randomness", async function () {
    const { blockLucky, player1, player2 } = await deployContractFixture();

    await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

    const testSeed = "test-seed";
    const commitment = ethers.keccak256(ethers.toUtf8Bytes(testSeed));

    await expect(
      blockLucky.connect(player1).commitRandomness(commitment)
    ).to.be.revertedWith("Not authorized");
  });

  // TEST 3, Should revert if no players exist
  it("should revert if no players exist", async function () {
    const { blockLucky, owner } = await deployContractFixture();

    const testSeed = "test-seed";
    const commitment = ethers.keccak256(ethers.toUtf8Bytes(testSeed));

    await expect(
      blockLucky.connect(owner).commitRandomness(commitment)
    ).to.be.revertedWith("No players in lottery");
  });

  // TEST 4, Should revert if lottery already in progress
  it("should revert if lottery already in progress", async function () {
    const { blockLucky, owner, player1, player2 } = await deployContractFixture();

    await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

    const testSeed = "test-seed";
    const commitment = ethers.keccak256(ethers.toUtf8Bytes(testSeed));

    await blockLucky.connect(owner).commitRandomness(commitment);

    await expect(
      blockLucky.connect(owner).commitRandomness(commitment)
    ).to.be.revertedWith("Lottery already in progress");
  });

  // TEST 5, Should successfully reveal seed and pick winner
  it("should successfully reveal seed and pick winner", async function () {
    const { blockLucky, owner, player1, player2, player3 } =
      await deployContractFixture();

    await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player2).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player3).buyTicket({ value: ticketPrice });

    const testSeed = "test-seed";
    const commitment = ethers.keccak256(ethers.toUtf8Bytes(testSeed));

    await blockLucky.connect(owner).commitRandomness(commitment);

    const player1InitialBalance = await ethers.provider.getBalance(player1.address);
    const player2InitialBalance = await ethers.provider.getBalance(player2.address);
    const player3InitialBalance = await ethers.provider.getBalance(player3.address);

    await expect(blockLucky.connect(owner).revealAndPickWinner(testSeed)).to.emit(
      blockLucky,
      "WinnerSelected"
    );

    expect(await blockLucky.lotteryInProgress()).to.equal(false);
    expect(await blockLucky.commitmentActive()).to.equal(false);
    expect((await blockLucky.getPlayers()).length).to.equal(0);
    expect(await blockLucky.currentLotteryPhase()).to.include("Phase 3");

    const player1FinalBalance = await ethers.provider.getBalance(player1.address);
    const player2FinalBalance = await ethers.provider.getBalance(player2.address);
    const player3FinalBalance = await ethers.provider.getBalance(player3.address);

    const balanceIncreases = [
      player1FinalBalance - player1InitialBalance,
      player2FinalBalance - player2InitialBalance,
      player3FinalBalance - player3InitialBalance,
    ];

    const winnersCount = balanceIncreases.filter(
      (increase) => increase > ethers.parseEther("0.2")
    ).length;
    expect(winnersCount).to.equal(1);
  });

  // TEST 6, Should revert if seed doesn't match commitment
  it("should revert if revealed seed doesn't match commitment", async function () {
    const { blockLucky, owner, player1, player2 } = await deployContractFixture();

    await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

    const correctSeed = "correct-seed";
    const wrongSeed = "wrong-seed";
    const commitment = ethers.keccak256(ethers.toUtf8Bytes(correctSeed));

    await blockLucky.connect(owner).commitRandomness(commitment);

    await expect(
      blockLucky.connect(owner).revealAndPickWinner(wrongSeed)
    ).to.be.revertedWith("Seed does not match commitment");
  });

  // TEST 7, Should revert if no active commitment
  it("should revert if trying to reveal without active commitment", async function () {
    const { blockLucky, owner, player1, player2 } = await deployContractFixture();

    await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

    const testSeed = "test-seed";

    await expect(
      blockLucky.connect(owner).revealAndPickWinner(testSeed)
    ).to.be.revertedWith("No active commitment");
  });

  // TEST 8, Should respect reveal deadline
  it("should respect reveal deadline", async function () {
    const { blockLucky, owner, player1, player2 } = await deployContractFixture();

    await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

    const testSeed = "test-seed";
    const commitment = ethers.keccak256(ethers.toUtf8Bytes(testSeed));

    await blockLucky.connect(owner).commitRandomness(commitment);

    await ethers.provider.send("evm_increaseTime", [86400 * 2]); // 2 days
    await ethers.provider.send("hardhat_mine", []);

    await expect(
      blockLucky.connect(owner).revealAndPickWinner(testSeed)
    ).to.be.revertedWith("Reveal deadline passed");
  });

  // TEST 9, Full cycle twice (buy -> commit -> reveal -> reset -> repeat)
  it("should complete full lottery cycle twice (buy -> commit -> reveal -> reset -> repeat)", async function () {
    const { blockLucky, owner, player1, player2, player3 } =
      await deployContractFixture();

    // ===== CYCLE 1 =====
    await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

    const seed1 = "seed-cycle-1";
    const commitment1 = ethers.keccak256(ethers.toUtf8Bytes(seed1));
    await blockLucky.connect(owner).commitRandomness(commitment1);

    await blockLucky.connect(owner).revealAndPickWinner(seed1);

    expect((await blockLucky.getPlayers()).length).to.equal(0);
    expect(await blockLucky.currentLotteryPhase()).to.include("Phase 3");

    await blockLucky.connect(owner).resetToPhase1();
    expect(await blockLucky.currentLotteryPhase()).to.include("Phase 1");

    // ===== CYCLE 2 =====
    await blockLucky.connect(player2).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player3).buyTicket({ value: ticketPrice });

    const seed2 = "seed-cycle-2";
    const commitment2 = ethers.keccak256(ethers.toUtf8Bytes(seed2));
    await blockLucky.connect(owner).commitRandomness(commitment2);

    await blockLucky.connect(owner).revealAndPickWinner(seed2);

    expect((await blockLucky.getPlayers()).length).to.equal(0);
    expect(await blockLucky.currentLotteryPhase()).to.include("Phase 3");
  });

  // TEST 10, Should reset to Phase 1
  it("should reset to Phase 1", async function () {
    const { blockLucky, owner, player1, player2 } = await deployContractFixture();

    await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
    await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

    const testSeed = "test-seed";
    const commitment = ethers.keccak256(ethers.toUtf8Bytes(testSeed));

    await blockLucky.connect(owner).commitRandomness(commitment);
    await blockLucky.connect(owner).revealAndPickWinner(testSeed);

    await blockLucky.connect(owner).resetToPhase1();

    expect(await blockLucky.currentLotteryPhase()).to.equal(
      "Phase 1: Open for ticket sales"
    );
  });

});

