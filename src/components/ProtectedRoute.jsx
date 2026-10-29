import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getToken } from '../api/client'
import { homePath } from '../constants/scoring'

export default function ProtectedRoute({ role, children }) {
  const { currentUser, connecting } = useApp()
  if (!currentUser) {
    if (connecting && getToken()) {
      return (
        <div className="session-wait">
          <span className="boot-spinner" />
          <p>Opening your panel…</p>
        </div>
      )
    }
    return <Navigate to={role === 'user' ? '/signin' : '/login'} replace />
  }
  if (role && currentUser.role !== role) return <Navigate to={homePath(currentUser.role)} replace />
  return children
}
