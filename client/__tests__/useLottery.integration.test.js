import { renderHook, waitFor } from '@testing-library/react';
import { useLottery } from '../hooks/useLottery';
import { ethers } from 'ethers';

jest.mock('../lib/contract', () => ({
  getContractWithProvider: jest.fn(),
  getContractWithSigner: jest.fn(),
}));

describe('useLottery Hook - Integration Tests', () => {
  let mockProvider;
  let mockSigner;
  let mockContract;
  const mockAccount = '0x1234567890123456789012345678901234567890';
  const mockOwner = '0x0987654321098765432109876543210987654321';

  beforeEach(() => {
    jest.clearAllMocks();

    mockContract = {
      ticketPrice: jest.fn().mockResolvedValue(ethers.parseEther('0.1')),
      getBalance: jest.fn().mockResolvedValue(ethers.parseEther('0.5')),
      getPlayers: jest.fn().mockResolvedValue([mockAccount, mockAccount]),
      getLastWinner: jest.fn().mockResolvedValue(ethers.ZeroAddress),
      owner: jest.fn().mockResolvedValue(mockOwner),
      currentLotteryPhase: jest.fn().mockResolvedValue('Phase 1: Open for ticket sales'),
      lotteryInProgress: jest.fn().mockResolvedValue(false),
      commitmentActive: jest.fn().mockResolvedValue(false),
      commitmentTimestamp: jest.fn().mockResolvedValue(BigInt(0)),
      REVEAL_DEADLINE: jest.fn().mockResolvedValue(BigInt(86400)),
      buyTicket: jest.fn().mockResolvedValue({ hash: '0xabc', wait: jest.fn().mockResolvedValue({}) }),
      pickWinner: jest.fn().mockResolvedValue({ hash: '0xdef', wait: jest.fn().mockResolvedValue({}) }),
      commitRandomness: jest.fn().mockResolvedValue({ hash: '0x123', wait: jest.fn().mockResolvedValue({}) }),
      revealAndPickWinner: jest.fn().mockResolvedValue({ hash: '0x456', wait: jest.fn().mockResolvedValue({}) }),
      resetToPhase1: jest.fn().mockResolvedValue({ hash: '0x789', wait: jest.fn().mockResolvedValue({}) }),
    };

    mockProvider = {
      getCode: jest.fn().mockResolvedValue('0x1234'),
    };
    mockSigner = {};

    const { getContractWithProvider, getContractWithSigner } = require('../lib/contract');
    getContractWithProvider.mockReturnValue(mockContract);
    getContractWithSigner.mockReturnValue(mockContract);
  });

  describe('Initial State Loading', () => {
    it('should load all contract data on mount', async () => {
      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.ticketPrice).toBe('0.1000');
      expect(result.current.jackpot).toBe('0.5000');
      expect(result.current.playersCount).toBe(2);
      expect(result.current.lotteryPhase).toBe('Phase 1: Open for ticket sales');
      expect(result.current.lotteryInProgress).toBe(false);
      expect(result.current.commitmentActive).toBe(false);
    });

    it('should detect owner correctly', async () => {
      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockOwner));

      await waitFor(() => {
        expect(result.current.isOwner).toBe(true);
      });
    });

    it('should detect non-owner correctly', async () => {
      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

      await waitFor(() => {
        expect(result.current.isOwner).toBe(false);
      });
    });
  });

  describe('Phase State Management', () => {
    it('should reflect Phase 1 state correctly', async () => {
      mockContract.currentLotteryPhase.mockResolvedValue('Phase 1: Open for ticket sales');
      mockContract.lotteryInProgress.mockResolvedValue(false);
      mockContract.commitmentActive.mockResolvedValue(false);

      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

      await waitFor(() => {
        expect(result.current.lotteryPhase).toBe('Phase 1: Open for ticket sales');
        expect(result.current.lotteryInProgress).toBe(false);
        expect(result.current.commitmentActive).toBe(false);
      });
    });

    it('should reflect Phase 2 state after commit', async () => {
      mockContract.currentLotteryPhase.mockResolvedValue('Phase 2: Commitment active - waiting to reveal');
      mockContract.lotteryInProgress.mockResolvedValue(true);
      mockContract.commitmentActive.mockResolvedValue(true);

      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

      await waitFor(() => {
        expect(result.current.lotteryPhase).toContain('Phase 2');
        expect(result.current.lotteryInProgress).toBe(true);
        expect(result.current.commitmentActive).toBe(true);
      });
    });

    it('should reflect Phase 3 state after reveal', async () => {
      mockContract.currentLotteryPhase.mockResolvedValue('Phase 3: Reveal complete - winner selected');
      mockContract.lotteryInProgress.mockResolvedValue(true);
      mockContract.commitmentActive.mockResolvedValue(false);

      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

      await waitFor(() => {
        expect(result.current.lotteryPhase).toContain('Phase 3');
        expect(result.current.lotteryInProgress).toBe(true);
        expect(result.current.commitmentActive).toBe(false);
      });
    });
  });

  describe('Commit-Reveal Functions', () => {
    it('should commit randomness with valid seed', async () => {
      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockOwner));

      await waitFor(() => {
        expect(result.current.isOwner).toBe(true);
      });

      const response = await result.current.commitRandomness('test-seed-12345');

      expect(response.success).toBe(true);
      expect(response.hash).toBe('0x123');
      expect(mockContract.commitRandomness).toHaveBeenCalledWith(
        ethers.keccak256(ethers.toUtf8Bytes('test-seed-12345'))
      );
    });

    it('should reveal and pick winner with seed', async () => {
      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockOwner));

      await waitFor(() => {
        expect(result.current.isOwner).toBe(true);
      });

      const response = await result.current.revealAndPickWinner('test-seed-12345');

      expect(response.success).toBe(true);
      expect(response.hash).toBe('0x456');
      expect(mockContract.revealAndPickWinner).toHaveBeenCalledWith('test-seed-12345');
    });

    it('should reset to Phase 1', async () => {
      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockOwner));

      await waitFor(() => {
        expect(result.current.isOwner).toBe(true);
      });

      const response = await result.current.resetToPhase1();

      expect(response.success).toBe(true);
      expect(response.hash).toBe('0x789');
      expect(mockContract.resetToPhase1).toHaveBeenCalled();
    });

    it('should throw error when non-owner tries to commit', async () => {
      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

      await waitFor(() => {
        expect(result.current.isOwner).toBe(false);
      });

      await expect(
        result.current.commitRandomness('test-seed')
      ).rejects.toThrow('Only the contract owner can commit randomness');
    });

    it('should throw error when non-owner tries to reveal', async () => {
      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

      await waitFor(() => {
        expect(result.current.isOwner).toBe(false);
      });

      await expect(
        result.current.revealAndPickWinner('test-seed')
      ).rejects.toThrow('Only the contract owner can reveal and pick winner');
    });
  });

  describe('User Ticket Management', () => {
    it('should count user tickets correctly', async () => {
      mockContract.getPlayers.mockResolvedValue([
        mockAccount,
        mockAccount,
        '0xOtherAddress',
        mockAccount,
      ]);

      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const userTickets = await result.current.getUserTickets();
      expect(userTickets).toBe(3);
    });

    it('should return 0 tickets for user with no tickets', async () => {
      mockContract.getPlayers.mockResolvedValue([
        '0xOtherAddress1',
        '0xOtherAddress2',
      ]);

      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const userTickets = await result.current.getUserTickets();
      expect(userTickets).toBe(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle contract errors gracefully', async () => {
      mockContract.ticketPrice.mockRejectedValue(new Error('Contract not found'));
      mockProvider.getCode.mockResolvedValue('0x1234');

      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

      await waitFor(() => {
        expect(result.current.error).toBe('Contract not found');
        expect(result.current.isLoading).toBe(false);
      });
    });

    it('should handle missing provider', async () => {
      const { result } = renderHook(() => useLottery(null, null, null));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.ticketPrice).toBe('0.1');
      expect(result.current.jackpot).toBe('0');
    });
  });

  describe('Buy Ticket Function', () => {
    it('should buy single ticket', async () => {
      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const response = await result.current.buyTicket(1);

      expect(response.success).toBe(true);
      expect(response.hash).toBe('0xabc');
      expect(mockContract.buyTicket).toHaveBeenCalled();
    });

    it('should calculate correct price for multiple tickets', async () => {
      mockContract.ticketPrice.mockResolvedValue(ethers.parseEther('0.1'));

      const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      await result.current.buyTicket(3);

      const callArgs = mockContract.buyTicket.mock.calls[0][0];
      expect(callArgs.value).toBe(ethers.parseEther('0.3'));
    });
  });
});
