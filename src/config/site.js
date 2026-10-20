const trim = (value, fallback) => String(value || fallback).replace(/\/$/, '')

export const SITE = {
  frontendUrl: trim(import.meta.env.VITE_FRONTEND_URL, 'http://localhost:5173'),
  backendUrl: trim(import.meta.env.VITE_BACKEND_URL, 'http://localhost:4000'),
}

export const API_URL = trim(
  import.meta.env.VITE_API_URL,
  `${SITE.backendUrl}/api`,
)
