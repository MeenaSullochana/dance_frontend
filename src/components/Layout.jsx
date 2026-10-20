import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  FiAward,
  FiGrid,
  FiLogOut,
  FiMenu,
  FiUser,
  FiUserCheck,
  FiUsers,
  FiGlobe,
  FiEdit3,
  FiLayers,
  FiUpload,
  FiSliders,
} from 'react-icons/fi'
import { useApp } from '../context/AppContext'
import { SITE } from '../config/site'
import { dodLogo, judgeAvatar, rcmnEmblem, rotaryDistrictLogo } from '../assets/images'

const LINKS = {
  admin: [
    { to: '/admin', label: 'Dashboard', icon: FiGrid, end: true },
    { to: '/admin/players', label: 'Players', icon: FiUsers },
    { to: '/admin/import', label: 'Import', icon: FiUpload },
    { to: '/admin/classifications', label: 'Classifications', icon: FiLayers },
    { to: '/admin/marks', label: 'Mark Categories', icon: FiSliders },
    { to: '/admin/judges', label: 'Judges', icon: FiUserCheck },
    { to: '/admin/users', label: 'Users', icon: FiUser },
    { to: '/admin/results', label: 'Results', icon: FiAward },
  ],
  judge: [{ to: '/judge', label: 'Give Marks', icon: FiEdit3, end: true }],
  user: [{ to: '/user', label: 'Players & Results', icon: FiAward, end: true }],
}

const PANEL_NAMES = { admin: 'Admin Panel', judge: 'Judge Panel', user: 'User Panel' }

const TITLES = {
  '/admin': 'Dashboard',
  '/admin/players': 'Manage Players',
  '/admin/import': 'Import Google Form',
  '/admin/classifications': 'Classifications',
  '/admin/marks': 'Mark Categories',
  '/admin/judges': 'Manage Judges',
  '/admin/users': 'Manage Users',
  '/admin/results': 'Results & Publishing',
  '/judge': 'Judge Panel',
  '/user': 'Players & Results',
}

export default function Layout() {
  const { currentUser, logout } = useApp()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const links = LINKS[currentUser.role] || []
  const title = TITLES[pathname] || (pathname.startsWith('/judge/score') ? 'Give Marks' : '')
  const apiHost = (() => {
    try {
      return new URL(SITE.backendUrl).host
    } catch {
      return SITE.backendUrl
    }
  })()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className={`layout ${currentUser.role}-shell`}>
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src={dodLogo} alt="Dance of District" />
          <div>
            <strong>Dance of District</strong>
            <span className="muted small">{PANEL_NAMES[currentUser.role]}</span>
          </div>
        </div>
        <div className="sidebar-logos">
          <img src={rotaryDistrictLogo} alt="Rotary District 3233" />
          <img src={rcmnEmblem} alt="Rotary Club of Madras North" />
        </div>
        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className="side-link">
              <Icon /> {label}
            </NavLink>
          ))}
          <NavLink to="/" className="side-link" onClick={() => setOpen(false)}>
            <FiGlobe /> Public Website
          </NavLink>
        </nav>
        <p className="sidebar-api" title={SITE.backendUrl}>
          <span className="api-dot" /> {apiHost}
        </p>
        <button className="side-link logout" onClick={handleLogout}>
          <FiLogOut /> Logout
        </button>
      </aside>
      {open && <div className="sidebar-overlay" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen(true)} aria-label="Menu">
            <FiMenu />
          </button>
          <div className="topbar-title">
            <h1>{title}</h1>
            <span className="muted small">31 Oct 2026 · Ethiraj College Auditorium</span>
          </div>
          <div className="topbar-user">
            <div className="text-right">
              <strong>{currentUser.name}</strong>
              <span className="muted small">{currentUser.role}</span>
            </div>
            <img src={judgeAvatar} alt="" className="avatar" />
          </div>
        </header>
        <main className="content fade-in" key={pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
