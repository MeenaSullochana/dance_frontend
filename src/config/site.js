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
  if (first === 'render') return ['live', 'render']
  if (first === 'live') return ['live']
  return ['local']
}

export const SITE = {
  frontendUrl: typeof window !== 'undefined' ? window.location.origin : trim(import.meta.env.VITE_FRONTEND_URL, 'http://localhost:5173'),
  backendUrl: BACKENDS[backendTargetForHost()],
  backendTarget: backendTargetForHost(),
  backends: BACKENDS,
}

export function getApiUrl(target = SITE.backendTarget) {
  return target === 'local' ? '/api' : `${BACKENDS[target]}/api`
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

function apiUrl(target) {
  return target === 'local' ? '/api/health' : `${BACKENDS[target]}/api/health`
}

async function ping(target, timeoutMs) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), timeoutMs)
  try {
    const res = await fetch(apiUrl(target), {
      signal: ctrl.signal,
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return false
    const data = await res.json().catch(() => ({}))
    return data.ok === true
  } catch {
    return false
  } finally {
    clearTimeout(timer)
  }
}

let backendReady = null

function remember(target) {
  setActiveBackend(target)
  return target
}

async function raceBackends() {
  const targets = preferredTargets()
  if (targets.length === 1) return remember(targets[0])

  // Start waking Render immediately; do not wait on it to pick a host.
  if (targets.includes('render')) {
    ping('render', 45000).catch(() => {})
  }

  const winner = await new Promise((resolve) => {
    let pending = targets.length
    let settled = false
    const finish = (target) => {
      if (settled) return
      settled = true
      resolve(target)
    }
    for (const target of targets) {
      ping(target, 1000).then((ok) => {
        if (ok) finish(target)
        else if (--pending === 0) finish(targets.includes('render') ? 'render' : targets[0])
      })
    }
  })
  return remember(winner)
}

export function ensureBackend() {
  if (!backendReady) backendReady = raceBackends()
  return backendReady
}

export function resetBackendChoice() {
  backendReady = null
}

export function warmupBackends() {
  return ensureBackend()
}

export function failoverTargets() {
  const current = SITE.backendTarget
  const rest = preferredTargets().filter((target) => target !== current)
  return [current, ...rest]
}
