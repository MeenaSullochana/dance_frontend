import { useState } from 'react'
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/Modal'
import { judgeAvatar } from '../../assets/images'

export default function ManageJudges() {
  const { judges, scores, players, addAccount, toggleAccount, deleteAccount, showToast } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await addAccount({ ...form, role: 'judge' })
    if (!res.ok) return setError(res.error)
    showToast('Judge added')
    setForm({ name: '', email: '', password: '' })
    setError('')
    setShowForm(false)
  }

  const handleDelete = async (j) => {
    if (!window.confirm(`Delete judge "${j.name}" and all their marks?`)) return
    const res = await deleteAccount(j.id)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Judge deleted', 'error')
  }

  return (
    <div className="stack">
      <div className="toolbar">
        <p className="muted grow">
          Judges are created by the admin only and can just give marks. Only <strong>active</strong> judges are
          counted when deciding if a player is fully judged.
        </p>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <FiPlus /> Add Judge
        </button>
      </div>

      <div className="panel glass">
        <table className="table">
          <thead>
            <tr><th>Judge</th><th>Email</th><th>Scored</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {judges.map((j) => {
              const count = scores.filter((s) => s.judgeId === j.id).length
              return (
                <tr key={j.id}>
                  <td>
                    <div className="row">
                      <img src={judgeAvatar} alt="" className="avatar" />
                      <strong>{j.name}</strong>
                    </div>
                  </td>
                  <td className="muted">{j.email}</td>
                  <td>
                    {count} / {players.length}
                  </td>
                  <td>
                    <span className={`badge ${j.active ? 'badge-qualified' : 'badge-rejected'}`}>
                      {j.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="actions">
                    <button className="icon-btn" title={j.active ? 'Deactivate' : 'Activate'} onClick={async () => {
                      const res = await toggleAccount(j.id)
                      if (!res.ok) showToast(res.error, 'error')
                    }}>
                      {j.active ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                    <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(j)}>
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              )
            })}
            {!judges.length && (
              <tr><td colSpan="5" className="muted center">No judges yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Add Judge" onClose={() => setShowForm(false)}>
          <form className="form" onSubmit={handleSubmit}>
            <label>
              Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
            <label>
              Password
              <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={4} />
            </label>
            {error && <div className="error">{error}</div>}
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button className="btn btn-primary">Add Judge</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
