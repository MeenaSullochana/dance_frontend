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

function preferredTargets() {
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

function setActiveBackend(target) {
  SITE.backendTarget = target
  SITE.backendUrl = BACKENDS[target]
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function pingOnce(url, timeoutMs) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: 'application/json' } })
    if (!res.ok) return false
    const data = await res.json().catch(() => ({}))
    return data.ok === true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

async function ping(target) {
  const url = target === 'local' ? '/api/health' : `${BACKENDS[target]}/api/health`
  const attempts = target === 'render' ? 4 : 1
  const timeoutMs = target === 'render' ? 20000 : 8000
  for (let i = 0; i < attempts; i += 1) {
    if (await pingOnce(url, timeoutMs)) return true
    if (i < attempts - 1) await wait(4000)
  }
  return false
}

export async function resolveBackend() {
  const order = preferredTargets()
  for (const target of order) {
    if (await ping(target)) {
      setActiveBackend(target)
      return target
    }
  }
  setActiveBackend(order[0])
  throw new Error('Cannot reach the API')
}
