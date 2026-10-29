const trim = (value, fallback) => String(value || fallback).replace(/\/$/, '')

export const BACKENDS = {
  local: trim(import.meta.env.VITE_BACKEND_LOCAL_URL, 'http://localhost:7000'),
  live: trim(import.meta.env.VITE_BACKEND_LIVE_URL, 'https://backdod.senatespace.in'),
  render: trim(import.meta.env.VITE_BACKEND_RENDER_URL, 'https://dance-backend-3kwj.onrender.com'),
}

function hostName() {
  if (typeof window === 'undefined') return ''
  return String(window.location.hostname || '').toLowerCase()
}

export function backendTargetForHost(hostname = hostName()) {
  const host = String(hostname || '').toLowerCase()
  if (!host || host === 'localhost' || host === '127.0.0.1') return 'local'
  if (host.includes('netlify.app') || host.includes('netlify.com')) return 'render'
  if (host.includes('senatespace.in')) return 'live'
  return import.meta.env.DEV ? 'local' : 'live'
}

export function preferredTargets() {
  const first = backendTargetForHost()
  if (first === 'render') return ['render', 'live']
  if (first === 'live') return ['live']
  return ['local']
}

export const SITE = {
  frontendUrl: typeof window !== 'undefined' ? window.location.origin : trim(import.meta.env.VITE_FRONTEND_URL, 'http://localhost:5173'),
  backendUrl: BACKENDS[backendTargetForHost()],
  backendTarget: backendTargetForHost(),
  backends: BACKENDS,
}

export function getApiUrl() {
  return SITE.backendTarget === 'local' ? '/api' : `${SITE.backendUrl}/api`
}

export const API_URL = getApiUrl()

export function setActiveBackend(target) {
  SITE.backendTarget = target
  SITE.backendUrl = BACKENDS[target]
}

export function selectBackend() {
  const target = preferredTargets()[0]
  setActiveBackend(target)
  return target
}
