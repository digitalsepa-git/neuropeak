import path from 'node:path';

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // Workspace paketleri kaynak TypeScript olarak yayınlanır, Next'in derlemesi gerekir.
  transpilePackages: ['@neuropeak/core', '@neuropeak/ui'],
  // Monorepo'da dosya izlemenin kökü doğru belirlensin.
  outputFileTracingRoot: path.resolve(import.meta.dirname, '../..'),
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
