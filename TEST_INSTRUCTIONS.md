# BlockLucky Integration Testing Guide

This guide explains how to run all tests to verify the backend integration with your frontend.

## Test Overview

We have created three types of tests:

1. **Smart Contract Tests** - Tests the commit-reveal logic in isolation
2. **Integration Tests** - Tests contract behavior as the frontend would use it
3. **End-to-End Test** - Simulates a complete lottery cycle with detailed output

---

## Prerequisites

Make sure you have:
- Hardhat node running (for E2E test)
- All dependencies installed

```bash
# Install contract dependencies
cd blocks
npm install

# Install frontend dependencies (for frontend tests)
cd ../client
npm install
```

---

## Running Tests

### 1. Smart Contract Tests (Hardhat)

These tests verify the core commit-reveal functionality of your smart contract.

```bash
cd blocks
npx hardhat test
```

**What it tests:**
- ✅ Contract deployment with correct initial state
- ✅ Ticket purchasing in Phase 1
- ✅ Commitment creation in Phase 2
- ✅ Winner selection in Phase 3
- ✅ Reset to Phase 1
- ✅ Access control (owner-only functions)
- ✅ Error handling (wrong seed, no players, etc.)
- ✅ Full multi-cycle lottery flows

**Expected output:**
```
  BlockLucky
    ✓ deploys with correct owner and ticket price
    ✓ allows a player to buy a ticket with exact price
    ✓ reverts when buying a ticket with incorrect value
    ... (more tests)

  27 passing (2s)
```

---

### 2. Integration Tests (Smart Contract)

These tests verify the contract behaves correctly from the frontend's perspective.

```bash
cd blocks
npx hardhat test test/Integration.test.js
```

**What it tests:**
- ✅ All frontend-required functions exist (ABI compatibility)
- ✅ Correct data types returned
- ✅ Phase transitions work as expected
- ✅ Players blocked during Phase 2
- ✅ Seed mismatch handling
- ✅ Multiple tickets per user
- ✅ Prize distribution
- ✅ Edge cases

**Expected output:**
```
  BlockLucky Integration Tests
    Frontend Integration - ABI Compatibility
      ✓ should expose all frontend-required view functions
      ✓ should return correct initial phase state
      ... (more tests)

  14 passing (1s)
```

---

### 3. Frontend Hook Tests (Jest)

These tests verify the `useLottery` hook integration logic.

```bash
cd client
npm test -- useLottery.integration.test.js
```

**What it tests:**
- ✅ Hook loads contract data correctly
- ✅ Owner detection works
- ✅ Phase state management
- ✅ `commitRandomness()` function
- ✅ `revealAndPickWinner()` function
- ✅ `resetToPhase1()` function
- ✅ User ticket counting
- ✅ Error handling

**Expected output:**
```
 PASS  __tests__/useLottery.integration.test.js
  useLottery Hook - Integration Tests
    Initial State Loading
      ✓ should load all contract data on mount
      ✓ should detect owner correctly
      ... (more tests)

Test Suites: 1 passed, 1 total
Tests:       18 passed, 18 total
```

---

### 4. End-to-End Integration Test (Live Simulation)

This test runs a complete lottery cycle on a local Hardhat network with detailed output.

**Step 1: Start Hardhat node** (in one terminal)
```bash
cd blocks
npx hardhat node
```

**Step 2: Run E2E test** (in another terminal)
```bash
cd blocks
npx hardhat run scripts/test-e2e.js --network localhost
```

**What it tests:**
- ✅ Full commit-reveal lottery cycle
- ✅ Multiple players buying tickets
- ✅ Phase transitions with state verification
- ✅ Players blocked during Phase 2
- ✅ Winner selection and prize distribution
- ✅ Event emissions
- ✅ Contract reset and new round

