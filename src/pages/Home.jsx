import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FiLogIn,
  FiUsers,
  FiUser,
  FiUserCheck,
  FiUserPlus,
  FiAward,
  FiArrowRight,
  FiEdit3,
  FiMapPin,
  FiCalendar,
  FiChevronDown,
  FiChevronUp,
  FiClock,
  FiDownload,
  FiX,
  FiZoomIn,
} from 'react-icons/fi'
import {
  GiMusicalNotes,
  GiLaurelCrown,
  GiBallerinaShoes,
  GiPartyPopper,
} from 'react-icons/gi'
import { TbInfinity } from 'react-icons/tb'
import { useApp } from '../context/AppContext'
import { dancePhotos, dodImages, sliderImages, rotaryDistrictLogo, dodLogo, rcmnEmblem } from '../assets/images'
import StatusBadge from '../components/StatusBadge'
import HeroSlider from '../components/HeroSlider'
import ContactSection from '../components/ContactSection'
import FloatingContact from '../components/FloatingContact'
import SiteFooter from '../components/SiteFooter'
import { SOCIAL_LINKS } from '../constants/contact'
import { playerPhoto } from '../utils/playerPhoto'
import { registeredId } from '../utils/playerIds'
import { categoryPlaces, PLACE_LABELS } from '../utils/podium'
import { memberLabel } from '../utils/member'
import { homePath } from '../constants/scoring'
import { participantsPath } from '../utils/participantType'
import { DANCE_STYLES, STYLE_GROUPS } from '../constants/danceStyles'
import { sitePhoto, bySortOrder, visibleSitePeople } from '../utils/sitePeople'

const LEADER_ICONS = {
  crown: GiLaurelCrown,
  edit: FiEdit3,
  users: FiUsers,
  award: FiAward,
}

const MEDALS = ['🥇', '🥈', '🥉']

const SLIDES = sliderImages

const STYLES_PREVIEW = 10

const EVENT = {
  date: '31st October 2026',
  time: '9:00 AM to 5:00 PM',
  venue: 'Ethiraj College Auditorium',
  signature: 'Signature Event of Rotary Club of Madras North · Season 14',
  organiser: 'Rotary District 3233 Events Committee',
}

const REGISTER_FORM_URL = 'https://forms.gle/DfZcNMxHF6HdS6HV6'
const APP_DOWNLOAD_URL = 'https://apk.senatespace.in/'

const REGISTER_PERKS = [
  { icon: FiUser, title: 'Solo', text: 'Showcase your own style' },
  { icon: FiUsers, title: 'Group', text: 'Perform with your team' },
  { icon: TbInfinity, title: 'Unlimited', text: 'Entries in every category' },
]

