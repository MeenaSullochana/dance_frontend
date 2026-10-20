import { useEffect, useMemo, useRef, useState } from 'react'
import { FiAward, FiRadio } from 'react-icons/fi'
import { useApp } from '../../context/AppContext'
import PlayerCard from '../../components/PlayerCard'
import StagePopup from '../../components/StagePopup'

export default function UserDashboard() {
  const { players, playerStats, settings, currentUser, participantTypes, classifications } = useApp()
  const [tab, setTab] = useState('single')
  const [stageId, setStageId] = useState(null)
  const seenLive = useRef(null)
  const published = settings.resultsPublished

  useEffect(() => {
    const liveId = settings.livePlayerId
    if (liveId && liveId !== seenLive.current) {
      seenLive.current = liveId
      setStageId(liveId)
    }
    if (!liveId) seenLive.current = null
  }, [settings.livePlayerId])

  const list = useMemo(() => {
    const filtered = players.filter((p) => p.type === tab)
    return published ? filtered.sort((a, b) => playerStats[b.id].avg - playerStats[a.id].avg) : filtered
  }, [players, playerStats, tab, published])

  const winners = players.filter((p) => p.winner)
  const livePlayer = players.find((player) => player.id === settings.livePlayerId)
  const stagePlayer = players.find((player) => player.id === stageId)

  return (
    <div className="stack">
      <div className={`banner glass ${published ? 'ok' : ''}`}>
        <span>
          Welcome, <strong>{currentUser.name}</strong>!{' '}
          {published ? 'Results are published. Here is the final leaderboard.' : 'Results are not published yet. Scores will appear once the admin publishes them.'}
        </span>
      </div>

      {livePlayer && (
        <button type="button" className="banner glass live-banner" onClick={() => setStageId(livePlayer.id)}>
          <FiRadio /> <strong>{livePlayer.name}</strong> is on stage. Click to open.
        </button>
      )}
      {published && (
        <div className="panel glass">
          <h2><FiAward /> Winners by category</h2>
          <p className="muted small">Each category has its own winner. A winner is not listed under any other category.</p>
          <div className="winner-grid">
            {classifications.filter((item) => item.kind === 'category').map((item) => {
              const winner = winners.find((player) => player.classificationId === item.id)
              return (
                <div key={item.id} className="winner-slot">
                  <strong>{item.name}</strong>
                  {winner ? (
                    <PlayerCard player={winner} stats={playerStats[winner.id]} showScore />
                  ) : (
                    <span className="muted">No winner</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="toolbar">
        <div className="tabs">
          <button className={`tab ${tab === 'single' ? 'active' : ''}`} onClick={() => setTab('single')}>Single</button>
          <button className={`tab ${tab === 'group' ? 'active' : ''}`} onClick={() => setTab('group')}>Group</button>
        </div>
      </div>

      <div className="card-grid">
        {list.map((p) => (
          <PlayerCard key={p.id} player={p} stats={playerStats[p.id]} showScore={published} participantTypes={participantTypes} live={settings.livePlayerId === p.id}>
            <button className="btn btn-ghost small" onClick={() => setStageId(p.id)}>View</button>
          </PlayerCard>
        ))}
      </div>
      {stagePlayer && <StagePopup key={stagePlayer.id} player={stagePlayer} mode="user" onClose={() => setStageId(null)} />}
    </div>
  )
}
