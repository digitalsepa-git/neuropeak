import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'packages/*/src/**/*.test.ts',
      'apps/mobile/src/**/*.test.ts',
      'apps/admin/src/**/*.test.ts',
    ],
    environment: 'node',
    coverage: {
      include: ['packages/*/src/**/*.ts', 'apps/mobile/src/lib/i18n/**/*.ts'],
      exclude: ['packages/*/src/**/*.test.ts'],
    },
  },
});
