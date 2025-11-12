// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BlockLucky - Simple lottery prototype contract
/// @author 
/// @notice This contract allows users to buy lottery tickets and lets the owner pick a winner
/// @dev Uses a naive pseudo-random method, not suitable for production use
contract BlockLucky {
    address public owner;
    uint256 public ticketPrice;
    address payable[] public players;
    address public lastWinner;

    // "Grain de Sable" tip from teacher
    bytes32 public randomCommitment;
    bool public lotteryInProgress;
    uint256 public commitmentTimestamp; // when the commitment was made
    uint256 public constant REVEAL_DEADLINE = 1 days;
    bool public commitmentActive;
    string public currentLotteryPhase; // for front to tack phase

    /// @notice Restricts function access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    /// @notice Initializes the lottery with the deployer as the owner and sets the ticket price
    constructor() {
        owner = msg.sender;
        ticketPrice = 0.1 ether;
        lotteryInProgress = false;
        commitmentActive = false;
        currentLotteryPhase = "Phase 1: Open for ticket sales";
    }

    /// @notice Allows users to buy a lottery ticket by paying the exact ticket price
    /// @dev Reverts if the sent value differs from the ticket price
    function buyTicket() external payable {
        require(msg.value == ticketPrice, "Incorrect ticket price");
        require(!lotteryInProgress, "Cannot buy tickets during active lottery"); /// So player CANNOT buy tickets once lot commit phase starts 
        players.push(payable(msg.sender));
    }

    /// @notice Picks a winner from the current players and transfers the contract balance
    /// @dev Uses block variables for pseudo-randomness, which are predictable; only for prototypes
    function pickWinner() external onlyOwner {
        require(players.length > 0, "No players");

        uint256 randomIndex = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.prevrandao, players.length)
            )
        ) % players.length;

        address payable winnerAddress = players[randomIndex];
        lastWinner = winnerAddress;

        uint256 prize = address(this).balance;
        require(prize > 0, "No funds to transfer");

        (bool success, ) = winnerAddress.call{value: prize}("");
        require(success, "Transfer failed");

        delete players;
    }

function commitRandomness(bytes32 _commitment) external onlyOwner {
    require(!lotteryInProgress, "Lottery already in progress");
    require(!commitmentActive, "Commitment already active");
    
    // Validate there are players to select from
    require(players.length > 0, "No players in lottery");
    
    // Store commitment (immutable once set)
    randomCommitment = _commitment;
    commitmentActive = true;
    lotteryInProgress = true;
    commitmentTimestamp = block.timestamp;
    
    currentLotteryPhase = "Phase 2: Commitment active - waiting to reveal";
    
    emit CommitmentMade(_commitment, block.timestamp);
}

// Event to emit when commitment is made
event CommitmentMade(bytes32 indexed commitment, uint256 timestamp);

function revealAndPickWinner(string memory _seed) external onlyOwner {
    require(commitmentActive, "No active commitment");
    require(lotteryInProgress, "Lottery not in progress");
    require(players.length > 0, "No players in lottery");
    
    // Validate reveal deadline hasn't passed
    require(
        block.timestamp <= commitmentTimestamp + REVEAL_DEADLINE,
        "Reveal deadline passed"
    );
    
    
    bytes32 revealedCommitment = keccak256(abi.encodePacked(_seed));
    require(
        revealedCommitment == randomCommitment,
        "Seed does not match commitment"
    );
    
    // Use the verified seed to generate the random index
    uint256 randomIndex = uint256(
        keccak256(
            abi.encodePacked(
                _seed,
                block.timestamp,
                block.number,
                players.length
            )
        )
    ) % players.length;
    
    // Select the winner
    address payable winnerAddress = players[randomIndex];
    lastWinner = winnerAddress;
    
    uint256 prize = address(this).balance;
    require(prize > 0, "No funds to transfer");
    
    // Transfer prize to winner
    (bool success, ) = winnerAddress.call{value: prize}("");
    require(success, "Transfer failed");
    
    // Reset state for next lottery
    delete players;
    commitmentActive = false;
    lotteryInProgress = false;
    randomCommitment = bytes32(0);
    commitmentTimestamp = 0;
    
    currentLotteryPhase = "Phase 3: Reveal complete - winner selected";
    
    // Emit winner event
    emit WinnerSelected(winnerAddress, prize, randomIndex);
}

// Event to emit when winner is selected
event WinnerSelected(
    address indexed winner,
    uint256 prize,
    uint256 randomIndex
);

function resetToPhase1() external onlyOwner {
    require(!lotteryInProgress, "Lottery still in progress");
    currentLotteryPhase = "Phase 1: Open for ticket sales";
}


    /// @notice Returns all current players in the lottery
    /// @return The list of player addresses
    function getPlayers() external view returns (address payable[] memory) {
        return players;
    }

    /// @notice Returns the owner of the contract
    /// @return The owner address
    function getManager() external view returns (address) {
        return owner;
    }

    /// @notice Returns the last winning address
    /// @return The last winner address
    function getLastWinner() external view returns (address) {
        return lastWinner;
    }

    /// @notice Returns the current balance of the contract
    /// @return The contract balance in wei
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

