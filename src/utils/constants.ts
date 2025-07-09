// OAuth configuration constants with fallback values

export const OAUTH_DEFAULTS = {
  // Default client ID for the webchat application
  CLIENT_ID: 'app-e11ed4e1-8f68-4389-91f1-a31ef839ad4f',
  
  // Default OAuth scopes
  SCOPE: 'openid email profile roles scope_user_user',
  
  // Default redirect path (will be combined with window.location.origin)
  REDIRECT_PATH: '/auth',
  
  // Default auth URL (fallback - should be set in environment)
  AUTH_URL: 'https://nightly-id.getbodhi.app/realms/bodhi',
  
  // PKCE configuration
  CODE_VERIFIER_LENGTH: 128,
  STATE_LENGTH: 32,
  
  // Token storage keys (prefixed with webchat-)
  STORAGE_KEYS: {
    ACCESS_TOKEN: 'webchat-access-token',
    REFRESH_TOKEN: 'webchat-refresh-token',
    CODE_VERIFIER: 'webchat-code-verifier',
    STATE: 'webchat-state'
  }
} as const; 