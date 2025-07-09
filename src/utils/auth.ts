// OAuth with PKCE utilities for Keycloak authentication
import { OAUTH_DEFAULTS } from './constants';

// Generate a random string for PKCE using crypto.getRandomValues for better security
function generateRandomString(length: number): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(array[i] % charset.length);
  }
  return result;
}

// Generate SHA256 hash and convert to base64url
async function sha256(plain: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(new Uint8Array(hash));
}

// Base64URL encode
function base64UrlEncode(array: Uint8Array): string {
  const base64 = btoa(String.fromCharCode(...array));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

// PKCE challenge generation
export async function generatePKCEChallenge(): Promise<{ codeVerifier: string; codeChallenge: string }> {
  const codeVerifier = generateRandomString(OAUTH_DEFAULTS.CODE_VERIFIER_LENGTH);
  const codeChallenge = await sha256(codeVerifier);
  
  return {
    codeVerifier,
    codeChallenge
  };
}

// OAuth configuration
export interface OAuthConfig {
  authUrl: string;
  clientId: string;
  redirectUri: string;
  scope: string;
}

export function getOAuthConfig(): OAuthConfig {
  const authUrl = OAUTH_DEFAULTS.AUTH_URL;
  if (!authUrl) {
    throw new Error('AUTH_URL must be configured in constants.ts');
  }

  const clientId = OAUTH_DEFAULTS.CLIENT_ID;

  return {
    authUrl: authUrl.replace(/\/$/, ''), // Remove trailing slash
    clientId,
    redirectUri: `${window.location.origin}${OAUTH_DEFAULTS.REDIRECT_PATH}`,
    scope: OAUTH_DEFAULTS.SCOPE
  };
}

// Generate authorization URL with stateless PKCE (encode verifier in state)
export async function generateAuthUrl(): Promise<string> {
  const config = getOAuthConfig();
  const { codeVerifier, codeChallenge } = await generatePKCEChallenge();
  
  // Generate a random state for security
  const randomState = generateRandomString(32);
  
  // Encode the code verifier and include it in the state for stateless PKCE
  const encodedVerifier = base64UrlEncode(new TextEncoder().encode(codeVerifier));
  const state = `${randomState}.${encodedVerifier}`;

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scope,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256'
  });

  return `${config.authUrl}/protocol/openid-connect/auth?${params.toString()}`;
}

// Decode base64url string
function base64UrlDecode(str: string): string {
  // Add padding if needed
  const padded = str + '='.repeat((4 - str.length % 4) % 4);
  // Replace URL-safe characters
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/');
  // Decode and convert to string
  return new TextDecoder().decode(Uint8Array.from(atob(base64), c => c.charCodeAt(0)));
}

// Exchange authorization code for tokens using stateless PKCE
export async function exchangeCodeForTokens(code: string, state: string): Promise<TokenResponse> {
  const config = getOAuthConfig();
  
  // Parse state to extract random part and encoded verifier
  const stateParts = state.split('.');
  if (stateParts.length !== 2) {
    throw new Error(`Invalid state format. Expected: randomPart.encodedVerifier, Received: ${state}`);
  }
  
  const [, encodedVerifier] = stateParts;
  
  // Decode the code verifier
  let codeVerifier: string;
  try {
    codeVerifier = base64UrlDecode(encodedVerifier);
  } catch (error) {
    throw new Error(`Failed to decode code verifier from state: ${error}`);
  }

  // No need to clean up storage since we're not using it
  // But clean up any old storage just in case
  localStorage.removeItem(OAUTH_DEFAULTS.STORAGE_KEYS.STATE);
  localStorage.removeItem(OAUTH_DEFAULTS.STORAGE_KEYS.CODE_VERIFIER);
  sessionStorage.removeItem(OAUTH_DEFAULTS.STORAGE_KEYS.STATE);
  sessionStorage.removeItem(OAUTH_DEFAULTS.STORAGE_KEYS.CODE_VERIFIER);

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: config.clientId,
    code: code,
    redirect_uri: config.redirectUri,
    code_verifier: codeVerifier
  });

  const response = await fetch(`${config.authUrl}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  const tokens: TokenResponse = await response.json();
  
  // Store tokens in localStorage
  localStorage.setItem(OAUTH_DEFAULTS.STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem(OAUTH_DEFAULTS.STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
  }

  return tokens;
}

// Token response interface
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
}

// Get stored access token
export function getAccessToken(): string | null {
  return localStorage.getItem(OAUTH_DEFAULTS.STORAGE_KEYS.ACCESS_TOKEN);
}

// Get stored refresh token
export function getRefreshToken(): string | null {
  return localStorage.getItem(OAUTH_DEFAULTS.STORAGE_KEYS.REFRESH_TOKEN);
}

// Clear all stored tokens
export function clearTokens(): void {
  localStorage.removeItem(OAUTH_DEFAULTS.STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(OAUTH_DEFAULTS.STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(OAUTH_DEFAULTS.STORAGE_KEYS.STATE);
  localStorage.removeItem(OAUTH_DEFAULTS.STORAGE_KEYS.CODE_VERIFIER);
  sessionStorage.removeItem(OAUTH_DEFAULTS.STORAGE_KEYS.ACCESS_TOKEN);
  sessionStorage.removeItem(OAUTH_DEFAULTS.STORAGE_KEYS.REFRESH_TOKEN);
  sessionStorage.removeItem(OAUTH_DEFAULTS.STORAGE_KEYS.STATE);
  sessionStorage.removeItem(OAUTH_DEFAULTS.STORAGE_KEYS.CODE_VERIFIER);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = getAccessToken();
  if (!token) return false;

  try {
    // Parse JWT to check expiration
    const payload = JSON.parse(atob(token.split('.')[1]));
    const now = Math.floor(Date.now() / 1000);
    
    // Check if token is expired (with 30 second buffer)
    return payload.exp > (now + 30);
  } catch (error) {
    console.error('Error parsing token:', error);
    return false;
  }
}

// Refresh access token
export async function refreshAccessToken(): Promise<TokenResponse> {
  const config = getOAuthConfig();
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: config.clientId,
    refresh_token: refreshToken
  });

  const response = await fetch(`${config.authUrl}/protocol/openid-connect/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params.toString()
  });

  if (!response.ok) {
    // If refresh fails, clear tokens and throw error
    clearTokens();
    throw new Error('Token refresh failed');
  }

  const tokens: TokenResponse = await response.json();
  
  // Update stored tokens
  localStorage.setItem(OAUTH_DEFAULTS.STORAGE_KEYS.ACCESS_TOKEN, tokens.access_token);
  if (tokens.refresh_token) {
    localStorage.setItem(OAUTH_DEFAULTS.STORAGE_KEYS.REFRESH_TOKEN, tokens.refresh_token);
  }

  return tokens;
}

// Logout function
export async function logout(): Promise<void> {
  const config = getOAuthConfig();
  const refreshToken = getRefreshToken();

  // Clear local tokens first
  clearTokens();

  // Try to revoke the refresh token at the server
  if (refreshToken) {
    try {
      const params = new URLSearchParams({
        token: refreshToken,
        client_id: config.clientId,
        token_type_hint: 'refresh_token'
      });

      await fetch(`${config.authUrl}/protocol/openid-connect/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: params.toString()
      });
    } catch (error) {
      // Only log critical failures, not warnings
      // Token revocation failure is not critical as tokens will expire
    }
  }
} 