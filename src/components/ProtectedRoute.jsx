import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { homePath } from '../constants/scoring'

export default function ProtectedRoute({ role, children }) {
  const { currentUser } = useApp()
  if (!currentUser) return <Navigate to="/login" replace />
  if (role && currentUser.role !== role) return <Navigate to={homePath(currentUser.role)} replace />
  return children
}
