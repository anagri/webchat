import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { exchangeCodeForTokens } from '../utils/auth';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef(false); // Use ref to persist across re-renders
  const processedParamsRef = useRef<string | null>(null); // Track which params we've processed

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      // Create a unique key for this set of parameters
      const paramsKey = `${code}-${state}-${error}`;
      
      // Prevent duplicate execution using ref
      if (isProcessingRef.current || processedParamsRef.current === paramsKey) {
        return;
      }
      
      isProcessingRef.current = true;
      processedParamsRef.current = paramsKey;

      if (error) {
        setError(`Authentication failed: ${error}`);
        return;
      }

      if (!code || !state) {
        setError('Missing authorization code or state parameter');
        return;
      }

      try {
        await exchangeCodeForTokens(code, state);
        
        // Redirect to chat page on success
        navigate('/chat', { replace: true });
      } catch (err) {
        console.error('Auth callback error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
        setError(errorMessage);
      }
      // Note: Don't reset the flag - let it stay true to prevent any further calls
    };

    handleCallback();

    // Cleanup function to prevent execution if component unmounts
    return () => {
      isProcessingRef.current = true; // Prevent any pending execution
    };
  }, [searchParams, navigate]); // Keep dependencies but use ref to prevent duplicate execution

  if (error) {
    return (
      <div className="auth-callback">
        <div className="auth-callback-container">
          <h2>Authentication Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/login')}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-callback">
      <div className="auth-callback-container">
        <h2>Completing Authentication...</h2>
        <div className="loading-spinner"></div>
        <p>Please wait while we complete your sign-in.</p>
      </div>
    </div>
  );
};

export default AuthCallback; 