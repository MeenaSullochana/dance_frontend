import { Fragment, useState } from 'react'
import { Link } from 'react-router-dom'
import { FiAward, FiEye, FiEyeOff, FiRefreshCw, FiUser, FiUsers } from 'react-icons/fi'
import { useApp } from '../../context/AppContext'
import StatusBadge from '../../components/StatusBadge'
import { playerPhoto } from '../../utils/playerPhoto'

export default function AdminResults() {
  const { players, playerStats, judges, settings, criteriaFor, classifications, formats, setResultsPublished, toggleWinner, resetDemoData, showToast } = useApp()
  const [tab, setTab] = useState('single')
  const [expanded, setExpanded] = useState(null)

  const ranked = players
    .filter((p) => p.type === tab)
    .sort((a, b) => playerStats[b.id].avg - playerStats[a.id].avg)

  const judgeName = (id) => judges.find((j) => j.id === id)?.name || 'Removed judge'

  const togglePublish = async () => {
    const next = !settings.resultsPublished
    const res = await setResultsPublished(next)
    if (!res.ok) return showToast(res.error, 'error')
    showToast(next ? 'Results published to website' : 'Results hidden from website')
  }

  const handleReset = async () => {
    if (!window.confirm('Reset all data to the original demo data? You will be logged out.')) return
    const res = await resetDemoData()
    if (!res.ok) showToast(res.error, 'error')
  }

  return (
    <div className="stack">
      <div className={`banner glass ${settings.resultsPublished ? 'ok' : ''}`}>
        <span>
          Public website status: <strong>{settings.resultsPublished ? 'Results visible' : 'Results hidden'}</strong>
          {' · '}
          <Link to="/" className="link-btn">View website</Link>
        </span>
        <div className="row">
          <button className="btn btn-ghost" onClick={handleReset}>
            <FiRefreshCw /> Reset demo data
          </button>
          <button className={`btn ${settings.resultsPublished ? 'btn-danger' : 'btn-primary'}`} onClick={togglePublish}>
            {settings.resultsPublished ? <><FiEyeOff /> Unpublish</> : <><FiEye /> Publish Results</>}
          </button>
        </div>
      </div>

      <div className="panel glass">
        <h2>Winners by category</h2>
        <p className="muted small">A winner is listed only in their own category.</p>
        <div className="winner-grid">
          {classifications.filter((item) => item.kind === 'category').map((item) => {
            const winner = players.find((player) => player.winner && player.classificationId === item.id)
            const format = formats.find((entry) => entry.id === item.formatId)?.name
            return (
              <div key={item.id} className="winner-slot">
                <span className="muted small">{format}</span>
                <strong>{item.name}</strong>
                <span>{winner ? winner.name : 'No winner'}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${tab === 'single' ? 'active' : ''}`} onClick={() => setTab('single')}>
          <FiUser /> Single
        </button>
        <button className={`tab ${tab === 'group' ? 'active' : ''}`} onClick={() => setTab('group')}>
          <FiUsers /> Group
        </button>
      </div>

      <div className="panel glass">
        <table className="table">
          <thead>
            <tr><th>#</th><th>Player</th><th>Judges</th><th>Average</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {ranked.map((p, i) => {
              const st = playerStats[p.id]
              const open = expanded === p.id
              return (
                <Fragment key={p.id}>
                  <tr className="clickable" onClick={() => setExpanded(open ? null : p.id)}>
                    <td>{i + 1}</td>
                    <td>
                      <div className="row">
                        <img src={playerPhoto(p)} alt="" className="avatar" />
                        <div>
                          <strong>{p.name}</strong>
                          <span className="muted small block">{p.category}</span>
                        </div>
                      </div>
                    </td>
                    <td>{st.count}</td>
                    <td><strong>{st.avg.toFixed(1)}</strong><span className="muted">/{st.maxTotal}</span> <span className="muted small">({st.percent.toFixed(0)}%)</span></td>
                    <td><StatusBadge status={st.status} /></td>
                    <td className="actions">
                      <button
                        className={`btn small ${p.winner ? 'btn-gold' : 'btn-ghost'}`}
                        onClick={async (e) => {
                          e.stopPropagation()
                          const res = await toggleWinner(p.id)
                          if (!res.ok) showToast(res.error, 'error')
                        }}
                      >
                        <FiAward /> {p.winner ? 'Winner' : 'Set winner'}
                      </button>
                    </td>
                  </tr>
                  {open && (
                    <tr className="detail-row">
                      <td colSpan="6">
                        {st.scores.length ? (
                          <div className="score-detail">
                            {st.scores.map((s) => (
                              <div key={s.id} className="score-detail-item">
                                <strong>{judgeName(s.judgeId)}</strong>
                                <div className="criteria-mini">
                                  {criteriaFor(p.classificationId).map((c) => (
                                    <span key={c.key}>{c.label}: <b>{s.criteria?.[c.key] ?? '—'}</b></span>
                                  ))}
                                </div>
                                <span>Total: <b>{s.total}</b></span>
                                {s.comment && <em className="muted">“{s.comment}”</em>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="muted">No marks yet.</span>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
