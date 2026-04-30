import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

/**
 * Separate vitest config for Firestore rules tests.
 * These tests require the Firebase emulator running (port 8080).
 * Run with: npx vitest --config vitest.rules.config.ts
 */
export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/rules/**/*.test.ts'],
    testTimeout: 30000,
  },
})
