const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlockLucky Integration Tests", function () {
  const ticketPrice = ethers.parseEther("0.1");

  async function deployContractFixture() {
    const [owner, player1, player2, player3] = await ethers.getSigners();
    const BlockLucky = await ethers.getContractFactory("BlockLucky");
    const blockLucky = await BlockLucky.deploy();
    await blockLucky.waitForDeployment();

    return { blockLucky, owner, player1, player2, player3 };
  }

  describe("Frontend Integration - ABI Compatibility", function () {
    it("should expose all frontend-required view functions", async function () {
      const { blockLucky } = await deployContractFixture();

      expect(await blockLucky.ticketPrice()).to.be.a('bigint');
      expect(await blockLucky.owner()).to.be.a('string');
      expect(await blockLucky.lastWinner()).to.be.a('string');
      expect(await blockLucky.lotteryInProgress()).to.be.a('boolean');
      expect(await blockLucky.commitmentActive()).to.be.a('boolean');
      expect(await blockLucky.currentLotteryPhase()).to.be.a('string');
      expect(await blockLucky.commitmentTimestamp()).to.be.a('bigint');
      expect(await blockLucky.REVEAL_DEADLINE()).to.be.a('bigint');
    });

    it("should return correct initial phase state", async function () {
      const { blockLucky } = await deployContractFixture();

      expect(await blockLucky.currentLotteryPhase()).to.equal("Phase 1: Open for ticket sales");
      expect(await blockLucky.lotteryInProgress()).to.be.false;
      expect(await blockLucky.commitmentActive()).to.be.false;
    });

    it("should provide getPlayers array function", async function () {
      const { blockLucky, player1, player2 } = await deployContractFixture();

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

      const players = await blockLucky.getPlayers();
      expect(players.length).to.equal(2);
      expect(players[0]).to.equal(player1.address);
      expect(players[1]).to.equal(player2.address);
    });

    it("should provide getBalance function", async function () {
      const { blockLucky, player1 } = await deployContractFixture();

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });

      const balance = await blockLucky.getBalance();
      expect(balance).to.equal(ticketPrice);
    });
  });

  describe("Complete Three-Phase Flow", function () {
    it("should execute full commit-reveal flow as frontend would", async function () {
      const { blockLucky, owner, player1, player2, player3 } = await deployContractFixture();

      expect(await blockLucky.currentLotteryPhase()).to.equal("Phase 1: Open for ticket sales");

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player2).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player3).buyTicket({ value: ticketPrice });

      const players = await blockLucky.getPlayers();
      expect(players.length).to.equal(3);

      const userSeed = "my-frontend-secret-seed-12345";
      const commitment = ethers.keccak256(ethers.toUtf8Bytes(userSeed));

      const commitTx = await blockLucky.connect(owner).commitRandomness(commitment);
      await commitTx.wait();

      expect(await blockLucky.lotteryInProgress()).to.be.true;
      expect(await blockLucky.commitmentActive()).to.be.true;
      expect(await blockLucky.currentLotteryPhase()).to.include("Phase 2");

      const tryBuyAfterCommit = blockLucky.connect(player1).buyTicket({ value: ticketPrice });
      await expect(tryBuyAfterCommit).to.be.revertedWith("Cannot buy tickets during active lottery");

      const revealTx = await blockLucky.connect(owner).revealAndPickWinner(userSeed);
      const receipt = await revealTx.wait();

      const winnerEvent = receipt.logs.find(log => {
        try {
          const parsed = blockLucky.interface.parseLog(log);
          return parsed && parsed.name === 'WinnerSelected';
        } catch {
          return false;
        }
      });

      expect(winnerEvent).to.not.be.undefined;

      expect(await blockLucky.lotteryInProgress()).to.be.false;
      expect(await blockLucky.commitmentActive()).to.be.false;
      expect(await blockLucky.currentLotteryPhase()).to.include("Phase 3");

      const resetTx = await blockLucky.connect(owner).resetToPhase1();
      await resetTx.wait();

      expect(await blockLucky.currentLotteryPhase()).to.equal("Phase 1: Open for ticket sales");
      expect(await blockLucky.lotteryInProgress()).to.be.false;
    });

    it("should prevent players from buying during Phase 2", async function () {
      const { blockLucky, owner, player1, player2 } = await deployContractFixture();

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });

      const seed = "test-seed";
      const commitment = ethers.keccak256(ethers.toUtf8Bytes(seed));
      await blockLucky.connect(owner).commitRandomness(commitment);

      await expect(
        blockLucky.connect(player2).buyTicket({ value: ticketPrice })
      ).to.be.revertedWith("Cannot buy tickets during active lottery");
    });

    it("should handle seed mismatch gracefully", async function () {
      const { blockLucky, owner, player1, player2 } = await deployContractFixture();

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

      const correctSeed = "correct-frontend-seed";
      const wrongSeed = "wrong-frontend-seed";
      const commitment = ethers.keccak256(ethers.toUtf8Bytes(correctSeed));

      await blockLucky.connect(owner).commitRandomness(commitment);

      await expect(
        blockLucky.connect(owner).revealAndPickWinner(wrongSeed)
      ).to.be.revertedWith("Seed does not match commitment");

      expect(await blockLucky.commitmentActive()).to.be.true;
    });
  });

  describe("Multi-User Scenarios", function () {
    it("should handle same user buying multiple tickets", async function () {
      const { blockLucky, player1 } = await deployContractFixture();

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });

      const players = await blockLucky.getPlayers();
      expect(players.length).to.equal(3);

      const userTicketsCount = players.filter(addr => addr === player1.address).length;
      expect(userTicketsCount).to.equal(3);
    });

    it("should distribute prize to correct winner", async function () {
      const { blockLucky, owner, player1, player2, player3 } = await deployContractFixture();

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player2).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player3).buyTicket({ value: ticketPrice });

      const prize = ticketPrice * BigInt(3);

      const seed = "deterministic-seed";
      const commitment = ethers.keccak256(ethers.toUtf8Bytes(seed));
      await blockLucky.connect(owner).commitRandomness(commitment);

      const balancesBefore = {
        player1: await ethers.provider.getBalance(player1.address),
        player2: await ethers.provider.getBalance(player2.address),
        player3: await ethers.provider.getBalance(player3.address),
      };

      await blockLucky.connect(owner).revealAndPickWinner(seed);

      const balancesAfter = {
        player1: await ethers.provider.getBalance(player1.address),
        player2: await ethers.provider.getBalance(player2.address),
        player3: await ethers.provider.getBalance(player3.address),
      };

      const increases = {
        player1: balancesAfter.player1 - balancesBefore.player1,
        player2: balancesAfter.player2 - balancesBefore.player2,
        player3: balancesAfter.player3 - balancesBefore.player3,
      };

      const winnersCount = Object.values(increases).filter(inc => inc === prize).length;
      expect(winnersCount).to.equal(1);

      const lastWinner = await blockLucky.lastWinner();
      expect([player1.address, player2.address, player3.address]).to.include(lastWinner);
    });
  });

  describe("Edge Cases", function () {
    it("should handle reset without completing reveal", async function () {
      const { blockLucky, owner, player1 } = await deployContractFixture();

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });

      const seed = "test-seed";
      const commitment = ethers.keccak256(ethers.toUtf8Bytes(seed));
      await blockLucky.connect(owner).commitRandomness(commitment);

      await expect(
        blockLucky.connect(owner).resetToPhase1()
      ).to.be.revertedWith("Lottery still in progress");
    });

    it("should only allow owner to perform admin actions", async function () {
      const { blockLucky, player1, player2 } = await deployContractFixture();

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

      const seed = "test-seed";
      const commitment = ethers.keccak256(ethers.toUtf8Bytes(seed));

      await expect(
        blockLucky.connect(player1).commitRandomness(commitment)
      ).to.be.revertedWith("Not authorized");

      await expect(
        blockLucky.connect(player1).resetToPhase1()
      ).to.be.revertedWith("Not authorized");
    });
  });
});
