import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await login();
    } catch (error) {
      console.error('Login error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h1>Bodhi Chat</h1>
          <p>AI-Powered Web Chat</p>
        </div>

        <div className="login-content">
          <h2>Welcome</h2>
          <p>Please sign in to access the chat interface.</p>
          
          <button 
            className="login-button"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="button-spinner"></div>
                Signing in...
              </>
            ) : (
              'Sign in with OAuth'
            )}
          </button>
        </div>

        <div className="login-footer">
          <p>Secure authentication powered by Keycloak</p>
        </div>
      </div>
    </div>
  );
} 