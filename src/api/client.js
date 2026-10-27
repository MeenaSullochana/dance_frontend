import { API_URL } from '../config/site'

const TOKEN_KEY = 'dance-api-token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  const token = auth ? getToken() : null
  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    const error = new Error(
      'Cannot reach the server. From the project root run npm run dev (starts API + website), or start backend with npm run dev in the backend folder.',
    )
    error.status = 0
    throw error
  }

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed')
    error.status = response.status
    throw error
  }
  return data
}

export function getState() {
  return request('/state').catch((error) => {
    if (error.status !== 401) throw error
    setToken(null)
    return request('/state', { auth: false })
  })
}

export const login = (body) => request('/auth/login', { method: 'POST', body, auth: false })
export const register = (body) => request('/auth/register', { method: 'POST', body, auth: false })
export const logout = () => request('/auth/logout', { method: 'POST' })
export const createPlayer = (body) => request('/players', { method: 'POST', body })
export const updatePlayer = (id, body) => request(`/players/${id}`, { method: 'PATCH', body })
export const deletePlayer = (id) => request(`/players/${id}`, { method: 'DELETE' })
export const toggleWinner = (id) => request(`/players/${id}/winner`, { method: 'PATCH' })
export const findWinners = () => request('/scores/winners', { method: 'POST' })
export const createAccount = (body) => request('/accounts', { method: 'POST', body })
export const approveAccount = (id) => request(`/accounts/${id}/approve`, { method: 'PATCH' })
export const toggleAccount = (id) => request(`/accounts/${id}/toggle`, { method: 'PATCH' })
export const deleteAccount = (id) => request(`/accounts/${id}`, { method: 'DELETE' })
export const submitScore = (body) => request('/scores', { method: 'POST', body })
export const setPlayerLive = (id, body) => request(`/players/${id}/live`, { method: 'PATCH', body })
export const setPlayerArrived = (id, body) => request(`/players/${id}/arrive`, { method: 'PATCH', body })
export const createMarkCriterion = (body) => request('/mark-criteria', { method: 'POST', body })
export const updateMarkCriterion = (id, body) => request(`/mark-criteria/${id}`, { method: 'PATCH', body })
export const deleteMarkCriterion = (id) => request(`/mark-criteria/${id}`, { method: 'DELETE' })
export const updateSettings = (body) => request('/settings', { method: 'PATCH', body })
export const resetData = () => request('/reset', { method: 'POST' })
export const previewGoogleForm = (body) => request('/import/google-form/preview', { method: 'POST', body })
export const importGoogleForm = (body) => request('/import/google-form', { method: 'POST', body })
export const createAgeBand = (body) => request('/age-bands', { method: 'POST', body })
export const updateAgeBand = (id, body) => request(`/age-bands/${id}`, { method: 'PATCH', body })
export const deleteAgeBand = (id) => request(`/age-bands/${id}`, { method: 'DELETE' })
export const createParticipantType = (body) => request('/participant-types', { method: 'POST', body })
export const updateParticipantType = (id, body) => request(`/participant-types/${id}`, { method: 'PATCH', body })
export const deleteParticipantType = (id) => request(`/participant-types/${id}`, { method: 'DELETE' })
export const createFormat = (body) => request('/formats', { method: 'POST', body })
export const updateFormat = (id, body) => request(`/formats/${id}`, { method: 'PATCH', body })
export const createClassification = (body) => request('/classifications', { method: 'POST', body })
export const updateClassification = (id, body) => request(`/classifications/${id}`, { method: 'PATCH', body })
export const deleteClassification = (id) => request(`/classifications/${id}`, { method: 'DELETE' })
export const createCategoryParameter = (body) => request('/category-parameters', { method: 'POST', body })
export const updateCategoryParameter = (id, body) => request(`/category-parameters/${id}`, { method: 'PATCH', body })
export const deleteCategoryParameter = (id) => request(`/category-parameters/${id}`, { method: 'DELETE' })

export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = String(reader.result || '')
      const base64 = result.includes(',') ? result.split(',')[1] : result
      resolve(base64)
    }
    reader.onerror = () => reject(new Error('Could not read the file'))
    reader.readAsDataURL(file)
  })
}
