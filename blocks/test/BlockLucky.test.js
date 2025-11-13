const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BlockLucky", function () {
  const defaultTicketPrice = ethers.parseEther("0.1");

  async function deployContractFixture() {
    const [owner, player1, player2, player3, player4] = await ethers.getSigners();
    const BlockLucky = await ethers.getContractFactory("BlockLucky");
    const blockLucky = await BlockLucky.deploy();
    await blockLucky.waitForDeployment();

    return { blockLucky, owner, player1, player2, player3, player4 };
  }

  it("deploys with correct owner and defaults", async function () {
    const { blockLucky, owner } = await deployContractFixture();
    expect(await blockLucky.owner()).to.equal(owner.address);
    expect(await blockLucky.ticketPrice()).to.equal(defaultTicketPrice);
    expect(await blockLucky.maxParticipants()).to.equal(5);
    expect(await blockLucky.roundActive()).to.equal(true);
  });

  it("allows ticket purchase with exact price and tracks players", async function () {
    const { blockLucky, player1 } = await deployContractFixture();

    await expect(blockLucky.connect(player1).buyTicket({ value: defaultTicketPrice }))
      .to.emit(blockLucky, "TicketPurchased")
      .withArgs(player1.address, 1, 0, defaultTicketPrice);

    const players = await blockLucky.getPlayers();
    expect(players).to.deep.equal([player1.address]);
  });

  it("reverts when incorrect ticket value is sent", async function () {
    const { blockLucky, player1 } = await deployContractFixture();

    await expect(
      blockLucky.connect(player1).buyTicket({ value: ethers.parseEther("0.05") })
    ).to.be.revertedWith("Incorrect ticket price");
  });

  it("updates configuration via owner", async function () {
    const { blockLucky, owner } = await deployContractFixture();

    const newPrice = ethers.parseEther("0.2");
    await blockLucky.connect(owner).updateConfiguration(newPrice, 3, 1800);

    expect(await blockLucky.ticketPrice()).to.equal(newPrice);
    expect(await blockLucky.maxParticipants()).to.equal(3);
    expect(await blockLucky.roundDuration()).to.equal(1800);
  });

  it("automatically picks a winner once max participants are reached", async function () {
    const { blockLucky, owner, player1, player2, player3 } = await deployContractFixture();

    await blockLucky.connect(owner).updateConfiguration(defaultTicketPrice, 3, 3600);

    await blockLucky.connect(player1).buyTicket({ value: defaultTicketPrice });
    await blockLucky.connect(player2).buyTicket({ value: defaultTicketPrice });

    const contractBalanceBefore = await ethers.provider.getBalance(await blockLucky.getAddress());
    expect(contractBalanceBefore).to.equal(defaultTicketPrice * 2n);

    const tx = await blockLucky.connect(player3).buyTicket({ value: defaultTicketPrice });
    await tx.wait();

    expect(await blockLucky.roundId()).to.equal(2);
    const contractBalanceAfter = await ethers.provider.getBalance(await blockLucky.getAddress());
    expect(contractBalanceAfter).to.equal(0);

    const historyCount = await blockLucky.getRoundCount();
    expect(historyCount).to.equal(1);

    const summary = await blockLucky.getRoundSummary(0);
    expect(summary.prize).to.equal(defaultTicketPrice * 3n);
    expect(summary.ticketCount).to.equal(3n);

    const players = await blockLucky.getPlayers();
    expect(players.length).to.equal(0);
  });

  it("allows anyone to force draw after deadline", async function () {
    const { blockLucky, owner, player1, player2, player3, player4 } = await deployContractFixture();

    await blockLucky.connect(owner).updateConfiguration(defaultTicketPrice, 10, 600);

    await blockLucky.connect(player1).buyTicket({ value: defaultTicketPrice });
    await blockLucky.connect(player2).buyTicket({ value: defaultTicketPrice });
    await blockLucky.connect(player3).buyTicket({ value: defaultTicketPrice });

    await ethers.provider.send("evm_increaseTime", [601]);
    await ethers.provider.send("hardhat_mine", []);

    const tx = await blockLucky.connect(player4).forceDraw();
    await tx.wait();

    expect(await blockLucky.roundId()).to.equal(2);
    expect(await blockLucky.getRoundCount()).to.equal(1);
    const summary = await blockLucky.getRoundSummary(0);
    expect(summary.ticketCount).to.equal(3n);
    expect(summary.prize).to.equal(defaultTicketPrice * 3n);
  });

  it("prevents force draw before deadline", async function () {
    const { blockLucky, owner, player1 } = await deployContractFixture();
    await blockLucky.connect(owner).updateConfiguration(defaultTicketPrice, 10, 600);
    await blockLucky.connect(player1).buyTicket({ value: defaultTicketPrice });

    await expect(blockLucky.forceDraw()).to.be.revertedWith("Deadline not reached");
  });

  it("stores round history with winner information", async function () {
    const { blockLucky, owner, player1, player2, player3 } = await deployContractFixture();

    await blockLucky.connect(owner).updateConfiguration(defaultTicketPrice, 2, 3600);

    await blockLucky.connect(player1).buyTicket({ value: defaultTicketPrice });
    await blockLucky.connect(player2).buyTicket({ value: defaultTicketPrice });

    const historyCount = await blockLucky.getRoundCount();
    expect(historyCount).to.equal(1);

    const latest = await blockLucky.getLatestRound();
    expect([player1.address, player2.address]).to.include(latest.winner);
    expect(latest.prize).to.equal(defaultTicketPrice * 2n);
    expect(latest.ticketCount).to.equal(2n);

    await blockLucky.connect(player3).buyTicket({ value: defaultTicketPrice });
    await ethers.provider.send("evm_increaseTime", [4000]);
    await ethers.provider.send("hardhat_mine", []);
    await blockLucky.forceDraw();

    const newCount = await blockLucky.getRoundCount();
    expect(newCount).to.equal(2);
  });
});
