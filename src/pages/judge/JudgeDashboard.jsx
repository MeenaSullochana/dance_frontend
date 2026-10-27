import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiCheck, FiEdit3, FiSearch, FiUser, FiUsers } from 'react-icons/fi'
import { FaUserFriends } from 'react-icons/fa'
import { useApp } from '../../context/AppContext'
import StagePopup from '../../components/StagePopup'
import { playerPhoto } from '../../utils/playerPhoto'
import { readParticipantType } from '../../utils/participantType'

export default function JudgeDashboard() {
  const { players, playerStats, scores, currentUser, participantTypes, settings } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(() => readParticipantType(searchParams.get('type')))
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [stageId, setStageId] = useState(null)
  const seenLive = useRef(null)

  useEffect(() => {
    setTab(readParticipantType(searchParams.get('type')))
  }, [searchParams])

  useEffect(() => {
    const liveId = settings.livePlayerId
    if (liveId && liveId !== seenLive.current) {
      seenLive.current = liveId
      setStageId(liveId)
    }
    if (!liveId) {
      seenLive.current = null
      setStageId(null)
    }
  }, [settings.livePlayerId])

  const changeTab = (key) => {
    setTab(key)
    setSearchParams(key === 'single' ? {} : { type: key })
  }

  const myScore = (playerId) => scores.find((s) => s.playerId === playerId && s.judgeId === currentUser.id)
  const ofType = players.filter((p) => p.type === tab)
  const doneCount = ofType.filter((p) => myScore(p.id)).length
  const query = search.trim().toLowerCase()
  const list = ofType.filter((p) => {
    if (filter === 'todo' && myScore(p.id)) return false
    if (filter === 'done' && !myScore(p.id)) return false
    if (!query) return true
    return [p.name, p.phone, p.email, p.category].some((value) => String(value || '').toLowerCase().includes(query))
  })
  const stagePlayer = players.find((player) => player.id === stageId)
  const tabLabel = tab === 'group' ? 'groups' : tab === 'couple' ? 'couples' : 'solo players'

  return (
    <div className="stack">
      <div className="panel glass progress-panel">
        <div>
          <h2>Welcome, {currentUser.name} 👋</h2>
          <p className="muted">
            You have marked <strong>{doneCount}</strong> of <strong>{ofType.length}</strong> {tabLabel}.
          </p>
        </div>
        <div className="progress big">
          <div className="progress-fill" style={{ width: `${ofType.length ? (doneCount / ofType.length) * 100 : 0}%` }} />
        </div>
      </div>

      <div className="toolbar">
        <div className="tabs">
          <button className={`tab ${tab === 'single' ? 'active' : ''}`} onClick={() => changeTab('single')}>
            <FiUser /> Solo ({players.filter((p) => p.type === 'single').length})
          </button>
          <button className={`tab ${tab === 'couple' ? 'active' : ''}`} onClick={() => changeTab('couple')}>
            <FaUserFriends /> Couple ({players.filter((p) => p.type === 'couple').length})
          </button>
          <button className={`tab ${tab === 'group' ? 'active' : ''}`} onClick={() => changeTab('group')}>
            <FiUsers /> Group ({players.filter((p) => p.type === 'group').length})
          </button>
        </div>
        <label className="input-icon search">
          <FiSearch />
          <input placeholder="Name, mobile, or email" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
        <div className="tabs">
          {[
            ['all', 'All'],
            ['todo', 'To mark'],
            ['done', 'Marked'],
          ].map(([key, label]) => (
            <button key={key} className={`tab ${filter === key ? 'active' : ''}`} onClick={() => setFilter(key)}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {list.length ? (
        <div className="panel glass desk-list">
          <table className="table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Category</th>
                <th>Contact</th>
                <th>Your marks</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((player) => {
                const mine = myScore(player.id)
                const typeName = participantTypes.find((item) => item.id === player.participantTypeId)?.name
                const live = settings.livePlayerId === player.id
                return (
                  <tr key={player.id} className={live ? 'is-live-row' : ''}>
                    <td>
                      <div className="who">
                        <img src={playerPhoto(player)} alt="" />
                        <span>
                          <strong>{player.name}</strong>
                          <span className="muted small">#{player.chestNo}{typeName ? ` · ${typeName}` : ''}{player.age != null ? ` · Age ${player.age}` : ''}</span>
                        </span>
                      </div>
                    </td>
                    <td>{player.category}</td>
                    <td className="muted small">{[player.phone, player.email].filter(Boolean).join(' · ') || '—'}</td>
                    <td>{mine ? <span className="desk-pill received"><FiCheck /> {mine.total}/{playerStats[player.id].maxTotal}</span> : '—'}</td>
                    <td className="actions">
                      <button className={`btn ${live ? 'btn-primary' : 'btn-ghost'} small`} onClick={() => setStageId(player.id)}>
                        <FiEdit3 /> {live ? (mine ? 'Edit' : 'Give marks') : 'Vote'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty glass">Nothing here.</div>
      )}
      {stagePlayer && <StagePopup key={stagePlayer.id} player={stagePlayer} mode="judge" onClose={() => setStageId(null)} />}
    </div>
  )
}
