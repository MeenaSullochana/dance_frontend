import { FiCheck, FiX } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { judgeAvatar } from '../assets/images'

export default function PendingRegistrations({ accounts }) {
  const { approveAccount, deleteAccount, showToast } = useApp()

  if (!accounts.length) return null

  const handleApprove = async (a) => {
    const res = await approveAccount(a.id)
    if (!res.ok) return showToast(res.error, 'error')
    showToast(`${a.name} approved`)
  }

  const handleReject = async (a) => {
    if (!window.confirm(`Reject registration from "${a.name}"?`)) return
    const res = await deleteAccount(a.id)
    if (!res.ok) return showToast(res.error, 'error')
    showToast('Registration rejected', 'error')
  }

  return (
    <div className="panel glass">
      <h2>
        Pending Registrations <span className="badge badge-pending">{accounts.length}</span>
      </h2>
      <table className="table">
        <thead>
          <tr><th>Name</th><th>Email</th><th>Registered</th><th></th></tr>
        </thead>
        <tbody>
          {accounts.map((a) => (
            <tr key={a.id}>
              <td>
                <div className="row">
                  <img src={judgeAvatar} alt="" className="avatar" />
                  <strong>{a.name}</strong>
                </div>
              </td>
              <td className="muted">{a.email}</td>
              <td className="muted">{a.registeredAt ? new Date(a.registeredAt).toLocaleString() : '-'}</td>
              <td className="actions">
                <button className="icon-btn" title="Approve" onClick={() => handleApprove(a)}>
                  <FiCheck />
                </button>
                <button className="icon-btn danger" title="Reject" onClick={() => handleReject(a)}>
                  <FiX />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
