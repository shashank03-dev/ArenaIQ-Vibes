import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSocket } from './useSocket';
import { io } from 'socket.io-client';

// Mock socket.io-client
vi.mock('socket.io-client', () => {
  return {
    io: vi.fn(),
  };
});

describe('useSocket Hook', () => {
  let mockSocket;

  beforeEach(() => {
    vi.useFakeTimers();
    mockSocket = {
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    };
    io.mockReturnValue(mockSocket);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes socket connection', () => {
    renderHook(() => useSocket());
    expect(io).toHaveBeenCalled();
    expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('state_update', expect.any(Function));
    expect(mockSocket.on).toHaveBeenCalledWith('fan_alert', expect.any(Function));
  });

  it('updates isConnected state', () => {
    const { result } = renderHook(() => useSocket());
    
    // Default state
    expect(result.current.isConnected).toBe(false);

    // Find the 'connect' callback and call it
    const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')[1];
    
    act(() => {
      connectCallback();
    });

    expect(result.current.isConnected).toBe(true);

    // Find the 'disconnect' callback and call it
    const disconnectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'disconnect')[1];
    
    act(() => {
      disconnectCallback();
    });

    expect(result.current.isConnected).toBe(false);
  });

  it('updates gameState', () => {
    const { result } = renderHook(() => useSocket());
    
    expect(result.current.gameState).toBeNull();

    const stateUpdateCallback = mockSocket.on.mock.calls.find(call => call[0] === 'state_update')[1];
    const mockState = { score: { home: 10, away: 5 } };
    
    act(() => {
      stateUpdateCallback(mockState);
    });

    expect(result.current.gameState).toEqual(mockState);
  });

  it('updates fanAlert and clears it after 10 seconds', () => {
    const { result } = renderHook(() => useSocket());
    
    expect(result.current.fanAlert).toBeNull();

    const fanAlertCallback = mockSocket.on.mock.calls.find(call => call[0] === 'fan_alert')[1];
    const mockAlert = { message: 'Test alert' };
    
    act(() => {
      fanAlertCallback(mockAlert);
    });

    expect(result.current.fanAlert).toEqual(mockAlert);

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    expect(result.current.fanAlert).toBeNull();
  });

  it('simulates rush when connected', () => {
    const { result } = renderHook(() => useSocket());
    
    act(() => {
      result.current.simulateRush();
    });

    expect(mockSocket.emit).toHaveBeenCalledWith('simulate_rush');
  });

  it('disconnects on unmount', () => {
    const { unmount } = renderHook(() => useSocket());
    unmount();
    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
