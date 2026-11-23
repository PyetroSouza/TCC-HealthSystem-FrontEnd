import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const appDirectory = dirname(fileURLToPath(import.meta.url))
const envDirectory = resolve(appDirectory, '..')

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
  envDir: envDirectory,
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
