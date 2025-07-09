export interface BodhiServerOptions {
  port?: number;
  home?: string;
  host?: string;
  hf_home?: string;
  logLevel?: string;
  logToStdout?: boolean;
  authUrl?: string;
  authRealm?: string;
  binPath?: string;
  appStatus?: string;
  clientId?: string;
  clientSecret?: string;
}

export async function createBodhiServerConfig(options: BodhiServerOptions = {}) {
  // Load app-bindings
  const appBindings = await import('@bodhiapp/app-bindings');
  const {
    createNapiAppOptions,
    setEnvVar,
    setSystemSetting,
    setAppSetting,
    setAppStatus,
    setClientCredentials,
    BODHI_HOST,
    BODHI_PORT,
    BODHI_ENV_TYPE,
    BODHI_APP_TYPE,
    BODHI_VERSION,
    BODHI_LOG_LEVEL,
    BODHI_LOG_STDOUT,
    BODHI_AUTH_URL,
    BODHI_AUTH_REALM,
    BODHI_EXEC_LOOKUP_PATH,
  } = appBindings;

  // Set defaults with test auth configuration
  const config = {
    ...options,
    port: options.port || Math.floor(Math.random() * (30000 - 20000) + 20000),
    host: options.host || '127.0.0.1',
    logLevel: options.logLevel || 'debug',
    authUrl: options.authUrl || process.env.INTEG_TEST_AUTH_URL || 'http://localhost:8080',
    authRealm: options.authRealm || process.env.INTEG_TEST_AUTH_REALM || 'test-realm',
    clientId: options.clientId || process.env.INTEG_TEST_CLIENT_ID || 'test-client',
    clientSecret: options.clientSecret || process.env.INTEG_TEST_CLIENT_SECRET || 'test-secret',
    appStatus: options.appStatus || 'ready',
  };

  // Create default home directory if not provided
  if (!config.home) {
    const { mkdtempSync } = await import('fs');
    const { tmpdir } = await import('os');
    const { join } = await import('path');
    config.home = mkdtempSync(join(tmpdir(), 'bodhi-test-'));
  }

  // Set default bin path if not provided
  if (!config.binPath) {
    const { resolve: resolvePath, dirname } = await import('path');
    const { fileURLToPath } = await import('url');
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    config.binPath = resolvePath(__dirname, '../../bin');
  }

  // Build configuration for the Bodhi server
  let napiConfig = createNapiAppOptions();

  // Environment variables
  napiConfig = setEnvVar(napiConfig, 'HOME', config.home);
  napiConfig = setEnvVar(napiConfig, BODHI_HOST, config.host);
  napiConfig = setEnvVar(napiConfig, BODHI_PORT, config.port.toString());

  if (config.hf_home) {
    napiConfig = setEnvVar(napiConfig, 'HF_HOME', config.hf_home);
  }
  
  // System settings
  napiConfig = setSystemSetting(napiConfig, BODHI_ENV_TYPE, 'development');
  napiConfig = setSystemSetting(napiConfig, BODHI_APP_TYPE, 'container');
  napiConfig = setSystemSetting(napiConfig, BODHI_VERSION, '1.0.0-test');

  // Auth settings - always set these for testing
  napiConfig = setSystemSetting(napiConfig, BODHI_AUTH_URL, config.authUrl);
  napiConfig = setSystemSetting(napiConfig, BODHI_AUTH_REALM, config.authRealm);
  napiConfig = setClientCredentials(napiConfig, config.clientId, config.clientSecret);

  // App settings
  napiConfig = setAppSetting(napiConfig, BODHI_LOG_LEVEL, config.logLevel);
  napiConfig = setAppSetting(
    napiConfig,
    BODHI_LOG_STDOUT,
    config.logToStdout?.toString() || 'false'
  );

  if (config.appStatus) {
    napiConfig = setAppStatus(napiConfig, config.appStatus);
  }
  
  napiConfig = setAppSetting(napiConfig, BODHI_EXEC_LOOKUP_PATH, config.binPath);

  return {
    napiConfig,
    config,
    appBindings,
  };
}

export async function createBodhiServer(options: BodhiServerOptions = {}) {
  const { napiConfig, config, appBindings } = await createBodhiServerConfig(options);
  const { BodhiServer } = appBindings;

  const server = new BodhiServer(napiConfig);

  return {
    server,
    config,
    appBindings,
    port: config.port,
  };
} 