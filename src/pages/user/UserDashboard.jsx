import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FiAward, FiRadio, FiSearch, FiUser, FiUsers } from 'react-icons/fi'
import { FaUserFriends } from 'react-icons/fa'
import { useApp } from '../../context/AppContext'
import PlayerCard from '../../components/PlayerCard'
import StagePopup from '../../components/StagePopup'
import { playerPhoto } from '../../utils/playerPhoto'
import { isPerforming, isVotingOpen, registeredId } from '../../utils/playerIds'
import { categoryPlaces, PLACE_LABELS } from '../../utils/podium'
import { readParticipantType } from '../../utils/participantType'

export default function UserDashboard() {
  const { players, playerStats, scores, settings, currentUser, classifications } = useApp()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState(() => readParticipantType(searchParams.get('type')))
  const [search, setSearch] = useState('')
  const [stageId, setStageId] = useState(null)
  const seenLive = useRef(null)
  const published = settings.resultsPublished

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

  useEffect(() => {
    if (settings.livePlayerId && settings.votingOpen) {
      setStageId(settings.livePlayerId)
    }
  }, [settings.votingOpen, settings.livePlayerId])

  const changeTab = (key) => {
    setTab(key)
    setSearchParams(key === 'single' ? {} : { type: key })
  }

  const list = useMemo(() => {
    const query = search.trim().toLowerCase()
    const filtered = players.filter((player) => {
      if (!query && player.type !== tab) return false
      if (!query) return true
      return [player.name, player.category, player.danceStyle, player.registeredId, player.arrivalNo].some((value) =>
        String(value || '').toLowerCase().includes(query),
      )
    })
    return published ? [...filtered].sort((a, b) => playerStats[b.id].avg - playerStats[a.id].avg) : filtered
  }, [players, playerStats, tab, published, search])

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
          <FiRadio /> <strong>{livePlayer.name}</strong> {isVotingOpen(settings, livePlayer) ? 'is on stage. Click to vote.' : 'is performing now.'}
        </button>
      )}
      {published && (
        <div className="panel glass">
          <h2><FiAward /> Results</h2>
          <p className="muted small">Each category shows a winner and three runner-ups. The overall first place is not repeated there. Choreography winners are the best in that dance style who did not win a category.</p>
          {settings.podium?.overallId && (
            <p className="podium-overall">Overall first: <strong>{players.find((player) => player.id === settings.podium.overallId)?.name}</strong></p>
          )}
          <div className="winner-grid">
            {classifications.filter((item) => item.kind === 'category' && !classifications.some((row) => row.parentId === item.id)).map((item) => {
              const places = categoryPlaces(settings.podium, item.id)
              const winner = winners.find((player) => player.classificationId === item.id)
              return (
                <div key={item.id} className="winner-slot">
                  <strong>{item.name}</strong>
                  {places.length ? places.map((place) => {
                    const person = players.find((player) => player.id === place.playerId)
                    return person ? (
                      <div key={place.place}>
                        <span className="muted small">{PLACE_LABELS[place.place]}</span>
                        <PlayerCard player={person} stats={playerStats[person.id]} showScore publicView />
                      </div>
                    ) : null
                  }) : winner ? (
                    <PlayerCard player={winner} stats={playerStats[winner.id]} showScore publicView />
                  ) : (
                    <span className="muted">No places yet</span>
                  )}
                </div>
              )
            })}
          </div>
          {settings.podium?.styles?.length > 0 && (
            <div className="winner-grid">
              {settings.podium.styles.map((item) => {
                const person = players.find((player) => player.id === item.playerId)
                return (
                  <div key={item.danceStyle} className="winner-slot">
                    <span className="muted small">Choreography</span>
                    <strong>{item.danceStyle}</strong>
                    {person ? <PlayerCard player={person} stats={playerStats[person.id]} showScore publicView /> : <span className="muted">No winner</span>}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      <div className="toolbar">
        <div className="tabs">
          <button className={`tab ${tab === 'single' ? 'active' : ''}`} onClick={() => changeTab('single')}>
            <FiUser /> Solo ({players.filter((player) => player.type === 'single').length})
          </button>
          <button className={`tab ${tab === 'couple' ? 'active' : ''}`} onClick={() => changeTab('couple')}>
            <FaUserFriends /> Couple ({players.filter((player) => player.type === 'couple').length})
          </button>
          <button className={`tab ${tab === 'group' ? 'active' : ''}`} onClick={() => changeTab('group')}>
            <FiUsers /> Group ({players.filter((player) => player.type === 'group').length})
          </button>
        </div>
        <label className="input-icon search">
          <FiSearch />
          <input placeholder="Name, category, or dance" value={search} onChange={(event) => setSearch(event.target.value)} />
        </label>
      </div>

      {list.length ? (
        <div className="panel glass desk-list">
          <table className="table">
            <thead>
              <tr>
                <th>Participant</th>
                <th>Registered ID</th>
                <th>Arrival ID</th>
                <th>Category</th>
                <th>Dance</th>
                <th>Overall</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((player) => {
                const live = isPerforming(settings, player)
                const voting = isVotingOpen(settings, player)
                const mine = scores.find((score) => score.playerId === player.id && score.judgeId === currentUser.id)
                const stats = playerStats[player.id]
                return (
                  <tr key={player.id} className={live ? 'is-live-row' : ''}>
                    <td>
                      <div className="who">
                        <img src={playerPhoto(player)} alt="" />
                        <span>
                          <strong>{player.name}</strong>
                        </span>
                      </div>
                    </td>
                    <td>{registeredId(player) || '—'}</td>
                    <td>{player.arrivalNo || '—'}</td>
                    <td>{player.category || '—'}</td>
                    <td>{player.danceStyle || '—'}</td>
                    <td>
                      {mine ? <span className="desk-pill id">{mine.criteria?.overall ?? mine.total}/{settings.publicMaxMarks || 10}</span> : '—'}
                      {published && stats.publicCount > 0 && (
                        <span className="muted small"> Avg {stats.publicAvg.toFixed(1)}</span>
                      )}
                    </td>
                    <td className="actions">
                      <button className={`btn ${voting && !mine ? 'btn-primary' : 'btn-ghost'} small`} onClick={() => setStageId(player.id)}>
                        <FiRadio /> {mine ? 'Voted' : voting ? 'Vote' : live ? 'Performing' : 'Vote'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty glass">No participants in this list.</div>
      )}
      {stagePlayer && <StagePopup key={stagePlayer.id} player={stagePlayer} mode="user" onClose={() => setStageId(null)} />}
    </div>
  )
}
