import { useState } from 'react'
import { FiRadio, FiSave } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { playerPhoto } from '../utils/playerPhoto'
import { isPerforming, isVotingOpen, registeredId } from '../utils/playerIds'
import { memberLabel } from '../utils/member'
import Modal from './Modal'
import StatusBadge from './StatusBadge'
import MarkRounds from './MarkRounds'

const VOTING_CLOSED = 'Voting lines will open only during/ after the performance'
const AUDIENCE_ONCE = "Once you submit, you can't redo the voting"

export default function StagePopup({ player, mode, onClose }) {
  const {
    scores,
    currentUser,
    submitScore,
    showToast,
    criteriaFor,
    setLivePlayer,
    setPlayerVoting,
    playerStats,
    settings,
    participantTypes,
    classifications,
  } = useApp()

  const criteria = criteriaFor(player.classificationId)
  const maxTotal = criteria.reduce((sum, item) => sum + Number(item.maxMarks || 0), 0) || 1
  const publicMax = Number(settings.publicMaxMarks) || 10
  const existing = scores.find((score) => score.playerId === player.id && score.judgeId === currentUser?.id)
  const live = isPerforming(settings, player)
  const voting = isVotingOpen(settings, player)
  const [marks, setMarks] = useState(() =>
    Object.fromEntries(
      criteria.map((item) => {
        const saved = existing?.criteria?.[item.key]
        return [item.key, Number.isInteger(saved) ? Math.min(Math.max(saved, 1), item.maxMarks) : 1]
      }),
    ),
  )
  const [overall, setOverall] = useState(() => {
    const saved = existing?.criteria?.overall
    return Number.isInteger(saved) ? Math.min(Math.max(saved, 1), publicMax) : 1
  })
  const [comment, setComment] = useState(existing?.comment || '')
  const [saving, setSaving] = useState(false)
  const [justVoted, setJustVoted] = useState(false)

  const total = criteria.reduce((sum, item) => sum + Number(marks[item.key] || 0), 0)
  const percent = maxTotal ? (total / maxTotal) * 100 : 0
  const typeName = participantTypes.find((item) => item.id === player.participantTypeId)?.name
  const classification = classifications.find((item) => item.id === player.classificationId)?.name
  const stats = playerStats[player.id]
  const showScore = mode !== 'judge' && (mode === 'admin' || settings.resultsPublished)
  const audienceLocked = mode === 'user' && Boolean(existing || justVoted)

  const saveMarks = async (event) => {
    event.preventDefault()
    setSaving(true)
    const res = await submitScore(player.id, mode === 'user' ? { overall } : marks, comment.trim())
    setSaving(false)
    if (!res.ok) return showToast(res.error, 'error')
    if (mode === 'user') {
      setJustVoted(true)
      showToast('Vote submitted')
      return
    }
    showToast(existing ? 'Marks updated' : 'Marks submitted')
    onClose()
  }

  const stopLive = async () => {
    const res = await setLivePlayer(player.id, false)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Stage cleared')
    onClose()
  }

  const startVoting = async () => {
    const res = await setPlayerVoting(player.id, true)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Voting started')
  }

  const closedNote = (
    <div className="stage-note">
      <h3>Voting closed</h3>
      <p className="muted">{VOTING_CLOSED}</p>
    </div>
  )

  const performingNote = (
    <div className="stage-note">
      <h3>{player.name} is performing now</h3>
      <p className="muted">{VOTING_CLOSED}</p>
    </div>
  )

  return (
    <Modal title={mode === 'judge' ? 'Give marks' : mode === 'user' ? 'Vote' : 'On stage'} onClose={onClose} wide>
      <div className="stage-layout">
        <div className="stage-player">
          <img src={playerPhoto(player)} alt={player.name} />
          {live && (
            <span className="live-pill inline"><FiRadio /> {voting ? 'Voting' : 'Live'}</span>
          )}
          <h2>{player.name}</h2>
          <span className="chip">{registeredId(player)}{player.arrivalNo ? ` · ${player.arrivalNo}` : ''}</span>
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
          {mode === 'admin' && live && (
            <button type="button" className="btn btn-danger small" onClick={stopLive}>
              Stop live
            </button>
          )}
        </div>

        {mode === 'judge' && !voting ? (
          live ? performingNote : closedNote
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
              <strong className="gradient-text">{total}({maxTotal})</strong>
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
        ) : audienceLocked ? (
          <div className="stage-note">
            <h3>Vote recorded</h3>
            <p className="muted">Your mark: <strong>{existing?.criteria?.overall ?? existing?.total ?? overall}({publicMax})</strong></p>
            <p className="vote-once-note">{AUDIENCE_ONCE}</p>
            <button type="button" className="btn btn-primary" onClick={onClose}>Done</button>
          </div>
        ) : mode === 'user' && !voting ? (
          live ? performingNote : closedNote
        ) : mode === 'user' ? (
          <form className="score-form" onSubmit={saveMarks}>
            <p className="muted small">Give one overall mark. The maximum is set by the admin.</p>
            <MarkRounds label="Overall" max={publicMax} value={overall} onChange={setOverall} />
            <div className="total-box">
              <span>Your mark</span>
              <strong className="gradient-text">{overall}({publicMax})</strong>
            </div>
            <button className="btn btn-primary full" disabled={saving}>
              <FiSave /> Submit mark
            </button>
          </form>
        ) : (
          <div className="stage-note">
            <h3>{player.name} is {live ? 'performing now' : 'selected'}</h3>
            <p className="muted">
              {live && !voting
                ? 'Judges and audience can see this performance. Marks stay closed until you click Voting started.'
                : voting
                  ? 'Voting is open. Judges and audience can put marks now.'
                  : 'Go live first, then click Voting started when you want marks.'}
            </p>
            {live && !voting && (
              <button type="button" className="btn btn-primary" onClick={startVoting}>
                Voting started
              </button>
            )}
            {voting && <span className="desk-pill received">Voting started</span>}
            {showScore && stats && (
              <p>
                Judge average <strong>{stats.avg.toFixed(1)}</strong>
                <span className="muted"> / {maxTotal} · {stats.count} judges</span>
              </p>
            )}
            {showScore && stats?.publicCount > 0 && (
              <p>
                Public average <strong>{stats.publicAvg.toFixed(1)}</strong>
                <span className="muted"> / {publicMax} from {stats.publicCount} audience</span>
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