export default function Home() {
  const { players, playerStats, settings, currentUser, judges, activeJudges, maxTotal, classifications, clubLeaders } = useApp()
  const judgePosters = bySortOrder(judges.filter((judge) => judge.showOnPanel))
  const leaders = visibleSitePeople(clubLeaders)
  const [tab, setTab] = useState('single')
  const [styleGroup, setStyleGroup] = useState('All')
  const [showAllStyles, setShowAllStyles] = useState(false)
  const [selectedJudge, setSelectedJudge] = useState(null)

  useEffect(() => {
    if (!selectedJudge) return undefined
    const onKey = (event) => {
      if (event.key === 'Escape') setSelectedJudge(null)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKey)
    }
  }, [selectedJudge])

  const filteredStyles = styleGroup === 'All' ? DANCE_STYLES : DANCE_STYLES.filter((s) => s.group === styleGroup)
  const visibleStyles = showAllStyles ? filteredStyles : filteredStyles.slice(0, STYLES_PREVIEW)
  const ranked = useMemo(
    () =>
      players
        .filter((p) => p.type === tab)
        .map((p) => ({ ...p, stats: playerStats[p.id] }))
        .sort((a, b) => b.stats.avg - a.stats.avg),
    [players, playerStats, tab],
  )

  const winners = players.filter((p) => p.winner)

  const role = currentUser?.role
  const stats = [
    {
      icon: FiUser,
      value: players.filter((p) => p.type === 'single').length,
      label: 'Solo',
      to: role ? participantsPath(role, 'single') : '/signin',
    },
    {
      icon: FiUsers,
      value: players.filter((p) => p.type === 'group').length,
      label: 'Groups',
      to: role ? participantsPath(role, 'group') : '/signin',
    },
    {
      icon: FiUserCheck,
      value: activeJudges.length,
      label: 'Judges',
      to: role === 'admin' ? '/admin/judges' : role ? homePath(role) : '/login',
    },
    {
      icon: GiBallerinaShoes,
      value: DANCE_STYLES.length,
      label: 'Styles',
      to: '#styles',
    },
  ]

  return (
    <div className="public">
      <header className="public-nav">
        <div className="nav-social">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
              <Icon />
            </a>
          ))}
        </div>

        <a href="#top" className="brand-logos">
          <img src={rotaryDistrictLogo} alt="Rotary District 3233" className="logo-district" />
          <img src={dodLogo} alt="DOD – RCM North, 31st Oct" className="logo-dod" />
          <img src={rcmnEmblem} alt="Rotary Club of Madras North" className="logo-emblem" />
        </a>

        <div className="nav-right">
          <Link to={currentUser ? homePath(currentUser.role) : '/signin'} className="btn btn-primary">
            <FiLogIn /> <span className="nav-login-text">{currentUser ? 'Dashboard' : 'Sign in'}</span>
          </Link>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-glow hero-glow-pink" />
        <div className="hero-glow hero-glow-purple" />

        <div className="hero-inner fade-in">
          <span className="chip">
            <GiMusicalNotes /> {EVENT.signature}
          </span>
          <h1>
            Feel the <span className="gradient-text">Rhythm</span>,<br />
            Own the <span className="gradient-text">Stage</span>
          </h1>
          <p className="muted">
            Dance of District (Season 14), the signature event of Rotary Club of Madras North. Solo and group performers take the stage across{' '}
            {DANCE_STYLES.length} dance styles, from Bharatanatyam to Breakdance, in front of our expert judges.
          </p>
          <div className="hero-meta muted small">
            <span><FiCalendar /> {EVENT.date}</span>
            <span><FiClock /> {EVENT.time}</span>
            <span><FiMapPin /> {EVENT.venue}</span>
          </div>
          <div className="hero-actions">
            {currentUser ? (
              <Link to={homePath(currentUser.role)} className="btn btn-primary">
                <FiLogIn /> Open Dashboard
              </Link>
            ) : (
              <Link to="/signin" className="btn btn-primary">
                <FiLogIn /> Sign in as Audience
              </Link>
            )}
            <a href={REGISTER_FORM_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <FiUserPlus /> Register Now
            </a>
            <a href={APP_DOWNLOAD_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <FiDownload /> Download App
            </a>
          </div>
          <div className="hero-stats">
            {stats.map(({ icon: Icon, value, label, to, state }) => {
              const body = (
                <>
                  <Icon className="hero-stat-icon" />
                  <strong>{value}</strong>
                  <span>{label}</span>
                </>
              )
              if (to?.startsWith('#')) {
                return (
                  <a key={label} href={to} className="hero-stat">
                    {body}
                  </a>
                )
              }
              return (
                <Link key={label} to={to} state={state} className="hero-stat">
                  {body}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="hero-visual">
          <HeroSlider slides={SLIDES} className="poster-slider" />
          <div className="hero-badge glass">
            <GiPartyPopper />
            <div>
              <strong>31st Oct</strong>
              <span className="muted small">Rotary Year 2026-27</span>
            </div>
          </div>
        </div>
      </section>

      <section className="public-section wide" id="register">
        <div className="register-cta">
          <div className="register-glow" />
          <div className="register-content">
            <span className="register-pill"><span className="register-dot" /> Registrations Open</span>
            <h2>
              Ready to <span className="gradient-text">Take the Stage?</span>
            </h2>
            <p>
              Register your solo or group performance for Dance of District. It takes less than 2 minutes — fill in the
              form and our team will get in touch with you.
            </p>
            <div className="register-perks">
              {REGISTER_PERKS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="register-perk">
                  <Icon />
                  <div>
                    <strong>{title}</strong>
                    <span>{text}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="register-actions">
              <a href={REGISTER_FORM_URL} target="_blank" rel="noreferrer" className="btn btn-primary register-btn">
                <FiEdit3 /> Fill Registration Form <FiArrowRight />
              </a>
              <a href={APP_DOWNLOAD_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">
                <FiDownload /> Download App
              </a>
              <span className="register-meta">
                <FiCalendar /> {EVENT.date} · <FiClock /> {EVENT.time}
              </span>
            </div>
          </div>
          <div className="register-ticket">
            <GiBallerinaShoes className="register-ticket-icon" />
            <span className="register-ticket-label">Dance of District · Season 14</span>
            <strong>31 OCT</strong>
            <span>{EVENT.venue}</span>
            <span className="register-ticket-rule" />
            <span className="register-ticket-small">Rotary Year 2026-27</span>
          </div>
        </div>
      </section>

      {judgePosters.length > 0 && (
        <section className="public-section wide" id="judges">
          <div className="section-intro">
            <span className="chip"><GiLaurelCrown /> Meet Our Judges</span>
            <h2 className="section-title">Season 14 Panel</h2>
            <p className="muted">The experts scoring Dance of District this year.</p>
          </div>
          <div className="judge-cards">
            {judgePosters.map((judge) => {
              const poster = { ...judge, image: sitePhoto(judge) }
              return (
                <article
                  key={judge.id}
                  className="judge-card glass"
                  role="button"
                  tabIndex={0}
                  aria-label={`View ${judge.name} poster`}
                  onClick={() => setSelectedJudge(poster)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedJudge(poster)
                    }
                  }}
                >
                  <div className="judge-card-photo">
                    <img src={poster.image} alt={`${judge.name}, judge for Dance of District Season 14`} loading="lazy" />
                    <span className="judge-card-view"><FiZoomIn /> View</span>
                  </div>
                  <div className="judge-card-info">
                    <h3>{judge.name}</h3>
                    <p className="leader-role">{judge.panelRole || judge.role}</p>
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      {leaders.length > 0 && (
        <section className="public-section wide">
          <div className="section-intro">
            <span className="chip"><FiUsers /> Club Leadership</span>
            <h2 className="section-title">Rotary Club of Madras North</h2>
            <p className="muted">Leading the club through Rotary Year 2026-27</p>
          </div>
          <div className="leaders" style={{ '--leader-count': Math.max(leaders.length, 1) }}>
            {leaders.map((leader) => {
              const Icon = LEADER_ICONS[leader.icon] || FiUsers
              return (
                <article key={leader.id} className="leader-card glass">
                  <div className="leader-photo">
                    <img src={sitePhoto(leader)} alt={leader.name} loading="lazy" />
                    <span className="leader-badge"><Icon /> {leader.title}</span>
                  </div>
                  <div className="leader-info">
                    <h3>{leader.name}</h3>
                    <p className="leader-role">{leader.role}</p>
                    <span className="leader-rule" />
                    {(leader.lines || []).map((line) => (
                      <p key={line} className="muted small">{line}</p>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      )}

      <section className="public-section wide" id="venue">
        <div className="section-intro">
          <span className="chip"><FiMapPin /> Venue</span>
          <h2 className="section-title">The Grand Stage</h2>
        </div>
        <div className="feature-row">
          <div className="feature-text">
            <h3>Ethiraj College Auditorium</h3>
            <p className="muted">
              The Ethiraj College Auditorium provides the perfect acoustic and aesthetic backdrop for our cultural
              gala, with a spacious stage and comfortable seating for performers and audiences alike.
            </p>
            <p className="muted">
              From 9:00 AM to 5:00 PM on 31st October 2026, this landmark venue comes alive with the
              forward-looking spirit of Rotary.
            </p>
          </div>
          <img src={dodImages.ethirajCollege} alt="Ethiraj College Auditorium" className="feature-img" />
        </div>
      </section>

      <section className="public-section wide" id="styles">
        <div className="section-intro">
          <span className="chip"><GiBallerinaShoes /> Dance Styles</span>
          <h2 className="section-title">{DANCE_STYLES.length} Styles, One Stage</h2>
          <p className="muted">From Bharatanatyam to Breakdance, every style is welcome. Unlimited entries in every category.</p>
        </div>

        <div className="tabs style-tabs">
          {['All', ...STYLE_GROUPS].map((g) => (
            <button
              key={g}
              className={`tab ${styleGroup === g ? 'active' : ''}`}
              onClick={() => {
                setStyleGroup(g)
                setShowAllStyles(false)
              }}
            >
              {g} <span className="tab-count">{g === 'All' ? DANCE_STYLES.length : DANCE_STYLES.filter((s) => s.group === g).length}</span>
            </button>
          ))}
        </div>

        <div className="style-grid">
          {visibleStyles.map((s) => {
            const count = players.filter((p) => p.category === s.name).length
            return (
              <div key={s.name} className="style-card fade-in" style={{ '--accent': s.color }}>
                <img src={s.photo} alt={s.name} loading="lazy" />
                <span className="style-tag"><TbInfinity /> Unlimited</span>
                <div className="style-overlay">
                  <h3>{s.name}</h3>
                  <span className="small">
                    <FiUsers /> {count} {count === 1 ? 'entry' : 'entries'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {filteredStyles.length > STYLES_PREVIEW && (
          <button className="btn btn-ghost center-btn" onClick={() => setShowAllStyles((v) => !v)}>
            {showAllStyles ? (
              <>Show less <FiChevronUp /></>
            ) : (
              <>View all {filteredStyles.length} styles <FiChevronDown /></>
            )}
          </button>
        )}
      </section>

      <section className="public-section" id="results">
        {!settings.resultsPublished ? (
          <div className="coming-soon glass">
            <img src={dancePhotos.balletSolo} alt="" className="coming-soon-bg" />
            <GiMusicalNotes size={48} />
            <h2>Results coming soon</h2>
            <p className="muted">Our judges are scoring the performances. Check back after the results are published.</p>
            {!currentUser && (
              <Link to="/signin" className="btn btn-ghost">
                <FiLogIn /> Sign in to follow along <FiArrowRight />
              </Link>
            )}
          </div>
        ) : (
          <>
            {(settings.podium?.overallId || winners.length > 0) && (
              <div className="winners">
                <h2 className="section-title"><GiLaurelCrown className="title-icon gold" /> Champions</h2>
                {settings.podium?.overallId && (
                  <p className="podium-overall">Overall first: <strong>{players.find((player) => player.id === settings.podium.overallId)?.name}</strong></p>
                )}
                <div className="winner-grid">
                  {(classifications || []).filter((item) => {
                    if (item.kind !== 'category') return false
                    return !(classifications || []).some((row) => row.parentId === item.id)
                  }).map((item) => {
                    const places = categoryPlaces(settings.podium, item.id)
                    if (!places.length) return null
                    return (
                      <div key={item.id} className="winner-slot glass">
                        <strong>{item.name}</strong>
                        {places.map((place) => (
                          <span key={place.place} className="place-line">
                            <span>{PLACE_LABELS[place.place]}</span>
                            <b>{players.find((player) => player.id === place.playerId)?.name || '—'}</b>
                          </span>
                        ))}
                      </div>
                    )
                  })}
                  {(settings.podium?.styles || []).map((item) => (
                    <div key={item.danceStyle} className="winner-slot glass">
                      <span className="muted small">Choreography</span>
                      <strong>{item.danceStyle}</strong>
                      <span className="place-line"><span>Winner</span><b>{players.find((player) => player.id === item.playerId)?.name || '—'}</b></span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="section-head">
              <h2 className="section-title"><FiAward className="title-icon" /> Leaderboard</h2>
              <div className="tabs">
                <button className={`tab ${tab === 'single' ? 'active' : ''}`} onClick={() => setTab('single')}>
                  <FiUser /> Single
                </button>
                <button className={`tab ${tab === 'group' ? 'active' : ''}`} onClick={() => setTab('group')}>
                  <FiUsers /> Group
                </button>
              </div>
            </div>

            <div className="leaderboard">
              {ranked.map((p, i) => (
                <div key={p.id} className={`lb-row glass ${i < 3 && p.stats.count ? 'top' : ''}`}>
                  <span className="lb-rank">{i < 3 && p.stats.count ? MEDALS[i] : i + 1}</span>
                  <img src={playerPhoto(p)} alt="" className="avatar lg" />
                  <div className="lb-name">
                    <strong>{p.name}</strong>
                    <span className="muted small">
                      {registeredId(p)} · {p.category}
                      {p.type === 'group' && p.members?.length ? ` · ${p.members.map(memberLabel).join(', ')}` : ''}
                    </span>
                  </div>
                  <div className="lb-score">
                    <strong>{p.stats.count ? p.stats.avg.toFixed(1) : '--'}</strong>
                    <span className="muted small">/ {p.stats.maxTotal || maxTotal}</span>
                  </div>
                  <StatusBadge status={p.stats.status} />
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <ContactSection />

      <SiteFooter />

      <FloatingContact />

      {selectedJudge && (
        <div
          className="judge-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={selectedJudge.name}
          onMouseDown={() => setSelectedJudge(null)}
        >
          <button type="button" className="judge-lightbox-close" onClick={() => setSelectedJudge(null)} aria-label="Close">
            <span className="modal-close-ring" aria-hidden="true" />
            <FiX />
          </button>
          <img
            src={selectedJudge.image}
            alt={`${selectedJudge.name}, judge for Dance of District Season 14`}
            onMouseDown={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
