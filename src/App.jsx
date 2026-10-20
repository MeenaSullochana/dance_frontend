import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Toast from './components/Toast'
import Home from './pages/Home'
import Login from './pages/Login'
import NotFound from './pages/NotFound'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManagePlayers from './pages/admin/ManagePlayers'
import ManageJudges from './pages/admin/ManageJudges'
import ManageUsers from './pages/admin/ManageUsers'
import ManageClassifications from './pages/admin/ManageClassifications'
import ManageMarks from './pages/admin/ManageMarks'
import ImportRegistrations from './pages/admin/ImportRegistrations'
import UserDashboard from './pages/user/UserDashboard'
import AdminResults from './pages/admin/AdminResults'
import JudgeDashboard from './pages/judge/JudgeDashboard'
import ScorePlayer from './pages/judge/ScorePlayer'

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="players" element={<ManagePlayers />} />
          <Route path="import" element={<ImportRegistrations />} />
          <Route path="classifications" element={<ManageClassifications />} />
          <Route path="marks" element={<ManageMarks />} />
          <Route path="judges" element={<ManageJudges />} />
          <Route path="users" element={<ManageUsers />} />
          <Route path="results" element={<AdminResults />} />
        </Route>

        <Route
          path="/judge"
          element={
            <ProtectedRoute role="judge">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<JudgeDashboard />} />
          <Route path="score/:id" element={<ScorePlayer />} />
        </Route>

        <Route
          path="/user"
          element={
            <ProtectedRoute role="user">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserDashboard />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toast />
    </>
  )
}
