import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.config.ts',
        '**/*.config.js',
        '**/types/**',
        '**/*.test.ts',
        '**/*.integration.test.ts',
        'src/index.ts',
      ],
      include: ['src/**/*.ts'],
      all: true,
      clean: true,
      thresholds: {
        lines: 20,
        functions: 35,
        branches: 60,
        statements: 20,
      },
    },
    include: ['src/**/*.{test,spec}.ts'],
    watchExclude: ['node_modules', 'dist'],
  },
});