**Expected output:**
```
🧪 Starting End-to-End Integration Test

============================================================
📋 Test Accounts:
   Owner:   0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   Player1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
   ...

============================================================
🎯 PHASE 1: Ticket Sales
============================================================
   Current Phase: Phase 1: Open for ticket sales
   🎟️  Player 1 buying ticket...
   ✅ Player 1 bought ticket
   ...

============================================================
🔒 PHASE 2: Commit Randomness
============================================================
   🔐 Owner creating commitment with secret seed...
   📝 Commitment Hash: 0x...
   ✅ Commitment registered
   ...

============================================================
🎰 PHASE 3: Reveal & Pick Winner
============================================================
   🔓 Owner revealing seed and picking winner...
   🏆 Event 'WinnerSelected' emitted
   🎉 Winner Address: 0x...
   💸 Balance Changes:
      Player 3: +0.4 ETH 🏆
   ...

✅ END-TO-END TEST COMPLETED SUCCESSFULLY
```

---

## Running All Tests Together

Run this command to execute all backend tests:

```bash
cd blocks
npx hardhat test && npx hardhat test test/Integration.test.js
```

For frontend tests:
```bash
cd client
npm test -- useLottery.integration.test.js
```

---

## Understanding Test Results

### ✅ All Tests Pass
If all tests pass, your integration is working correctly! The frontend can:
- Read all contract state (phases, players, jackpot)
- Execute commit-reveal flow properly
- Handle errors gracefully
- Manage multiple lottery cycles

### ❌ Tests Fail

**Common issues:**

1. **"Contract not deployed" errors**
   - Make sure Hardhat node is running for E2E tests
   - Check contract address in `.env.local`

2. **"Function not found" errors**
   - ABI mismatch - contract was redeployed
   - Run: `cd blocks && npx hardhat clean && npx hardhat compile`

3. **"Seed does not match commitment" errors**
   - This is expected behavior - test verifies error handling
   - Should only fail if test logic is wrong

4. **Frontend tests timeout**
   - Mock issue - check that mocks in test file match actual contract
   - Increase Jest timeout if needed

---

## Test Files Location

```
blocks/
├── test/
│   ├── BlockLucky.test.js        # Core contract tests
│   └── Integration.test.js       # Integration tests
└── scripts/
    └── test-e2e.js               # End-to-end simulation

client/
└── __tests__/
    └── useLottery.integration.test.js  # Frontend hook tests
```

---

## What Each Test Verifies

### Contract Tests
- ✅ Deployment & initialization
- ✅ Ticket purchase logic
- ✅ Commit-reveal mechanism
- ✅ Winner selection algorithm
- ✅ Prize distribution
- ✅ Access control
- ✅ State transitions
- ✅ Error conditions

### Integration Tests
- ✅ ABI compatibility with frontend
- ✅ Return types match expectations
- ✅ Phase state management
- ✅ Multi-user scenarios
- ✅ Edge cases

### Frontend Tests
- ✅ Hook initialization
- ✅ Contract data loading
- ✅ Phase detection
- ✅ Owner detection
- ✅ Function calls
- ✅ Error propagation

### E2E Test
- ✅ Complete lottery cycle
- ✅ Real blockchain state
- ✅ Event emissions
- ✅ Balance changes
- ✅ User experience flow

---

## Continuous Testing

During development, you can run tests in watch mode:

```bash
# Contract tests (re-run on file changes)
cd blocks
npx hardhat test --watch

# Frontend tests (re-run on file changes)
cd client
npm test -- --watch useLottery.integration.test.js
```

---

## Troubleshooting

### Issue: "Cannot find module 'hardhat'"
**Solution:**
```bash
cd blocks
npm install
```

### Issue: Frontend tests fail with "Module not found"
**Solution:**
```bash
cd client
npm install
```

### Issue: E2E test shows "Network error"
**Solution:**
- Ensure Hardhat node is running: `npx hardhat node`
- Use `--network localhost` flag
- Check no other service is using port 8545

### Issue: "Nonce too high" errors
**Solution:**
- Restart Hardhat node
- Clear MetaMask activity data if testing with wallet

---

## Next Steps

After all tests pass:

1. ✅ Deploy contract to testnet (Sepolia)
2. ✅ Update `.env.local` with testnet address
3. ✅ Test with real wallet on testnet
4. ✅ Verify contract on Etherscan
5. ✅ Test frontend on testnet

---

## Questions?

If tests are failing and you're not sure why:
1. Check test output for specific error messages
2. Verify Hardhat node is running (for E2E)
3. Ensure contract was compiled: `npx hardhat compile`
4. Check ABI matches deployed contract
5. Verify environment variables in `.env.local`

Happy Testing! 🧪✨
