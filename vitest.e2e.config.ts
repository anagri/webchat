import { defineConfig } from 'vitest/config';
import { config } from 'dotenv';

// Load .env.test file for test environment variables
config({ path: '.env.test' });

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['**/node_modules/**'],
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 30000,
    setupFiles: ['./tests/setup.ts'],
    sequence: {
      hooks: 'list', // Run hooks in order to maintain compatibility with Jest
      setupFiles: 'list', // Execute setup files in sequence
    },
    globals: true,
    fileParallelism: false, // Ensure files run sequentially
  },
}); 