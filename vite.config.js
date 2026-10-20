import react from '@vitejs/plugin-react'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, resolve(dirname(fileURLToPath(import.meta.url))), '')
  const frontendUrl = String(env.VITE_FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '')
  let port = 5173
  try {
    port = Number(new URL(frontendUrl).port) || 5173
  } catch {
    port = 5173
  }

  return {
    plugins: [react()],
    server: {
      port,
      strictPort: true,
      fs: { allow: [projectRoot] },
    },
  }
})
