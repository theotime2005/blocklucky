# Quick Test Guide - BlockLucky Integration

## 🚀 Super Quick - Run ALL Tests

### From Project Root (Easiest!)
```bash
npm test
```
This runs both contract and frontend tests automatically! ✅

---

## 📋 Individual Test Commands

### 1. Contract Tests (from root)
```bash
npm run test:contracts
```
**Or from blocks directory:**
```bash
cd blocks
npm test
```

Expected: **41 tests passing** (27 unit + 14 integration) ✅

---

### 2. Frontend Tests (from root)
```bash
npm run test:frontend
```
**Or from client directory:**
```bash
cd client
npm test
```

Expected: **Tests passing** ✅

---

### 3. End-to-End Test (requires Hardhat node)

**Terminal 1 - Start Hardhat Node:**
```bash
cd blocks
npx hardhat node
```

**Terminal 2 - Run E2E Test:**
```bash
# From root
npm run test:e2e

# Or from blocks directory
cd blocks
npm run test:e2e
```

Expected: Visual output showing complete lottery cycle ✅

---

## 🎯 Available Commands

### From Project Root
| Command | Description |
|---------|-------------|
| `npm test` | Run all contract + frontend tests |
| `npm run test:contracts` | Run only contract tests |
| `npm run test:frontend` | Run only frontend tests |
| `npm run test:e2e` | Run E2E test (needs hardhat node) |
| `npm run test:all` | Same as `npm test` with completion message |

### From blocks/ Directory
| Command | Description |
|---------|-------------|
| `npm test` | Run all contract tests (unit + integration) |
| `npm run test:unit` | Run only unit tests |
| `npm run test:integration` | Run only integration tests |
| `npm run test:e2e` | Run E2E test (needs hardhat node) |

### From client/ Directory
| Command | Description |
|---------|-------------|
| `npm test` | Run all frontend tests |
| `npm run test:integration` | Run only integration tests |
| `npm run test:watch` | Run tests in watch mode |

---

## ✅ Success Indicators

**All tests pass if you see:**
- ✓ Green checkmarks
- "passing" messages
- No red error messages
- Final summary: "X passing"

---

## 🔥 Most Common Workflows

### Quick Check (30 seconds)
```bash
npm test
```

### Full Check with E2E (2 minutes)
```bash
# Terminal 1
cd blocks && npx hardhat node

# Terminal 2
npm test && npm run test:e2e
```

### Watch Mode (Development)
```bash
# Terminal 1 - Contract tests
cd blocks && npm test -- --watch

# Terminal 2 - Frontend tests
cd client && npm run test:watch
```

---

## 📊 What's Being Tested?

✅ **Contract Tests (41 total)**
- 27 unit tests (commit-reveal logic)
- 14 integration tests (frontend compatibility)

✅ **Frontend Tests**
- Hook integration
- State management
- Function calls
- Error handling

✅ **E2E Test**
- Complete lottery cycle
- Visual output with emojis
- Balance verification
- Event checking

---

## 🐛 Quick Troubleshooting

### "Command not found" errors
```bash
npm install
cd blocks && npm install
cd ../client && npm install
```

### "Network error" (E2E test)
Make sure Hardhat node is running:
```bash
cd blocks && npx hardhat node
```

### Tests fail randomly
```bash
# Clean and rebuild
cd blocks
npx hardhat clean
npx hardhat compile
npm test
```

---

## 🎉 Expected Output

When you run `npm test` from root:

```
> blocklucky@1.0.0 test
> npm run test:contracts && npm run test:frontend

> blocklucky@1.0.0 test:contracts
> cd blocks && npm test

  BlockLucky
    ✓ deploys with correct owner and ticket price
    ✓ allows a player to buy a ticket with exact price
    ... (27 passing)

  BlockLucky Integration Tests
    ✓ should expose all frontend-required view functions
    ... (14 passing)

  41 passing (3s)

> blocklucky@1.0.0 test:frontend
> cd client && npm test

  useLottery Hook - Integration Tests
    ✓ should load all contract data on mount
    ... (18 passing)

✅ All tests completed!
```

---

See [TEST_INSTRUCTIONS.md](TEST_INSTRUCTIONS.md) for detailed explanations and troubleshooting.
