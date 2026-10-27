import { useState } from 'react'
import { FiPlus, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi'
import { useApp } from '../../context/AppContext'
import Modal from '../../components/Modal'
import PendingRegistrations from '../../components/PendingRegistrations'
import { judgeAvatar } from '../../assets/images'

export default function ManageUsers() {
  const { approvedMembers: members, pendingMembers, addAccount, toggleAccount, deleteAccount, showToast } = useApp()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const res = await addAccount({ ...form, role: 'user' })
    if (!res.ok) return setError(res.error)
    showToast('Audience added')
    setForm({ name: '', email: '', password: '' })
    setError('')
    setShowForm(false)
  }

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete audience "${u.name}"?`)) return
    const res = await deleteAccount(u.id)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Audience deleted', 'error')
  }

  return (
    <div className="stack">
      <PendingRegistrations accounts={pendingMembers} />

      <div className="toolbar">
        <p className="muted grow">Add an audience account here, or they can sign up with an email or mobile number. The same password lets them in.</p>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <FiPlus /> Add Audience
        </button>
      </div>

      <div className="panel glass desk-list">
        <table className="table">
          <thead>
            <tr><th>Audience</th><th>Email or mobile</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {members.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="who">
                    <img src={judgeAvatar} alt="" />
                    <span>
                      <strong>{u.name}</strong>
                      <span className="muted small">Audience</span>
                    </span>
                  </div>
                </td>
                <td className="muted small">{u.email || u.phone || '—'}</td>
                <td>
                  <span className={`desk-pill ${u.active ? 'received' : 'alert'}`}>{u.active ? 'Active' : 'Inactive'}</span>
                </td>
                <td className="actions">
                  <button className="btn btn-ghost small" onClick={async () => {
                    const res = await toggleAccount(u.id)
                    if (!res.ok) showToast(res.error, 'error')
                  }}>
                    {u.active ? <FiToggleRight /> : <FiToggleLeft />} {u.active ? 'Active' : 'Off'}
                  </button>
                  <button className="btn btn-danger small" onClick={() => handleDelete(u)}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
            {!members.length && (
              <tr><td colSpan="4" className="muted center">No audience yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Add Audience" onClose={() => setShowForm(false)}>
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
              <button className="btn btn-primary">Add Audience</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
