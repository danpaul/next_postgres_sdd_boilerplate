import 'dotenv/config';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

import { playwright } from '@vitest/browser-playwright';

const dirname =
  typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

const databaseUrl = process.env.DATABASE_URL ?? '';
const testDatabaseUrl = process.env.TEST_DATABASE_URL ?? '';

if (testDatabaseUrl !== '' && testDatabaseUrl === databaseUrl) {
  throw new Error(
    'TEST_DATABASE_URL must differ from DATABASE_URL. Refusing to run tests against the development database.',
  );
}

if (testDatabaseUrl === '') {
  console.warn('TEST_DATABASE_URL is not set. Skipping backend tests (actions project).');
}

// Backend Server Action tests in Node against the test database. Files run serially.
const actionsProject = {
  extends: true as const,
  test: {
    name: 'actions',
    environment: 'node' as const,
    include: ['src/actions/**/*.test.ts'],
    fileParallelism: false,
    setupFiles: ['src/actions/testSetup.ts'],
    globalSetup: ['src/actions/testGlobalSetup.ts'],
    env: {
      DATABASE_URL: testDatabaseUrl,
      ADMIN_EMAIL: 'admin@test.local',
    },
  },
};

/*
 * Vitest projects: storybook, components, and actions.
 * `actions` is included only when TEST_DATABASE_URL is set.
 */
// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(dirname, './src'),
    },
  },
  optimizeDeps: {
    include: [
      'storybook/test',
      '@testing-library/dom',
      'aria-query',
      'lz-string',
      'pretty-format',
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, '.storybook') }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      {
        extends: true,
        // next/link reads process.env at import time; the browser has no `process`.
        define: { 'process.env': {} },
        test: {
          name: 'components',
          include: ['src/components/**/*.test.tsx'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{ browser: 'chromium' }],
          },
        },
      },
      ...(testDatabaseUrl !== '' ? [actionsProject] : []),
    ],
  },
});
