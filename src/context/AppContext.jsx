import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as api from '../api/client'
import { activeCriteria, PASS_PERCENT, totalMax } from '../constants/scoring'
import { SITE } from '../config/site'

const AppContext = createContext(null)

const EMPTY = {
  users: [],
  players: [],
  scores: [],
  settings: { resultsPublished: false },
  ageBands: [],
  participantTypes: [],
  formats: [],
  classifications: [],
  markCriteria: [],
  categoryParameters: [],
}

export function AppProvider({ children }) {
  const [data, setData] = useState(EMPTY)
  const [currentUser, setCurrentUser] = useState(null)
  const [ready, setReady] = useState(false)
  const [offline, setOffline] = useState(false)
  const [toast, setToast] = useState(null)
  const busy = useRef(0)
  const generation = useRef(0)

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, id: Date.now() })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const apply = useCallback((payload) => {
    setData({
      users: payload.users || [],
      players: payload.players || [],
      scores: payload.scores || [],
      settings: payload.settings || { resultsPublished: false, livePlayerId: null },
      ageBands: payload.ageBands || [],
      participantTypes: payload.participantTypes || [],
      formats: payload.formats || [],
      classifications: payload.classifications || [],
      markCriteria: payload.markCriteria || [],
      categoryParameters: payload.categoryParameters || [],
    })
    setCurrentUser(payload.user || null)
    setOffline(false)
  }, [])

  const refresh = useCallback(async () => {
    const stamp = generation.current
    if (busy.current) return
    const payload = await api.getState()
    if (busy.current || stamp !== generation.current) return
    apply(payload)
  }, [apply])

  useEffect(() => {
    let ignore = false
    api
      .getState()
      .then((payload) => {
        if (!ignore) apply(payload)
      })
      .catch(() => {
        if (!ignore) setOffline(true)
      })
      .finally(() => {
        if (!ignore) setReady(true)
      })
    return () => {
      ignore = true
    }
  }, [apply])

  useEffect(() => {
    if (!ready || offline) return undefined
    const tick = () => {
      if (document.visibilityState === 'visible') refresh().catch(() => {})
    }
    const timer = setInterval(tick, 8000)
    window.addEventListener('focus', tick)
    return () => {
      clearInterval(timer)
      window.removeEventListener('focus', tick)
    }
  }, [ready, offline, refresh])

  const { users, players, scores, settings, ageBands, participantTypes, formats, classifications, markCriteria, categoryParameters } = data
  const criteria = useMemo(() => activeCriteria(markCriteria), [markCriteria])
  const maxTotal = useMemo(() => totalMax(criteria), [criteria])
  const criteriaFor = useCallback((classificationId) => {
    const own = (categoryParameters || []).filter((item) => item.classificationId === classificationId && item.active !== false)
    return classificationId && own.length ? activeCriteria(own) : criteria
  }, [categoryParameters, criteria])
  const judges = useMemo(() => users.filter((user) => user.role === 'judge'), [users])
  const activeJudges = useMemo(() => judges.filter((judge) => judge.active), [judges])
  const members = useMemo(() => users.filter((user) => user.role === 'user'), [users])
  const approvedMembers = useMemo(() => members.filter((user) => user.approved !== false), [members])
  const pendingMembers = useMemo(() => members.filter((user) => user.approved === false), [members])

  const playerStats = useMemo(() => {
    const map = {}
    const audienceOf = (score) => {
      if (score.audience === 'public' || score.audience === 'judge') return score.audience
      return members.some((user) => user.id === score.judgeId) ? 'public' : 'judge'
    }
    const mean = (list) => (list.length ? list.reduce((sum, score) => sum + Number(score.total || 0), 0) / list.length : 0)
    for (const player of players) {
      const marks = scores.filter((score) => score.playerId === player.id)
      const judgeScores = marks.filter((score) => audienceOf(score) === 'judge')
      const publicScores = marks.filter((score) => audienceOf(score) === 'public')
      const avg = mean(judgeScores)
      const publicAvg = mean(publicScores)
      const cap = totalMax(criteriaFor(player.classificationId))
      const percent = (avg / cap) * 100
      const allJudged = activeJudges.length > 0 && activeJudges.every((judge) => judgeScores.some((score) => score.judgeId === judge.id))
      let status = 'pending'
      if (player.winner) status = 'winner'
      else if (allJudged) status = percent >= PASS_PERCENT ? 'qualified' : 'rejected'
      else if (judgeScores.length) status = 'judged'
      map[player.id] = {
        scores: judgeScores,
        publicScores,
        count: judgeScores.length,
        publicCount: publicScores.length,
        avg,
        publicAvg,
        percent,
        status,
        maxTotal: cap,
      }
    }
    return map
  }, [players, scores, activeJudges, members, criteriaFor])

  const run = async (work) => {
    busy.current += 1
    generation.current += 1
    try {
      const payload = await work()
      apply(payload)
      return { ok: true, user: payload.user, players: payload.players }
    } catch (error) {
      return { ok: false, error: error.message }
    } finally {
      busy.current -= 1
    }
  }

  const login = async (email, password, role) => {
    busy.current += 1
    generation.current += 1
    try {
      const body =
        role === 'user'
          ? { phone: email, audience: true, role: 'user' }
          : { email, password }
      const payload = await api.login(body)
      api.setToken(payload.token)
      apply(payload)
      return { ok: true, user: payload.user }
    } catch (error) {
      return { ok: false, error: error.message }
    } finally {
      busy.current -= 1
    }
  }

  const register = async (body) => {
    busy.current += 1
    generation.current += 1
    try {
      const payload = await api.register(body)
      if (payload.token) {
        api.setToken(payload.token)
        apply(payload)
        return { ok: true, user: payload.user }
      }
      return { ok: true }
    } catch (error) {
      return { ok: false, error: error.message }
    } finally {
      busy.current -= 1
    }
  }

  const logout = async () => {
    busy.current += 1
    generation.current += 1
    const token = api.getToken()
    api.setToken(null)
    setCurrentUser(null)
    try {
      if (token) await api.logout()
    } catch {
      // the local session is already cleared
    }
    try {
      apply(await api.getState())
    } catch {
      setData(EMPTY)
    } finally {
      busy.current -= 1
    }
  }

  const retry = async () => {
    setReady(false)
    setOffline(false)
    try {
      apply(await api.getState())
    } catch {
      setOffline(true)
    } finally {
      setReady(true)
    }
  }

  const value = {
    users,
    players,
    scores,
    settings,
    ageBands,
    participantTypes,
    formats,
    classifications,
    markCriteria,
    categoryParameters,
    criteria,
    criteriaFor,
    maxTotal,
    judges,
    activeJudges,
    members,
    approvedMembers,
    pendingMembers,
    currentUser,
    playerStats,
    toast,
    showToast,
    login,
    logout,
    register,
    approveAccount: (id) => run(() => api.approveAccount(id)),
    addPlayer: (player) => run(() => api.createPlayer(player)),
    updatePlayer: (id, changes) => run(() => api.updatePlayer(id, changes)),
    deletePlayer: (id) => run(() => api.deletePlayer(id)),
    addAccount: (account) => run(() => api.createAccount(account)),
    toggleAccount: (id) => run(() => api.toggleAccount(id)),
    deleteAccount: (id) => run(() => api.deleteAccount(id)),
    submitScore: (playerId, criteria, comment) => run(() => api.submitScore({ playerId, criteria, comment })),
    toggleWinner: (id) => run(() => api.toggleWinner(id)),
    findWinners: () => run(() => api.findWinners()),
    setResultsPublished: (resultsPublished) => run(() => api.updateSettings({ resultsPublished })),
    setPublicMaxMarks: (publicMaxMarks) => run(() => api.updateSettings({ publicMaxMarks })),
    setLivePlayer: (id, live) => run(() => api.setPlayerLive(id, { live })),
    setPlayerArrived: (id, arrived) => run(() => api.setPlayerArrived(id, { arrived })),
    createMarkCriterion: (body) => run(() => api.createMarkCriterion(body)),
    updateMarkCriterion: (id, body) => run(() => api.updateMarkCriterion(id, body)),
    deleteMarkCriterion: (id) => run(() => api.deleteMarkCriterion(id)),
    createCategoryParameter: (body) => run(() => api.createCategoryParameter(body)),
    updateCategoryParameter: (id, body) => run(() => api.updateCategoryParameter(id, body)),
    deleteCategoryParameter: (id) => run(() => api.deleteCategoryParameter(id)),
    createAgeBand: (body) => run(() => api.createAgeBand(body)),
    updateAgeBand: (id, body) => run(() => api.updateAgeBand(id, body)),
    deleteAgeBand: (id) => run(() => api.deleteAgeBand(id)),
    createParticipantType: (body) => run(() => api.createParticipantType(body)),
    updateParticipantType: (id, body) => run(() => api.updateParticipantType(id, body)),
    deleteParticipantType: (id) => run(() => api.deleteParticipantType(id)),
    createFormat: (body) => run(() => api.createFormat(body)),
    updateFormat: (id, body) => run(() => api.updateFormat(id, body)),
    createClassification: (body) => run(() => api.createClassification(body)),
    updateClassification: (id, body) => run(() => api.updateClassification(id, body)),
    deleteClassification: (id) => run(() => api.deleteClassification(id)),
    previewGoogleForm: async (file) => {
      try {
        const fileBase64 = await api.fileToBase64(file)
        return { ok: true, data: await api.previewGoogleForm({ fileBase64, fileName: file.name }) }
      } catch (error) {
        return { ok: false, error: error.message }
      }
    },
    importGoogleForm: async (file) => {
      busy.current += 1
      generation.current += 1
      try {
        const fileBase64 = await api.fileToBase64(file)
        const payload = await api.importGoogleForm({ fileBase64, fileName: file.name })
        apply(payload)
        return { ok: true, importResult: payload.importResult }
      } catch (error) {
        return { ok: false, error: error.message }
      } finally {
        busy.current -= 1
      }
    },
    resetDemoData: async () => {
      const result = await run(() => api.resetData())
      if (result.ok) {
        api.setToken(null)
        setCurrentUser(null)
      }
      return result
    },
  }

  if (!ready) {
    return (
      <div className="boot">
        <div className="boot-card glass">
          <span className="boot-spinner" />
          <strong>Dance of District</strong>
          <p className="muted">Connecting to the server…</p>
        </div>
      </div>
    )
  }

  if (offline) {
    return (
      <div className="boot">
        <div className="boot-card glass">
          <strong>Server is not running</strong>
          <p className="muted">
            The API at <b>{SITE.backendUrl}</b> is offline. In the project root run <b>npm run dev</b> so both the API and website start together. Then click Try again.
          </p>
          <button className="btn btn-primary" onClick={retry}>Try again</button>
        </div>
      </div>
    )
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useApp = () => useContext(AppContext)
