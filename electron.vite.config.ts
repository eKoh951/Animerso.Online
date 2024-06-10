import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'

export default defineConfig({
  main: {
    plugins: [
      externalizeDepsPlugin(),
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true
        },
        protocolImports: true
      })
    ]
  },
  preload: {
    plugins: [
      externalizeDepsPlugin(),
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true
        },
        protocolImports: true
      })
    ]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        webtorrent: fileURLToPath(
          new URL('./node_modules/webtorrent/dist/webtorrent.min.js', import.meta.url)
        )
      }
    },
    plugins: [react()]
  }
})
