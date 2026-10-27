import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { FiArrowLeft, FiSave } from 'react-icons/fi'
import { useApp } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import { playerPhoto } from '../../utils/playerPhoto'
import { memberLabel } from '../../utils/member'
import MarkRounds from '../../components/MarkRounds'

export default function ScorePlayer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { players, scores, playerStats, currentUser, submitScore, showToast, criteriaFor, settings } = useApp()
  const player = players.find((p) => p.id === id)
  const criteria = criteriaFor(player?.classificationId)
  const maxTotal = criteria.reduce((sum, item) => sum + Number(item.maxMarks || 0), 0) || 1
  const existing = scores.find((s) => s.playerId === id && s.judgeId === currentUser.id)

  const [marks, setMarks] = useState(() =>
    Object.fromEntries(criteria.map((item) => {
      const saved = existing?.criteria?.[item.key]
      const value = Number.isInteger(saved) ? Math.min(Math.max(saved, 1), item.maxMarks) : 1
      return [item.key, value]
    })),
  )
  const [comment, setComment] = useState(existing?.comment || '')

  if (!player) return <Navigate to="/judge" replace />
  const live = settings.livePlayerId === player.id

  const total = criteria.reduce((sum, item) => sum + Number(marks[item.key] || 0), 0)
  const percent = (total / maxTotal) * 100

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await submitScore(player.id, marks, comment.trim())
    if (!res.ok) return showToast(res.error, 'error')
    showToast(existing ? 'Marks updated' : 'Marks submitted')
    navigate('/judge')
  }

  return (
    <div className="score-page">
      <button className="btn btn-ghost" onClick={() => navigate('/judge')}>
        <FiArrowLeft /> Back to list
      </button>

      <div className="score-layout">
        <div className="panel glass score-player">
          <img src={playerPhoto(player)} alt={player.name} />
          <h2>{player.name}</h2>
          <span className="chip">#{player.chestNo} · {player.category}</span>
          <span className="muted">{player.type === 'group' ? 'Group performance' : 'Solo performance'}</span>
          {player.type === 'group' && (
            <div className="member-chips">
              {player.members.map((member) => <span key={memberLabel(member)} className="chip small">{memberLabel(member)}</span>)}
            </div>
          )}
          <StatusBadge status={playerStats[player.id].status} />
        </div>

        {!live ? (
          <div className="panel glass score-form">
            <h2>Voting closed</h2>
            <p className="muted">Voting lines will open only during/ after the performance</p>
          </div>
        ) : (
        <form className="panel glass score-form" onSubmit={handleSubmit}>
          <h2>{existing ? 'Edit your marks' : 'Give marks'}</h2>
          {criteria.map((c) => (
            <MarkRounds
              key={c.key}
              label={c.label}
              max={c.maxMarks}
              value={marks[c.key] || 1}
              onChange={(value) => setMarks({ ...marks, [c.key]: value })}
            />
          ))}

          <div className="total-box">
            <span>Total</span>
            <strong className="gradient-text">{total}({maxTotal})</strong>
            <span className="muted small">{percent.toFixed(0)}%</span>
          </div>

          <label>
            Comment (optional)
            <textarea rows="3" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Feedback for the performer..." />
          </label>

          <button className="btn btn-primary full">
            <FiSave /> {existing ? 'Update Marks' : 'Submit Marks'}
          </button>
        </form>
        )}
      </div>
    </div>
  )
}
