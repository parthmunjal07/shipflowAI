import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globalSetup: './scripts/global-test-setup.ts',
    environment: 'node',
    include: ['**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**'], // Exclude Playwright e2e tests
    setupFiles: ['./scripts/vitest.setup.ts'],
  },
});
