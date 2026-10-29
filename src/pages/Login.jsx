import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { FiLock, FiMail, FiArrowLeft } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { warmupBackends } from '../config/site'
import { heroBg, rotaryDistrictLogo, dodLogo, rcmnEmblem } from '../assets/images'
import { homePath } from '../constants/scoring'

const STAFF_DEMO = { email: 'admin@dance.com', password: 'admin123' }

export default function Login() {
  const { login, currentUser } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [staff, setStaff] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    warmupBackends()
  }, [])

  if (location.state?.audience) return <Navigate to="/signin" replace />
  if (currentUser) return <Navigate to={homePath(currentUser.role)} replace />

  const handleStaff = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    let res = await login(staff.email, staff.password)
    if (!res.ok && /starting|reach|Cannot reach|not available|50[234]/i.test(res.error || '')) {
      res = await login(staff.email, staff.password)
    }
    setLoading(false)
    if (!res.ok) return setError(res.error)
    navigate(homePath(res.user.role))
  }

  const fillDemo = () => {
    setStaff({ email: STAFF_DEMO.email, password: STAFF_DEMO.password })
    setError('')
  }

  return (
    <div className="login-page" style={{ backgroundImage: `url(${heroBg})` }}>
      <Link to="/" className="back-link">
        <FiArrowLeft /> Back to website
      </Link>
      <form className="login-card glass fade-in" onSubmit={handleStaff}>
        <div className="login-logos">
          <img src={rotaryDistrictLogo} alt="Rotary District 3233" className="logo-district" />
          <img src={dodLogo} alt="DOD – RCM North, 31st Oct" className="logo-dod" />
          <img src={rcmnEmblem} alt="Rotary Club of Madras North" className="logo-emblem" />
        </div>
        <h1 className="gradient-text">Dance Championship</h1>
        <p className="muted">Admin and judge sign in with email and password</p>

        <label className="input-icon">
          <FiMail />
          <input
            type="email"
            placeholder="Email"
            value={staff.email}
            onChange={(event) => setStaff({ ...staff, email: event.target.value })}
            required
            autoComplete="username"
          />
        </label>
        <label className="input-icon">
          <FiLock />
          <input
            type="password"
            placeholder="Password"
            value={staff.password}
            onChange={(event) => setStaff({ ...staff, password: event.target.value })}
            required
            autoComplete="current-password"
          />
        </label>

        {error && <div className="error">{error}</div>}

        <button className="btn btn-primary full" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Sign in'}
        </button>

        <div className="demo-box">
          <span className="muted small">
            Demo admin: {STAFF_DEMO.email} / {STAFF_DEMO.password}
          </span>
          <button type="button" className="link-btn" onClick={fillDemo}>
            Use demo login
          </button>
        </div>
      </form>
    </div>
  )
}
