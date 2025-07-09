import { renderHook, act } from '@testing-library/react';
import { vi } from 'vitest';
import { useChat } from '../../hooks/useChat';
import * as bodhijs from '@bodhiapp/bodhijs';
import { setMockAuthState } from '../../test/setup';

describe('useChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset auth state to authenticated for most tests
    setMockAuthState({
      isAuthenticated: true,
      token: 'mock-access-token',
      loading: false,
      user: { sub: 'test-user', email: 'test@example.com', name: 'Test User' }
    });
  });

  test('initializes with empty state', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('newChat clears all state', () => {
    const { result } = renderHook(() => useChat());

    act(() => {
      result.current.newChat();
    });

    expect(result.current.messages).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  test('sendMessage adds user message and handles response', async () => {
    const mockResponse = {
      status: 200,
      data: {
        id: 'test-1',
        object: 'chat.completion',
        created: Date.now(),
        model: 'test-model',
        choices: [{
          index: 0,
          message: {
            role: 'assistant',
            content: 'Hello world'
          },
          finish_reason: 'stop'
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15
        }
      }
    };

    vi.mocked(bodhijs.sendApiRequest).mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      const response = await result.current.sendMessage('Test message', 'test-model');
      expect(response.success).toBe(true);
    });

    expect(result.current.messages).toHaveLength(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('Test message');
    expect(result.current.messages[1].role).toBe('assistant');
    expect(result.current.messages[1].content).toBe('Hello world');
    expect(result.current.loading).toBe(false);
  });

  test('handles chat errors gracefully', async () => {
    // Suppress console.error for this test since we're intentionally throwing an error
    const originalConsoleError = console.error;
    console.error = vi.fn();

    const error = new bodhijs.BodhiError('Test error', bodhijs.ErrorCode.SERVER_UNAVAILABLE);
    vi.mocked(bodhijs.sendApiRequest).mockRejectedValue(error);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      const response = await result.current.sendMessage('Test message', 'test-model');
      expect(response.success).toBe(false);
      expect(response.error).toContain('server is not running');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.messages).toHaveLength(0); // User message removed on failure

    // Restore console.error
    console.error = originalConsoleError;
  });

  test('handles unauthenticated state', async () => {
    // Set auth state to unauthenticated
    setMockAuthState({
      isAuthenticated: false,
      token: undefined,
      loading: false,
      user: undefined
    });

    const { result } = renderHook(() => useChat());

    await act(async () => {
      const response = await result.current.sendMessage('Test message', 'test-model');
      expect(response.success).toBe(false);
      expect(response.error).toBe('Authentication required');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe('Authentication required');
  });
}); 