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

  it("deploys with correct owner and ticket price", async function () {
    const { blockLucky, owner } = await deployContractFixture();
    expect(await blockLucky.owner()).to.equal(owner.address);
    expect(await blockLucky.ticketPrice()).to.equal(ticketPrice);
  });

  it("allows a player to buy a ticket with exact price", async function () {
    const { blockLucky, player1 } = await deployContractFixture();

    await expect(
      blockLucky.connect(player1).buyTicket({ value: ticketPrice })
    ).to.not.be.reverted;

    expect(await blockLucky.players(0)).to.equal(player1.address);
  });

  it("reverts when buying a ticket with incorrect value", async function () {
    const { blockLucky, player1 } = await deployContractFixture();

    await expect(
      blockLucky.connect(player1).buyTicket({ value: ethers.parseEther("0.05") })
    ).to.be.revertedWith("Incorrect ticket price");
  });

  it("restricts pickWinner to the owner", async function () {
    const { blockLucky, player1 } = await deployContractFixture();

    await expect(blockLucky.connect(player1).pickWinner()).to.be.revertedWith(
      "Not authorized"
    );
  });

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
});

