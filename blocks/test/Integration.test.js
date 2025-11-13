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

  describe("Frontend compatibility", function () {
    it("exposes all required read methods", async function () {
      const { blockLucky } = await deployContractFixture();

      expect(await blockLucky.ticketPrice()).to.equal(ticketPrice);
      expect(await blockLucky.maxParticipants()).to.equal(5);
      expect(await blockLucky.roundDuration()).to.equal(3600);
      expect(await blockLucky.roundActive()).to.equal(true);
      expect(await blockLucky.roundId()).to.equal(1);
      expect(await blockLucky.currentLotteryPhase()).to.be.a("string");
      expect(await blockLucky.getRoundCount()).to.equal(0);
    });

    it("returns active players and contract balance", async function () {
      const { blockLucky, player1, player2 } = await deployContractFixture();

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

      const players = await blockLucky.getPlayers();
      expect(players).to.deep.equal([player1.address, player2.address]);

      const balance = await blockLucky.getBalance();
      expect(balance).to.equal(ticketPrice * 2n);
    });
  });

  describe("Automatic draw flow", function () {
    it("auto-draws when threshold reached and stores history", async function () {
      const { blockLucky, owner, player1, player2, player3 } = await deployContractFixture();

      await blockLucky.connect(owner).updateConfiguration(ticketPrice, 3, 600);

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player2).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player3).buyTicket({ value: ticketPrice });

      expect(await blockLucky.roundId()).to.equal(2);
      expect(await blockLucky.getRoundCount()).to.equal(1);

      const summary = await blockLucky.getRoundSummary(0);
      expect(summary.ticketCount).to.equal(3n);
      expect(summary.prize).to.equal(ticketPrice * 3n);
    });

    it("forces draw after deadline and re-opens a new round", async function () {
      const { blockLucky, owner, player1, player2 } = await deployContractFixture();
      await blockLucky.connect(owner).updateConfiguration(ticketPrice, 10, 900);

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

      await ethers.provider.send("evm_increaseTime", [1200]);
      await ethers.provider.send("hardhat_mine", []);

      await blockLucky.forceDraw();

      expect(await blockLucky.roundId()).to.equal(2);
      expect(await blockLucky.roundActive()).to.equal(true);
      expect(await blockLucky.getRoundCount()).to.equal(1);
    });
  });

  describe("Transparency helpers", function () {
    it("provides latest round summary once data exists", async function () {
      const { blockLucky, owner, player1, player2 } = await deployContractFixture();
      await blockLucky.connect(owner).updateConfiguration(ticketPrice, 2, 600);

      await blockLucky.connect(player1).buyTicket({ value: ticketPrice });
      await blockLucky.connect(player2).buyTicket({ value: ticketPrice });

      const latest = await blockLucky.getLatestRound();
      expect(latest.ticketCount).to.equal(2n);
      expect(latest.prize).to.equal(ticketPrice * 2n);
    });
  });
});
