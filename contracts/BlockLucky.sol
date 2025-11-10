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

    /// @notice Restricts function access to the contract owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    /// @notice Initializes the lottery with the deployer as the owner and sets the ticket price
    constructor() {
        owner = msg.sender;
        ticketPrice = 0.1 ether;
    }

    /// @notice Allows users to buy a lottery ticket by paying the exact ticket price
    /// @dev Reverts if the sent value differs from the ticket price
    function buyTicket() external payable {
        require(msg.value == ticketPrice, "Incorrect ticket price");
        players.push(payable(msg.sender));
    }

    /// @notice Picks a winner from the current players and transfers the contract balance
    /// @dev Uses block variables for pseudo-randomness, which are predictable; only for prototypes
    function pickWinner() external onlyOwner {
        require(players.length > 0, "No players");

        uint256 randomIndex = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.difficulty, players.length)
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

