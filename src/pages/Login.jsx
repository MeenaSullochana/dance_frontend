import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { FiLock, FiMail, FiArrowLeft, FiUser, FiShield } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { heroBg, rotaryDistrictLogo, dodLogo, rcmnEmblem } from '../assets/images'
import { homePath, REGISTER_ROLES, ROLES } from '../constants/scoring'

const DEMO = {
  admin: { email: 'admin@dance.com', password: 'admin123' },
  judge: { email: 'judge1@dance.com', password: 'judge123' },
  user: { email: 'user@dance.com', password: 'user123' },
}

const EMPTY_FORM = { name: '', email: '', password: '', confirm: '' }
const labelOf = (role) => ROLES.find((r) => r.value === role)?.label || role

export default function Login() {
  const { login, register, currentUser, showToast } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const [mode, setMode] = useState(location.state?.mode === 'register' ? 'register' : 'login')
  const [role, setRole] = useState(location.state?.mode === 'register' ? REGISTER_ROLES[0] : 'admin')
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  if (currentUser) return <Navigate to={homePath(currentUser.role)} replace />

  const isRegister = mode === 'register'
  const roleOptions = isRegister ? ROLES.filter((r) => REGISTER_ROLES.includes(r.value)) : ROLES
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  const switchMode = (next) => {
    setMode(next)
    if (next === 'register' && !REGISTER_ROLES.includes(role)) setRole(REGISTER_ROLES[0])
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (isRegister && form.password !== form.confirm) return setError('Passwords do not match')

    setLoading(true)
    if (isRegister) {
      const res = await register({ ...form, role })
      setLoading(false)
      if (!res.ok) return setError(res.error)
      showToast('Registration sent to admin')
      setForm({ ...EMPTY_FORM, email: form.email })
      setMode('login')
      setSuccess(`Registered as ${labelOf(role)}! You can log in once the admin approves your account.`)
      return
    }
    const res = await login(form.email, form.password, role)
    setLoading(false)
    if (!res.ok) return setError(res.error)
    navigate(homePath(res.user.role))
  }

  const fillDemo = () => {
    setForm({ ...EMPTY_FORM, email: DEMO[role].email, password: DEMO[role].password })
    setError('')
  }

  return (
    <div className="login-page" style={{ backgroundImage: `url(${heroBg})` }}>
      <Link to="/" className="back-link">
        <FiArrowLeft /> Back to website
      </Link>
      <form className="login-card glass fade-in" onSubmit={handleSubmit}>
        <div className="login-logos">
          <img src={rotaryDistrictLogo} alt="Rotary District 3233" className="logo-district" />
          <img src={dodLogo} alt="DOD – RCM North, 31st Oct" className="logo-dod" />
          <img src={rcmnEmblem} alt="Rotary Club of Madras North" className="logo-emblem" />
        </div>
        <h1 className="gradient-text">Dance Championship</h1>
        <p className="muted">{isRegister ? 'Create a new account' : 'Sign in to continue'}</p>

        <div className="tabs full">
          {['login', 'register'].map((m) => (
            <button type="button" key={m} className={`tab ${mode === m ? 'active' : ''}`} onClick={() => switchMode(m)}>
              {m === 'login' ? 'Login' : 'Register'}
            </button>
          ))}
        </div>

        {roleOptions.length > 1 && (
          <label className="input-icon">
            <FiShield />
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value)
                setError('')
              }}
              aria-label="Select role"
            >
              {roleOptions.map((r) => (
                <option key={r.value} value={r.value}>
                  {isRegister ? `Register as ${r.label}` : `Login as ${r.label}`}
                </option>
              ))}
            </select>
          </label>
        )}

        {isRegister && (
          <label className="input-icon">
            <FiUser />
            <input placeholder="Full name" value={form.name} onChange={set('name')} required />
          </label>
        )}
        <label className="input-icon">
          <FiMail />
          <input type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        </label>
        <label className="input-icon">
          <FiLock />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={set('password')}
            required
            minLength={isRegister ? 4 : undefined}
          />
        </label>
        {isRegister && (
          <label className="input-icon">
            <FiLock />
            <input
              type="password"
              placeholder="Confirm password"
              value={form.confirm}
              onChange={set('confirm')}
              required
            />
          </label>
        )}

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <button className="btn btn-primary full" disabled={loading}>
          {loading ? <span className="spinner" /> : `${isRegister ? 'Register' : 'Login'} as ${labelOf(role)}`}
        </button>

        {isRegister ? (
          <p className="muted small center">
            New accounts need admin approval before login. Judge accounts are created by the admin.
          </p>
        ) : (
          <div className="demo-box">
            <span className="muted small">
              Demo: {DEMO[role].email} / {DEMO[role].password}
            </span>
            <button type="button" className="link-btn" onClick={fillDemo}>
              Use demo login
            </button>
          </div>
        )}
      </form>
    </div>
  )
}
