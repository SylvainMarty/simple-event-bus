/// <reference types="vitest" />
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import packageJson from './package.json'

export default defineConfig({
  server: {
    watch: {},
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/EventBus.ts'),
      formats: ['es', 'cjs', 'umd'],
      name: packageJson.name,
      fileName: 'index',
    },
  },
  test: {},
})
