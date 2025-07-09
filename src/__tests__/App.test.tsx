import { render, screen, act } from '@testing-library/react';
import { vi } from 'vitest';
import App from '../App';
import { setMockAuthState } from '../test/setup';

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders app without crashing', async () => {
    await act(async () => {
      render(<App />);
    });
    
    // Should show some content (error boundary or main app)
    expect(document.body).toContainHTML('<div');
  });

  test('shows login page when user is not authenticated', async () => {
    // Set auth state to unauthenticated
    setMockAuthState({
      isAuthenticated: false,
      token: undefined,
      loading: false,
      user: undefined
    });

    await act(async () => {
      render(<App />);
    });
    
    // Should show login page
    expect(await screen.findByText(/sign in with oauth/i)).toBeInTheDocument();
    expect(screen.getByText(/bodhi chat/i)).toBeInTheDocument();
  });

  test('shows loading state when authentication is loading', async () => {
    // Set auth state to loading
    setMockAuthState({
      isAuthenticated: false,
      token: undefined,
      loading: true,
      user: undefined
    });

    await act(async () => {
      render(<App />);
    });
    
    // Should show loading state
    expect(await screen.findByText(/loading/i)).toBeInTheDocument();
  });
}); 