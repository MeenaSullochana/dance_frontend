import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { FiLock, FiMail, FiArrowLeft, FiUser, FiPhone, FiHome } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { heroBg, rotaryDistrictLogo, dodLogo, rcmnEmblem } from '../assets/images'
import { homePath } from '../constants/scoring'

const STAFF_DEMO = { email: 'admin@dance.com', password: 'admin123' }
const EMPTY_AUDIENCE = { name: '', phone: '', club: '' }

export default function Login() {
  const { login, register, currentUser } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const startAudience = location.state?.staff !== true
  const [audience, setAudience] = useState(startAudience)
  const [mode, setMode] = useState(location.state?.mode === 'register' ? 'register' : 'login')
  const [staff, setStaff] = useState({ email: '', password: '' })
  const [form, setForm] = useState(EMPTY_AUDIENCE)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (currentUser) return <Navigate to={homePath(currentUser.role)} replace />

  const isRegister = audience && mode === 'register'
  const setAudienceField = (key) => (event) => setForm({ ...form, [key]: event.target.value })

  const openAudience = (nextMode = 'login') => {
    setAudience(true)
    setMode(nextMode)
    setError('')
  }

  const openStaff = () => {
    setAudience(false)
    setMode('login')
    setError('')
  }

  const handleStaff = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    const res = await login(staff.email, staff.password)
    setLoading(false)
    if (!res.ok) return setError(res.error)
    navigate(homePath(res.user.role))
  }

  const handleAudience = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    if (isRegister) {
      const res = await register({ name: form.name, phone: form.phone, club: form.club, register: true })
      setLoading(false)
      if (!res.ok) return setError(res.error)
      return navigate(homePath(res.user.role))
    }
    const res = await login(form.phone, '', 'user')
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
      <form className="login-card glass fade-in" onSubmit={audience ? handleAudience : handleStaff}>
        <div className="login-logos">
          <img src={rotaryDistrictLogo} alt="Rotary District 3233" className="logo-district" />
          <img src={dodLogo} alt="DOD – RCM North, 31st Oct" className="logo-dod" />
          <img src={rcmnEmblem} alt="Rotary Club of Madras North" className="logo-emblem" />
        </div>
        <h1 className="gradient-text">Dance Championship</h1>
        <p className="muted">
          {audience
            ? isRegister
              ? 'Sign up with your name and mobile number'
              : 'Audience login with your mobile number'
            : 'Admin and judge sign in with email and password'}
        </p>

        {audience && (
          <div className="tabs full">
            {['login', 'register'].map((item) => (
              <button type="button" key={item} className={`tab ${mode === item ? 'active' : ''}`} onClick={() => { setMode(item); setError('') }}>
                {item === 'login' ? 'Login' : 'Register'}
              </button>
            ))}
          </div>
        )}

        {audience ? (
          <>
            {isRegister && (
              <label className="input-icon">
                <FiUser />
                <input placeholder="Full name" value={form.name} onChange={setAudienceField('name')} required />
              </label>
            )}
            <label className="input-icon">
              <FiPhone />
              <input
                type="tel"
                inputMode="numeric"
                placeholder="Mobile number"
                value={form.phone}
                onChange={setAudienceField('phone')}
                required
                autoComplete="tel"
              />
            </label>
            {isRegister && (
              <label className="input-icon">
                <FiHome />
                <input placeholder="Club name (optional)" value={form.club} onChange={setAudienceField('club')} />
              </label>
            )}
            <p className="muted small">Your mobile number is used as your password.</p>
          </>
        ) : (
          <>
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
          </>
        )}

        {error && <div className="error">{error}</div>}

        <button className="btn btn-primary full" disabled={loading}>
          {loading ? <span className="spinner" /> : audience ? (isRegister ? 'Register as Audience' : 'Login as Audience') : 'Login'}
        </button>

        {audience ? (
          <p className="muted small center">
            Admin or judge?{' '}
            <button type="button" className="link-btn" onClick={openStaff}>
              Email login
            </button>
          </p>
        ) : (
          <>
            <p className="muted small center">
              Audience?{' '}
              <button type="button" className="link-btn" onClick={() => openAudience('login')}>
                Login with mobile
              </button>
              {' · '}
              <button type="button" className="link-btn" onClick={() => openAudience('register')}>
                Sign up
              </button>
            </p>
            <div className="demo-box">
              <span className="muted small">
                Demo admin: {STAFF_DEMO.email} / {STAFF_DEMO.password}
              </span>
              <button type="button" className="link-btn" onClick={fillDemo}>
                Use demo login
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  )
}
