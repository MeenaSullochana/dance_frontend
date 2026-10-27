import { FiUsers, FiUser } from 'react-icons/fi'
import { FaUserFriends } from 'react-icons/fa'
import { useApp } from '../context/AppContext'
import StatusBadge from './StatusBadge'
import { playerPhoto } from '../utils/playerPhoto'

function formatLabel(player) {
  if (player.type === 'group' || player.formatKey === 'group') {
    return { icon: FiUsers, text: `${player.members?.length || 0} members` }
  }
  if (player.type === 'couple' || player.formatKey === 'couple') {
    return { icon: FaUserFriends, text: 'Couple' }
  }
  return { icon: FiUser, text: 'Solo' }
}

const FEE_LABEL = {
  received: 'Received',
  not_received: 'Not received',
  doubt: 'Doubt',
}

export default function PlayerCard({ player, stats, children, showScore = true, participantTypes = [], live = false }) {
  const { classifications } = useApp()
  const category = classifications.find((item) => item.id === player.classificationId)
  const parent = category?.parentId && classifications.find((item) => item.id === category.parentId)
  const price = parent ? parent.price : category?.price
  const format = formatLabel(player)
  const FormatIcon = format.icon
  const typeName = participantTypes.find((item) => item.id === player.participantTypeId)?.name
  const fee = player.feeStatus || 'pending'
  const alert = fee === 'not_received' || fee === 'doubt'

  return (
    <div className={`player-card glass ${live ? 'is-live' : ''} ${alert ? 'is-alert' : ''}`}>
      <div className="player-card-img">
        <img src={playerPhoto(player)} alt={player.name} />
        <span className="chest-no">#{player.chestNo}</span>
        {live && <span className="live-pill">LIVE</span>}
        <div className="player-card-status">
          <StatusBadge status={stats.status} />
        </div>
      </div>
      <div className="player-card-body">
        <div className="desk-pills">
          <span className="desk-pill ok">Registered</span>
          <span className={`desk-pill ${alert ? 'alert' : fee || 'pending'}`}>{FEE_LABEL[fee] || 'Update fee'}</span>
          {player.arrivalNo && <span className="desk-pill id">{player.arrivalNo}</span>}
          {player.arrived && !player.arrivalNo && <span className="desk-pill id">Arrived</span>}
        </div>
        <h3>{player.name}</h3>
        <div className="player-meta">
          <span className="chip">{player.category}</span>
          {player.danceStyle && player.danceStyle !== player.category && (
            <span className="chip small">{player.danceStyle}</span>
          )}
          <span className="muted small">
            <FormatIcon /> {format.text}
            {player.age != null && ` · Age ${player.age}`}
            {typeName && ` · ${typeName}`}
          </span>
          {(player.phone || player.email) && (
            <span className="muted small">{[player.phone, player.email].filter(Boolean).join(' · ')}</span>
          )}
        </div>
        {showScore && (
          <div className="score-line">
            <div className="progress">
              <div className="progress-fill" style={{ width: `${stats.percent}%` }} />
            </div>
            <span className="small">
              {stats.count ? `Judges ${stats.avg.toFixed(1)} / ${stats.maxTotal || 0}` : 'No judge marks yet'}
              {stats.publicCount > 0 && ` · Public ${stats.publicAvg.toFixed(1)} (${stats.publicCount} users)`}
              {price != null && ` · Rs.${price}`}
            </span>
          </div>
        )}
        {children && <div className="player-card-actions">{children}</div>}
      </div>
    </div>
  )
}
