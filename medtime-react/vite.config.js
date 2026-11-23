
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'
import process from 'node:process'

const appDirectory = dirname(fileURLToPath(import.meta.url))

const buildId =
  process.env.RENDER_GIT_COMMIT ||
  process.env.GITHUB_SHA ||
  Date.now().toString(36)

function manifestoDeVersao() {
  return {
    name: 'medtime-version-manifest',
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'version.json',
        source: JSON.stringify({ version: buildId })
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), manifestoDeVersao()],
  base: './',
  envDir: appDirectory,
  define: {
    'import.meta.env.VITE_APP_BUILD_ID': JSON.stringify(buildId)
  },
  server: {
    host: '0.0.0.0'
  },
  preview: {
    host: '0.0.0.0',
    port: 4173
  }
})
