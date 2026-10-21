import { useState } from 'react'
import { FiRadio, FiSave } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { playerPhoto } from '../utils/playerPhoto'
import { memberLabel } from '../utils/member'
import Modal from './Modal'
import StatusBadge from './StatusBadge'
import MarkRounds from './MarkRounds'

export default function StagePopup({ player, mode, onClose }) {
  const {
    scores,
    currentUser,
    submitScore,
    showToast,
    criteriaFor,
    setLivePlayer,
    playerStats,
    settings,
    participantTypes,
    classifications,
  } = useApp()

  const criteria = criteriaFor(player.classificationId)
  const maxTotal = criteria.reduce((sum, item) => sum + Number(item.maxMarks || 0), 0) || 1
  const existing = scores.find((score) => score.playerId === player.id && score.judgeId === currentUser?.id)
  const [marks, setMarks] = useState(() =>
    Object.fromEntries(
      criteria.map((item) => {
        const saved = existing?.criteria?.[item.key]
        return [item.key, Number.isInteger(saved) ? Math.min(Math.max(saved, 1), item.maxMarks) : 1]
      }),
    ),
  )
  const [comment, setComment] = useState(existing?.comment || '')
  const [saving, setSaving] = useState(false)

  const total = criteria.reduce((sum, item) => sum + Number(marks[item.key] || 0), 0)
  const percent = maxTotal ? (total / maxTotal) * 100 : 0
  const typeName = participantTypes.find((item) => item.id === player.participantTypeId)?.name
  const classification = classifications.find((item) => item.id === player.classificationId)?.name
  const stats = playerStats[player.id]
  const showScore = mode !== 'judge' && (mode === 'admin' || settings.resultsPublished)

  const saveMarks = async (event) => {
    event.preventDefault()
    setSaving(true)
    const res = await submitScore(player.id, marks, comment.trim())
    setSaving(false)
    if (!res.ok) return showToast(res.error, 'error')
    showToast(existing ? 'Marks updated' : 'Marks submitted')
    onClose()
  }

  const stopLive = async () => {
    const res = await setLivePlayer(player.id, false)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Stage cleared')
    onClose()
  }

  return (
    <Modal title={mode === 'judge' ? 'Give marks' : 'On stage'} onClose={onClose} wide>
      <div className="stage-layout">
        <div className="stage-player">
          <img src={playerPhoto(player)} alt={player.name} />
          {settings.livePlayerId === player.id && (
            <span className="live-pill inline"><FiRadio /> Live</span>
          )}
          <h2>{player.name}</h2>
          <span className="chip">#{player.chestNo}</span>
          <span className="muted small">
            {classification || player.category}
            {typeName ? ` · ${typeName}` : ''}
            {player.age != null ? ` · Age ${player.age}` : ''}
          </span>
          {player.members?.length > 0 && (
            <div className="member-chips">
              {player.members.map((member) => (
                <span key={memberLabel(member)} className="chip small">{memberLabel(member)}</span>
              ))}
            </div>
          )}
          {stats && <StatusBadge status={showScore ? stats.status : 'pending'} />}
          {mode === 'admin' && settings.livePlayerId === player.id && (
            <button type="button" className="btn btn-danger small" onClick={stopLive}>
              Stop live
            </button>
          )}
        </div>

        {mode === 'judge' && settings.livePlayerId !== player.id ? (
          <div className="stage-note">
            <h3>Marks are closed</h3>
            <p className="muted">A judge can mark {player.name} only while the admin has this participant live.</p>
          </div>
        ) : mode === 'judge' ? (
          <form className="score-form" onSubmit={saveMarks}>
            <p className="muted small">Categories and maximum marks are set by admin.</p>
            {criteria.map((item) => (
              <MarkRounds
                key={item.key}
                label={item.label}
                max={item.maxMarks}
                value={marks[item.key] || 1}
                onChange={(value) => setMarks({ ...marks, [item.key]: value })}
              />
            ))}
            <div className="total-box">
              <span>Total</span>
              <strong className="gradient-text">{total} / {maxTotal}</strong>
              <span className="muted small">{percent.toFixed(0)}%</span>
            </div>
            <label>
              Comment (optional)
              <textarea rows="3" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Feedback for the performer..." />
            </label>
            <button className="btn btn-primary full" disabled={saving}>
              <FiSave /> {existing ? 'Update marks' : 'Submit marks'}
            </button>
          </form>
        ) : mode === 'user' && settings.livePlayerId === player.id ? (
          <form className="score-form" onSubmit={saveMarks}>
            <p className="muted small">Tap a round for each mark. Your score is averaged with the other users.</p>
            {criteria.map((item) => (
              <MarkRounds
                key={item.key}
                label={item.label}
                max={item.maxMarks}
                value={marks[item.key] || 1}
                onChange={(value) => setMarks({ ...marks, [item.key]: value })}
              />
            ))}
            <div className="total-box">
              <span>Your total</span>
              <strong className="gradient-text">{total} / {maxTotal}</strong>
            </div>
            <button className="btn btn-primary full" disabled={saving}>
              <FiSave /> {existing ? 'Update marks' : 'Submit marks'}
            </button>
          </form>
        ) : (
          <div className="stage-note">
            <h3>{player.name} is {settings.livePlayerId === player.id ? 'performing now' : 'selected'}</h3>
            <p className="muted">
              {mode === 'admin'
                ? 'Judges and users can mark this performer while they are live. Winners are chosen from the judge average.'
                : settings.resultsPublished
                  ? 'Results are published. The winner comes from the judge average.'
                  : 'Marks stay hidden until the admin publishes results.'}
            </p>
            {showScore && stats && (
              <p>
                Judge average <strong>{stats.avg.toFixed(1)}</strong>
                <span className="muted"> / {maxTotal} · {stats.count} judges</span>
              </p>
            )}
            {showScore && stats?.publicCount > 0 && (
              <p>
                Public average <strong>{stats.publicAvg.toFixed(1)}</strong>
                <span className="muted"> from {stats.publicCount} users</span>
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
