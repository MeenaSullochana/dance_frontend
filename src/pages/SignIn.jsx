import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiUser, FiPhone, FiHome } from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { warmupBackends } from '../config/site'
import { heroBg, rotaryDistrictLogo, dodLogo, rcmnEmblem } from '../assets/images'
import { homePath } from '../constants/scoring'

const EMPTY = { name: '', phone: '', club: '' }

export default function SignIn() {
  const { register, currentUser } = useApp()
  const navigate = useNavigate()
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    warmupBackends()
  }, [])

  if (currentUser) return <Navigate to={homePath(currentUser.role)} replace />

  const setField = (key) => (event) => setForm({ ...form, [key]: event.target.value })

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    let res = await register({ name: form.name, phone: form.phone, club: form.club })
    if (!res.ok && /starting|reach|Cannot reach|not available|50[234]/i.test(res.error || '')) {
      res = await register({ name: form.name, phone: form.phone, club: form.club })
    }
    setLoading(false)
    if (!res.ok) return setError(res.error)
    navigate(homePath(res.user.role))
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
        <h1 className="gradient-text">Audience sign in</h1>
        <p className="muted">Enter your name and mobile number. If this number is already used, you go to that account. A new number creates a new record.</p>

        <label className="input-icon">
          <FiUser />
          <input placeholder="Full name" value={form.name} onChange={setField('name')} required />
        </label>
        <label className="input-icon">
          <FiPhone />
          <input
            type="tel"
            inputMode="numeric"
            placeholder="Mobile number"
            value={form.phone}
            onChange={setField('phone')}
            required
            autoComplete="tel"
          />
        </label>
        <label className="input-icon">
          <FiHome />
          <input placeholder="Club name (optional)" value={form.club} onChange={setField('club')} />
        </label>

        {error && <div className="error">{error}</div>}

        <button className="btn btn-primary full" disabled={loading}>
          {loading ? <span className="spinner" /> : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
