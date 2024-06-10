// electron.vite.config.ts
import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react-swc'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { fileURLToPath } from 'url'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        webtorrent: fileURLToPath(
          new URL('./node_modules/webtorrent/dist/webtorrent.min.js', import.meta.url)
        )
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
    resolve: {
      alias: {
        webtorrent: fileURLToPath(
          new URL('./node_modules/webtorrent/dist/webtorrent.min.js', import.meta.url)
        )
      }
    }
  },
  renderer: {
    plugins: [
      react(),
      nodePolyfills({
        globals: {
          Buffer: true,
          global: true,
          process: true
        },
        protocolImports: true
      })
    ],
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src'),
        webtorrent: fileURLToPath(
          new URL('./node_modules/webtorrent/dist/webtorrent.min.js', import.meta.url)
        )
      }
    }
  }
})
