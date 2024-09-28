import { resolve } from 'node:path'
/// <reference types="vitest" />
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import packageJson from './package.json'

export default defineConfig({
  server: {
    watch: {},
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es', 'cjs', 'umd'],
      name: packageJson.name,
      fileName: 'index',
    },
  },
  esbuild: {
    minifyIdentifiers: false,
  },
  test: {},
  plugins: [dts()],
})
