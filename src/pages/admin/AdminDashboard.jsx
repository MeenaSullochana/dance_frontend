import { Link } from 'react-router-dom'
import { FiUser, FiUsers, FiUserCheck, FiCheckCircle, FiAward, FiArrowRight, FiUpload, FiLayers, FiImage } from 'react-icons/fi'
import { useApp } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import { playerPhoto } from '../../utils/playerPhoto'
import { dodImages, dodLogo } from '../../assets/images'

export default function AdminDashboard() {
  const { players, judges, pendingMembers, scores, playerStats, settings, maxTotal } = useApp()

  const stats = [
    { label: 'Solo', value: players.filter((p) => p.type === 'single').length, icon: FiUser, color: 'pink', to: '/admin/players?type=single' },
    { label: 'Groups', value: players.filter((p) => p.type === 'group').length, icon: FiUsers, color: 'purple', to: '/admin/players?type=group' },
    { label: 'Judges', value: judges.length, icon: FiUserCheck, color: 'orange', to: '/admin/judges' },
    {
      label: 'Fully Judged',
      value: players.filter((p) => ['qualified', 'rejected', 'winner'].includes(playerStats[p.id].status)).length,
      icon: FiCheckCircle,
      color: 'green',
      to: '/admin/results',
    },
  ]

  const recent = [...scores].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6)
  const top = [...players].sort((a, b) => playerStats[b.id].avg - playerStats[a.id].avg).slice(0, 5)
  const nameOf = (list, id) => list.find((x) => x.id === id)?.name || 'Unknown'

  return (
    <div className="stack">
      <section className="admin-hero" style={{ backgroundImage: `url(${dodImages.dodBanner})` }}>
        <div className="admin-hero-copy">
          <span className="admin-kicker">Rotary Club of Madras North · Season 14</span>
          <h2>Dance of District</h2>
          <p>31 October 2026 · 9:00 AM to 5:00 PM · Ethiraj College Auditorium</p>
          <div className="admin-hero-links">
            <Link to="/admin/players" className="btn btn-primary">Manage entries</Link>
            <Link to="/admin/results" className="btn btn-ghost">
              {settings.resultsPublished ? 'Results are live' : 'Publish results'} <FiArrowRight />
            </Link>
          </div>
        </div>
        <img src={dodLogo} alt="" className="admin-hero-mark" />
      </section>

      <div className="stat-grid">
        {stats.map(({ label, value, icon: Icon, color, to }) => (
          <Link key={label} to={to} className={`stat-card glass stat-${color}`}>
            <div className="stat-icon"><Icon /></div>
            <div>
              <strong>{value}</strong>
              <span className="muted">{label}</span>
            </div>
          </Link>
        ))}
      </div>

      {pendingMembers.length > 0 && (
        <div className="banner glass">
          <span>
            <strong>{pendingMembers.length}</strong> audience registration{pendingMembers.length > 1 ? 's' : ''} waiting for approval.
          </span>
          <Link to="/admin/users" className="btn btn-ghost">Review</Link>
        </div>
      )}

      <div className={`banner glass ${settings.resultsPublished ? 'ok' : ''}`}>
        <span>
          Results are <strong>{settings.resultsPublished ? 'PUBLISHED' : 'not published'}</strong> on the public website.
        </span>
        <Link to="/admin/results" className="btn btn-ghost">Manage</Link>
      </div>

      <div className="admin-shortcuts">
        <Link to="/admin/players" className="glass admin-shortcut">
          <FiUsers />
          <strong>Participants</strong>
          <span className="muted small">Add solo dancers, couples, groups, photos and categories.</span>
        </Link>
        <Link to="/admin/judges" className="glass admin-shortcut">
          <FiUserCheck />
          <strong>Judges</strong>
          <span className="muted small">Create judges, posters, sort order, and Season 14 Panel visibility.</span>
        </Link>
        <Link to="/admin/users" className="glass admin-shortcut">
          <FiUser />
          <strong>Audience</strong>
          <span className="muted small">Add an audience account, or they can sign up with an email or mobile number.</span>
        </Link>
        <Link to="/admin/results" className="glass admin-shortcut">
          <FiAward />
          <strong>Results</strong>
          <span className="muted small">Crown winners and publish the leaderboard.</span>
        </Link>
        <Link to="/admin/import" className="glass admin-shortcut">
          <FiUpload />
          <strong>Import Excel</strong>
          <span className="muted small">Upload Google Form responses and auto-classify.</span>
        </Link>
        <Link to="/admin/classifications" className="glass admin-shortcut">
          <FiLayers />
          <strong>Classifications</strong>
          <span className="muted small">Age bands, Rotaractor types, Solo/Couple/Group rules.</span>
        </Link>
        <Link to="/admin/website" className="glass admin-shortcut">
          <FiImage />
          <strong>Leadership</strong>
          <span className="muted small">Add Rotary Club of Madras North leaders, photos, and sort order.</span>
        </Link>
      </div>

      <div className="two-col">
        <div className="panel glass">
          <h2>Recent Scores</h2>
          <table className="table">
            <thead>
              <tr><th>Player</th><th>Judge</th><th>Marks</th></tr>
            </thead>
            <tbody>
              {recent.map((s) => (
                <tr key={s.id}>
                  <td>{nameOf(players, s.playerId)}</td>
                  <td>{nameOf(judges, s.judgeId)}</td>
                  <td><strong>{s.total}</strong><span className="muted">/{playerStats[s.playerId]?.maxTotal || maxTotal}</span></td>
                </tr>
              ))}
              {!recent.length && (
                <tr><td colSpan="3" className="muted center">No scores yet</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="panel glass">
          <h2>Top 5 Leaderboard</h2>
          <ul className="top-list">
            {top.map((p, i) => (
              <li key={p.id}>
                <span className="rank">{i + 1}</span>
                <img src={playerPhoto(p)} alt="" className="avatar" />
                <div className="grow">
                  <strong>{p.name}</strong>
                  <span className="muted small">{p.type === 'group' ? 'Group' : 'Single'} · {p.category}</span>
                </div>
                <span className="score">{playerStats[p.id].avg.toFixed(1)}</span>
                <StatusBadge status={playerStats[p.id].status} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
