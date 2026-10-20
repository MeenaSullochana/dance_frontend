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

export default function PlayerCard({ player, stats, children, showScore = true, participantTypes = [], live = false }) {
  const { classifications } = useApp()
  const price = classifications.find((item) => item.id === player.classificationId)?.price
  const format = formatLabel(player)
  const FormatIcon = format.icon
  const typeName = participantTypes.find((item) => item.id === player.participantTypeId)?.name

  return (
    <div className={`player-card glass ${live ? 'is-live' : ''}`}>
      <div className="player-card-img">
        <img src={playerPhoto(player)} alt={player.name} />
        <span className="chest-no">#{player.chestNo}</span>
        {live && <span className="live-pill">LIVE</span>}
        <div className="player-card-status">
          <StatusBadge status={stats.status} />
        </div>
      </div>
      <div className="player-card-body">
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
        </div>
        {showScore && (
          <div className="score-line">
            <div className="progress">
              <div className="progress-fill" style={{ width: `${stats.percent}%` }} />
            </div>
            <span className="small">
              {stats.count ? `${stats.avg.toFixed(1)} / ${stats.maxTotal || 0}` : 'No marks yet'}
              {price != null && ` · Rs.${price}`}
            </span>
          </div>
        )}
        {children && <div className="player-card-actions">{children}</div>}
      </div>
    </div>
  )
}
