// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title BlockLucky - Lottery contract with automatic draw conditions
/// @notice Players buy tickets with ETH; when a threshold or deadline is reached, a winner is selected automatically.
/// @dev Pseudo-randomness is used for educational purposes only – not production safe.
contract BlockLucky {
    struct RoundSummary {
        uint256 roundId;
        address winner;
        uint256 prize;
        uint256 ticketCount;
        uint256 completedAt;
    }

    address public owner;
    uint256 public ticketPrice;
    address payable[] private players;
    address public lastWinner;

    uint256 public maxParticipants;
    uint256 public roundDuration;
    uint256 public roundDeadline;
    uint256 public roundId;
    bool public roundActive;

    string public currentLotteryPhase;

    RoundSummary[] private roundHistory;

    uint256 private locked = 1;

    event TicketPurchased(address indexed player, uint256 indexed roundId, uint256 ticketNumber, uint256 value);
    event WinnerSelected(address indexed winner, uint256 prize, uint256 ticketCount, uint256 indexed roundId);
    event RoundConfigured(uint256 indexed roundId, uint256 maxParticipants, uint256 deadline, uint256 duration);
    event RoundForced(address indexed caller, uint256 indexed roundId, string reason);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    modifier nonReentrant() {
        require(locked == 1, "Reentrancy");
        locked = 2;
        _;
        locked = 1;
    }

    constructor() {
        owner = msg.sender;
        ticketPrice = 0.1 ether;
        maxParticipants = 5;
        roundDuration = 1 hours;
        roundId = 1;
        _scheduleNextRound();
    }

    /// @notice Owner can adjust ticket price, participant threshold and duration between draws.
    function updateConfiguration(uint256 _ticketPrice, uint256 _maxParticipants, uint256 _roundDuration) external onlyOwner {
        require(_ticketPrice > 0, "Ticket price must be > 0");
        require(_maxParticipants >= 2, "At least 2 participants");
        require(_roundDuration >= 5 minutes, "Duration too small");

        ticketPrice = _ticketPrice;
        maxParticipants = _maxParticipants;
        roundDuration = _roundDuration;

        if (roundActive) {
            roundDeadline = block.timestamp + roundDuration;
            emit RoundConfigured(roundId, maxParticipants, roundDeadline, roundDuration);
        }
    }

    /// @notice Buy a ticket for the current round.
    function buyTicket() external payable nonReentrant {
        require(roundActive, "Round closed");
        require(block.timestamp <= roundDeadline, "Deadline passed");
        require(msg.value == ticketPrice, "Incorrect ticket price");

        players.push(payable(msg.sender));
        emit TicketPurchased(msg.sender, roundId, players.length - 1, msg.value);

        if (players.length >= maxParticipants) {
            _finalizeRound("MAX_PARTICIPANTS");
        } else if (block.timestamp >= roundDeadline) {
            _finalizeRound("DEADLINE_REACHED");
        } else {
            currentLotteryPhase = "Phase 1: Collecte des billets";
        }
    }

    /// @notice Allows anyone to trigger the draw if the deadline has passed.
    function forceDraw() external nonReentrant {
        require(roundActive, "No active round");
        require(block.timestamp >= roundDeadline, "Deadline not reached");
        _finalizeRound("FORCED");
        emit RoundForced(msg.sender, roundId - 1, "DEADLINE");
    }

    /// @notice Returns the list of active players for the current round.
    function getPlayers() external view returns (address payable[] memory) {
        return players;
    }

    /// @notice Returns the total balance held by the contract.
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    /// @notice Number of completed rounds stored in history.
    function getRoundCount() external view returns (uint256) {
        return roundHistory.length;
    }

    /// @notice Returns information about a completed round.
    function getRoundSummary(uint256 index) external view returns (RoundSummary memory) {
        require(index < roundHistory.length, "Round out of bounds");
        return roundHistory[index];
    }

    /// @notice Convenience method for the latest round summary.
    function getLatestRound() external view returns (RoundSummary memory) {
        require(roundHistory.length > 0, "No rounds completed");
        return roundHistory[roundHistory.length - 1];
    }

    function _finalizeRound(string memory reason) internal {
        if (!roundActive) {
            return;
        }

        roundActive = false;
        currentLotteryPhase = "Phase 2: Tirage en cours";

        if (players.length == 0) {
            _scheduleNextRound();
            return;
        }

        uint256 randomIndex = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.prevrandao, players.length, roundId, reason)
            )
        ) % players.length;

        address payable winnerAddress = players[randomIndex];
        uint256 prize = address(this).balance;

        (bool success, ) = winnerAddress.call{value: prize}("");
        require(success, "Transfer failed");

        lastWinner = winnerAddress;

        emit WinnerSelected(winnerAddress, prize, players.length, roundId);

        roundHistory.push(
            RoundSummary({
                roundId: roundId,
                winner: winnerAddress,
                prize: prize,
                ticketCount: players.length,
                completedAt: block.timestamp
            })
        );

        delete players;

        roundId += 1;
        _scheduleNextRound();
    }

    function _scheduleNextRound() internal {
        roundDeadline = block.timestamp + roundDuration;
        roundActive = true;

        if (players.length == 0) {
            currentLotteryPhase = "Phase 1: Collecte des billets";
        }

        emit RoundConfigured(roundId, maxParticipants, roundDeadline, roundDuration);
    }
}

