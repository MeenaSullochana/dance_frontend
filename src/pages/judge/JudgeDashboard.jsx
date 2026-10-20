import { useEffect, useRef, useState } from 'react'
import { FiCheck, FiEdit3, FiUser, FiUsers } from 'react-icons/fi'
import { FaUserFriends } from 'react-icons/fa'
import { useApp } from '../../context/AppContext'
import PlayerCard from '../../components/PlayerCard'
import StagePopup from '../../components/StagePopup'

export default function JudgeDashboard() {
  const { players, playerStats, scores, currentUser, participantTypes, settings } = useApp()
  const [tab, setTab] = useState('single')
  const [filter, setFilter] = useState('all')
  const [stageId, setStageId] = useState(null)
  const seenLive = useRef(null)

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

  const myScore = (playerId) => scores.find((s) => s.playerId === playerId && s.judgeId === currentUser.id)
  const ofType = players.filter((p) => p.type === tab)
  const doneCount = ofType.filter((p) => myScore(p.id)).length
  const list = ofType.filter((p) => {
    if (filter === 'todo') return !myScore(p.id)
    if (filter === 'done') return !!myScore(p.id)
    return true
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
          <button className={`tab ${tab === 'single' ? 'active' : ''}`} onClick={() => setTab('single')}>
            <FiUser /> Solo
          </button>
          <button className={`tab ${tab === 'couple' ? 'active' : ''}`} onClick={() => setTab('couple')}>
            <FaUserFriends /> Couple
          </button>
          <button className={`tab ${tab === 'group' ? 'active' : ''}`} onClick={() => setTab('group')}>
            <FiUsers /> Group
          </button>
        </div>
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
        <div className="card-grid">
          {list.map((p) => {
            const mine = myScore(p.id)
            return (
              <PlayerCard key={p.id} player={p} stats={playerStats[p.id]} showScore={false} participantTypes={participantTypes} live={settings.livePlayerId === p.id}>
                {settings.livePlayerId !== p.id ? (
                  <span className="muted small">Marks open only while live</span>
                ) : mine ? (
                  <>
                    <span className="my-score">
                      <FiCheck /> Your marks: <strong>{mine.total}</strong>/{playerStats[p.id].maxTotal}
                    </span>
                    <button className="btn btn-ghost small" onClick={() => setStageId(p.id)}>
                      <FiEdit3 /> Edit
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary small full" onClick={() => setStageId(p.id)}>
                    <FiEdit3 /> Give Marks
                  </button>
                )}
              </PlayerCard>
            )
          })}
        </div>
      ) : (
        <div className="empty glass">Nothing here. 🎉</div>
      )}
      {stagePlayer && <StagePopup key={stagePlayer.id} player={stagePlayer} mode="judge" onClose={() => setStageId(null)} />}
    </div>
  )
}
