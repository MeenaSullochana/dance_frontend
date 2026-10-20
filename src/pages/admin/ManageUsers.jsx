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
    showToast('User added')
    setForm({ name: '', email: '', password: '' })
    setError('')
    setShowForm(false)
  }

  const handleDelete = async (u) => {
    if (!window.confirm(`Delete user "${u.name}"?`)) return
    const res = await deleteAccount(u.id)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('User deleted', 'error')
  }

  return (
    <div className="stack">
      <PendingRegistrations accounts={pendingMembers} />

      <div className="toolbar">
        <p className="muted grow">Users can log in to view players and published results.</p>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <FiPlus /> Add User
        </button>
      </div>

      <div className="panel glass">
        <table className="table">
          <thead>
            <tr><th>User</th><th>Email</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {members.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="row">
                    <img src={judgeAvatar} alt="" className="avatar" />
                    <strong>{u.name}</strong>
                  </div>
                </td>
                <td className="muted">{u.email}</td>
                <td>
                  <span className={`badge ${u.active ? 'badge-qualified' : 'badge-rejected'}`}>
                    {u.active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="actions">
                  <button className="icon-btn" title={u.active ? 'Deactivate' : 'Activate'} onClick={async () => {
                    const res = await toggleAccount(u.id)
                    if (!res.ok) showToast(res.error, 'error')
                  }}>
                    {u.active ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                  <button className="icon-btn danger" title="Delete" onClick={() => handleDelete(u)}>
                    <FiTrash2 />
                  </button>
                </td>
              </tr>
            ))}
            {!members.length && (
              <tr><td colSpan="4" className="muted center">No users yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <Modal title="Add User" onClose={() => setShowForm(false)}>
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
              <button className="btn btn-primary">Add User</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
