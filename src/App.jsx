import { Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Toast from './components/Toast'
import { useApp } from './context/AppContext'
import Home from './pages/Home'
import Login from './pages/Login'
import SignIn from './pages/SignIn'
import NotFound from './pages/NotFound'
import Terms from './pages/Terms'
import Privacy from './pages/Privacy'
import AdminDashboard from './pages/admin/AdminDashboard'
import ManagePlayers from './pages/admin/ManagePlayers'
import ManageJudges from './pages/admin/ManageJudges'
import ManageWebsite from './pages/admin/ManageWebsite'
import ManageUsers from './pages/admin/ManageUsers'
import ManageClassifications from './pages/admin/ManageClassifications'
import ManageMarks from './pages/admin/ManageMarks'
import ImportRegistrations from './pages/admin/ImportRegistrations'
import UserDashboard from './pages/user/UserDashboard'
import AdminResults from './pages/admin/AdminResults'
import JudgeDashboard from './pages/judge/JudgeDashboard'
import ScorePlayer from './pages/judge/ScorePlayer'

function ConnectingBanner() {
  const { connecting, clubLeaders, players } = useApp()
  const cached = (clubLeaders || []).length > 0 || (players || []).length > 0
  if (!connecting || cached) return null
  return (
    <div className="connect-banner">
      <span className="boot-spinner" />
      Loading live event data…
    </div>
  )
}

export default function App() {
  return (
    <>
      <ConnectingBanner />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/register" element={<SignIn />} />
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
          <Route path="website" element={<ManageWebsite />} />
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
