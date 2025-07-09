import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  isAuthenticated, 
  getAccessToken, 
  clearTokens, 
  refreshAccessToken,
  logout as authLogout 
} from '../utils/auth';

interface User {
  email?: string;
  name?: string;
  sub: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuth, setIsAuth] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Parse user info from JWT token
  const parseUserFromToken = (accessToken: string): User | null => {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      return {
        sub: payload.sub,
        email: payload.email,
        name: payload.name || payload.preferred_username
      };
    } catch (error) {
      console.error('Error parsing token:', error);
      return null;
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (isAuthenticated()) {
          const accessToken = getAccessToken();
          if (accessToken) {
            setToken(accessToken);
            setUser(parseUserFromToken(accessToken));
            setIsAuth(true);
          }
        } else {
          // Try to refresh token if available
          try {
            await refreshAccessToken();
            const accessToken = getAccessToken();
            if (accessToken) {
              setToken(accessToken);
              setUser(parseUserFromToken(accessToken));
              setIsAuth(true);
            }
          } catch (error) {
            // Refresh failed, user needs to login
            clearTokens();
            setIsAuth(false);
            setUser(null);
            setToken(null);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuth(false);
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async () => {
    const { generateAuthUrl } = await import('../utils/auth');
    const authUrl = await generateAuthUrl();
    window.location.href = authUrl;
  };

  const logout = async () => {
    try {
      await authLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsAuth(false);
      setUser(null);
      setToken(null);
      // Redirect to home page
      window.location.href = '/';
    }
  };

  const refreshToken = async () => {
    try {
      await refreshAccessToken();
      const accessToken = getAccessToken();
      if (accessToken) {
        setToken(accessToken);
        setUser(parseUserFromToken(accessToken));
        setIsAuth(true);
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  const value: AuthContextType = {
    isAuthenticated: isAuth,
    user,
    token,
    loading,
    login,
    logout,
    refreshToken
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 