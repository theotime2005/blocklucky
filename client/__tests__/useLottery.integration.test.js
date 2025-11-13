import { renderHook, waitFor } from '@testing-library/react';
import { ethers } from 'ethers';
import { useLottery } from '../hooks/useLottery';

jest.mock('../lib/contract', () => ({
  getContractWithProvider: jest.fn(),
  getContractWithSigner: jest.fn(),
}));

describe('useLottery Hook - Integration Tests', () => {
  const mockAccount = '0x1234567890123456789012345678901234567890';
  const mockOwner = '0x0987654321098765432109876543210987654321';

  let mockProvider;
  let mockSigner;
  let mockContract;

  beforeEach(() => {
    jest.clearAllMocks();

    mockContract = {
      ticketPrice: jest.fn().mockResolvedValue(ethers.parseEther('0.1')),
      getBalance: jest.fn().mockResolvedValue(ethers.parseEther('0.5')),
      getPlayers: jest.fn().mockResolvedValue([mockAccount, mockAccount]),
      lastWinner: jest.fn().mockResolvedValue(ethers.ZeroAddress),
      owner: jest.fn().mockResolvedValue(mockOwner),
      currentLotteryPhase: jest.fn().mockResolvedValue('Phase 1: Collecte des billets'),
      maxParticipants: jest.fn().mockResolvedValue(BigInt(5)),
      roundDeadline: jest.fn().mockResolvedValue(BigInt(Math.floor(Date.now() / 1000) + 600)),
      roundDuration: jest.fn().mockResolvedValue(BigInt(600)),
      roundActive: jest.fn().mockResolvedValue(true),
      roundId: jest.fn().mockResolvedValue(BigInt(1)),
      getRoundCount: jest.fn().mockResolvedValue(BigInt(0)),
      getRoundSummary: jest.fn(),
      buyTicket: jest.fn().mockResolvedValue({ hash: '0xabc', wait: jest.fn().mockResolvedValue({}) }),
      forceDraw: jest.fn().mockResolvedValue({ hash: '0xdef', wait: jest.fn().mockResolvedValue({}) }),
      updateConfiguration: jest.fn().mockResolvedValue({ hash: '0x999', wait: jest.fn().mockResolvedValue({}) }),
    };

    mockProvider = {
      getCode: jest.fn().mockResolvedValue('0x1234'),
    };
    mockSigner = {};

    const { getContractWithProvider, getContractWithSigner } = require('../lib/contract');
    getContractWithProvider.mockReturnValue(mockContract);
    getContractWithSigner.mockReturnValue(mockContract);
  });

  it('loads contract data on mount', async () => {
    const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.ticketPrice).toBe('0.1000');
    expect(result.current.jackpot).toBe('0.5000');
    expect(result.current.playersCount).toBe(2);
    expect(result.current.lotteryPhase).toBe('Phase 1: Collecte des billets');
    expect(result.current.maxParticipants).toBe(5);
    expect(result.current.roundActive).toBe(true);
  });

  it('identifies owner correctly', async () => {
    const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockOwner));
    await waitFor(() => expect(result.current.isOwner).toBe(true));
  });

  it('loads history when rounds exist', async () => {
    mockContract.getRoundCount.mockResolvedValue(BigInt(2));
    mockContract.getRoundSummary
      .mockResolvedValueOnce({
        roundId: BigInt(1),
        winner: mockAccount,
        prize: ethers.parseEther('0.4'),
        ticketCount: BigInt(4),
        completedAt: BigInt(1700000000),
      })
      .mockResolvedValueOnce({
        roundId: BigInt(2),
        winner: mockOwner,
        prize: ethers.parseEther('0.8'),
        ticketCount: BigInt(8),
        completedAt: BigInt(1700000500),
      });

    const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.roundHistory.length).toBe(2);
    expect(result.current.roundHistory[0].prize).toBe('0.8000');
  });

  it('buys tickets with signer', async () => {
    const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const response = await result.current.buyTicket(2);
    expect(response.success).toBe(true);
    expect(mockContract.buyTicket).toHaveBeenCalledWith({ value: ethers.parseEther('0.2') });
  });

  it('forces draw when requested', async () => {
    const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const response = await result.current.forceDraw();
    expect(response.success).toBe(true);
    expect(mockContract.forceDraw).toHaveBeenCalled();
  });

  it('updates configuration for owner', async () => {
    const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockOwner));
    await waitFor(() => expect(result.current.isOwner).toBe(true));

    const response = await result.current.updateConfiguration(ethers.parseEther('0.2'), 8, 1800);
    expect(response.success).toBe(true);
    expect(mockContract.updateConfiguration).toHaveBeenCalledWith(
      ethers.parseEther('0.2'),
      8,
      1800,
    );
  });

  it('counts user tickets correctly', async () => {
    mockContract.getPlayers.mockResolvedValue([
      mockAccount,
      mockAccount,
      '0xOtherAddress',
      mockAccount,
    ]);

    const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const tickets = await result.current.getUserTickets();
    expect(tickets).toBe(3);
  });

  it('handles generic contract errors gracefully', async () => {
    mockContract.ticketPrice.mockRejectedValue(new Error('Contract not found'));

    const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Contract not found');
  });

  it('reports RPC lookup failure when getCode fails', async () => {
    const rpcError = new Error('RPC unavailable');
    mockProvider.getCode.mockRejectedValue(rpcError);

    const { result } = renderHook(() => useLottery(mockProvider, mockSigner, mockAccount));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Impossible de vérifier le contrat sur le RPC configuré.');
  });

  it('uses the fallback provider when no provider is supplied', async () => {
    const mockGetCode = jest.fn().mockResolvedValue('0x1234');
    const providerSpy = jest
      .spyOn(ethers, 'JsonRpcProvider')
      .mockImplementation(() => ({ getCode: mockGetCode }));

    const { result } = renderHook(() => useLottery(null, mockSigner, mockAccount));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.ticketPrice).toBe('0.1000');
    expect(mockGetCode).toHaveBeenCalled();

    providerSpy.mockRestore();
  });

  it('falls back to zero jackpot when provider is missing', async () => {
    mockContract.getBalance.mockResolvedValue(ethers.parseEther('0'));

    const providerSpy = jest
      .spyOn(ethers, 'JsonRpcProvider')
      .mockImplementation(() => ({ getCode: jest.fn().mockResolvedValue('0x1234') }));

    const { result } = renderHook(() => useLottery(null, mockSigner, mockAccount));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.jackpot).toBe('0');

    providerSpy.mockRestore();
  });
});
