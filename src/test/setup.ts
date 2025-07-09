import { vi } from 'vitest';
import '@testing-library/jest-dom';
import React from 'react';

// Suppress React Router future flag warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  if (
    typeof args[0] === 'string' && 
    (args[0].includes('React Router Future Flag Warning') ||
     args[0].includes('React Router will begin wrapping state updates'))
  ) {
    return;
  }
  originalWarn(...args);
};

// Mock AuthContext
const mockAuthContext = {
  isAuthenticated: true,
  user: { sub: 'test-user', email: 'test@example.com', name: 'Test User' },
  token: 'mock-access-token',
  loading: false,
  login: vi.fn(),
  logout: vi.fn(),
  refreshToken: vi.fn()
};

// Mock the AuthContext module
vi.mock('../contexts/AuthContext', () => ({
  useAuth: vi.fn(() => mockAuthContext),
  AuthProvider: ({ children }: { children: React.ReactNode }) => React.createElement('div', { 'data-testid': 'mock-auth-provider' }, children)
}));

// Mock useExtension hook
const mockExtensionState = {
  status: 'available',
  isInstalled: true,
  ready: true,
  error: null
};

vi.mock('../hooks/useExtension', () => ({
  useExtensionStatus: vi.fn(() => ({
    loading: false,
    ready: true,
    error: null,
    status: 'available',
    retry: vi.fn()
  })),
  useExtension: vi.fn(() => ({
    ...mockExtensionState,
    retry: vi.fn(),
    isChecking: false,
    isAvailable: true,
    isUnavailable: false,
    hasTimedOut: false
  })),
  useExtensionReady: vi.fn(() => true),
  __setMockExtensionState: (newState: any) => {
    Object.assign(mockExtensionState, newState);
  }
}));

// Mock useModels hook
vi.mock('../hooks/useModels', () => ({
  useModels: vi.fn(() => ({
    models: [
      { id: 'test-model-1', name: 'Test Model 1' },
      { id: 'test-model-2', name: 'Test Model 2' }
    ],
    loading: false,
    error: null,
    refetch: vi.fn()
  }))
}));

// Global mock for @bodhiapp/bodhijs
vi.mock('@bodhiapp/bodhijs', () => ({
  // Extension detection functions
  isInstalled: vi.fn(() => true),
  waitForExtension: vi.fn(() => Promise.resolve({ status: 'available', isInstalled: true, ready: true, error: null })),
  getExtensionState: vi.fn(() => ({ status: 'available', isInstalled: true, ready: true, error: null })),
  onExtensionStatusChange: vi.fn(() => () => { }), // Returns unsubscribe function
  initializeExtensionDetection: vi.fn(() => Promise.resolve({ status: 'available', isInstalled: true, ready: true, error: null })),

  // Server availability
  isServerAvailable: vi.fn(() => Promise.resolve(true)),

  // API functions
  ping: vi.fn(() => Promise.resolve({ message: 'pong' })),
  sendApiRequest: vi.fn(() => Promise.resolve({
    status: 200,
    data: {
      data: [
        { id: 'test-model-1', name: 'Test Model 1' },
        { id: 'test-model-2', name: 'Test Model 2' }
      ]
    }
  })),

  // Chat functions
  chat: {
    completions: {
      create: vi.fn()
    }
  },

  // Error classes
  BodhiError: class BodhiError extends Error {
    constructor(message: string, public code: string) {
      super(message);
    }
  },

  // Error codes
  ErrorCode: {
    EXTENSION_NOT_INSTALLED: 'EXTENSION_NOT_INSTALLED',
    SERVER_UNAVAILABLE: 'SERVER_UNAVAILABLE',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR'
  }
}));

// Mock auth utilities
vi.mock('../utils/auth', () => ({
  isAuthenticated: vi.fn(() => true),
  getAccessToken: vi.fn(() => 'mock-access-token'),
  clearTokens: vi.fn(),
  refreshAccessToken: vi.fn(() => Promise.resolve()),
  logout: vi.fn(() => Promise.resolve()),
  generateAuthUrl: vi.fn(() => Promise.resolve('http://mock-auth-url')),
  generatePKCEChallenge: vi.fn(() => Promise.resolve({
    codeVerifier: 'mock-verifier',
    codeChallenge: 'mock-challenge'
  })),
  exchangeCodeForTokens: vi.fn(() => Promise.resolve({
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token'
  }))
}));

// Export helper to update mock auth state
export const setMockAuthState = (newState: Partial<typeof mockAuthContext>) => {
  Object.assign(mockAuthContext, newState);
};

// Mock window.bodhiext for tests
Object.defineProperty(window, 'bodhiext', {
  value: {
    getExtensionId: vi.fn(),
    ping: vi.fn(),
    api: {
      request: vi.fn(),
    },
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
  },
  writable: true,
});

// Global test utilities
(globalThis as typeof globalThis & { ResizeObserver: unknown }).ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock scrollIntoView for chat interface tests
Element.prototype.scrollIntoView = vi.fn(); 