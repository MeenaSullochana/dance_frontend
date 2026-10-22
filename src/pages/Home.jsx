import { useMemo, useState } from 'react'
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
  FiHeart,
  FiStar,
  FiGlobe,
  FiTrendingUp,
} from 'react-icons/fi'
import {
  GiMusicalNotes,
  GiTrophyCup,
  GiTheaterCurtains,
  GiLaurelCrown,
  GiBallerinaShoes,
  GiPartyPopper,
} from 'react-icons/gi'
import { TbInfinity } from 'react-icons/tb'
import { FaHandshake, FaQuoteLeft } from 'react-icons/fa'
import { useApp } from '../context/AppContext'
import { dancePhotos, dodImages, sliderImages, rotaryDistrictLogo, dodLogo, rcmnEmblem } from '../assets/images'
import bharatanatyamPhoto from '../assets/images/styles/bharatanatyam.jpg'
import folkPhoto from '../assets/images/styles/folk.jpg'
import StatusBadge from '../components/StatusBadge'
import HeroSlider from '../components/HeroSlider'
import ContactSection from '../components/ContactSection'
import FloatingContact from '../components/FloatingContact'
import SiteFooter from '../components/SiteFooter'
import { SOCIAL_LINKS } from '../constants/contact'
import { playerPhoto } from '../utils/playerPhoto'
import { categoryPlaces, PLACE_LABELS } from '../utils/podium'
import { memberLabel } from '../utils/member'
import { homePath } from '../constants/scoring'
import { DANCE_STYLES, STYLE_GROUPS } from '../constants/danceStyles'

const MEDALS = ['🥇', '🥈', '🥉']

const SLIDES = sliderImages

const STYLES_PREVIEW = 10

const STEPS = [
  { icon: FiUserPlus, title: 'Register', text: 'Users sign up and the admin approves them. Judges are added by the admin.' },
  { icon: GiTheaterCurtains, title: 'Perform', text: 'Solo dancers and groups take the stage in their category.' },
  { icon: FiEdit3, title: 'Get Scored', text: 'Judges mark technique, expression, timing and costume.' },
  { icon: GiTrophyCup, title: 'Win', text: 'Top scorers qualify and champions are crowned live.' },
]

const EVENT = {
  date: '31st October 2026',
  time: '9:00 AM to 5:00 PM',
  venue: 'Ethiraj College Auditorium',
  signature: 'Signature Event of Rotary Club of Madras North · Season 14',
  organiser: 'Rotary District 3233 Events Committee',
}

const REGISTER_FORM_URL = 'https://forms.gle/DfZcNMxHF6HdS6HV6'

const REGISTER_PERKS = [
  { icon: FiUser, title: 'Solo', text: 'Showcase your own style' },
  { icon: FiUsers, title: 'Group', text: 'Perform with your team' },
  { icon: TbInfinity, title: 'Unlimited', text: 'Entries in every category' },
]

const CLUB_LEADERS = [
  { name: 'Rtn. Nagarajan S', title: 'President', image: dodImages.president, icon: GiLaurelCrown },
  { name: 'Rtn. Divya Subramanian', title: 'Secretary', image: dodImages.secretary, icon: FiEdit3 },
]

const GATHERING = [
  {
    icon: FiUsers,
    title: 'Family of Rotary',
    text: 'This event is exclusively curated for Rotarians and their families. It is a dedicated space to bond, relax, and celebrate our shared values outside of service projects.',
  },
  {
    icon: FaHandshake,
    title: 'Inter-District Spirit',
    text: 'We are honored to invite neighboring districts to join District 3233. This multi-district participation fosters stronger regional ties and cross-district fellowship.',
  },
]

const PILLARS = [
  { icon: FiHeart, title: 'Bonding', text: 'Strengthening the internal fabric of our clubs through shared art.' },
  { icon: FiStar, title: 'Talent', text: 'Discovering the hidden artistic gems within our Rotary families.' },
  { icon: FiGlobe, title: 'Unity', text: 'Building a unified regional Rotary presence across districts.' },
]

const TRADITIONS = [
  { title: 'Folk Heritage Round', src: folkPhoto },
  { title: 'Fusion Finale', src: dodImages.fusionFinale },
]

const GROWTH = [
  { x: 0, y: 262, label: 'Previous Years' },
  { x: 198, y: 225 },
  { x: 399, y: 248 },
  { x: 601, y: 150, label: 'District 3233 Launch' },
  { x: 1000, y: 76, label: '2025 Inter-District' },
]
const GROWTH_LINE = GROWTH.map((p) => `${p.x},${p.y}`).join(' ')

const GALLERY = [
  { src: dodImages.danceOfDistrict, alt: 'Dance of District' },
  { src: dodImages.dodRibbons, alt: 'Dance of District – Organized by Rotary Club of Madras North' },
  { src: dodImages.dodDancers, alt: 'Dance of District – DOD, RCM North, 31st Oct' },
  { src: dodImages.danceFit, alt: 'Dance Fit' },
  { src: dodImages.danceCouple, alt: 'Dance' },
]

export default function Home() {
  const { players, playerStats, settings, currentUser, judges, maxTotal, classifications } = useApp()
  const [tab, setTab] = useState('single')
  const [styleGroup, setStyleGroup] = useState('All')
  const [showAllStyles, setShowAllStyles] = useState(false)

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

  const stats = [
    { icon: FiUser, value: players.filter((p) => p.type === 'single').length, label: 'Solo' },
    { icon: FiUsers, value: players.filter((p) => p.type === 'group').length, label: 'Groups' },
    { icon: FiUserCheck, value: judges.length, label: 'Judges' },
    { icon: GiBallerinaShoes, value: DANCE_STYLES.length, label: 'Styles' },
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
          <Link to={currentUser ? homePath(currentUser.role) : '/login'} className="btn btn-primary">
            <FiLogIn /> <span className="nav-login-text">{currentUser ? 'Dashboard' : 'Login'}</span>
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
            <a href="#results" className="btn btn-primary">
              <FiAward /> View Results
            </a>
            <a href={REGISTER_FORM_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">
              <FiUserPlus /> Register Now
            </a>
          </div>
          <div className="hero-stats">
            {stats.map(({ icon: Icon, value, label }) => (
              <div key={label}>
                <Icon className="hero-stat-icon" />
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
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

      <section className="public-section wide">
        <div className="chairman glass">
          <img src={dodImages.chairman} alt="Rtn. Shabeer Nazeer" />
          <div className="chairman-info">
            <span className="chip"><GiLaurelCrown /> Chairman</span>
            <h2 className="section-title">Rtn. Shabeer Nazeer</h2>
            <p className="chairman-role">Chairman - Dance of District</p>
            <p className="muted">Rotary Year 2026-27</p>
            <p className="muted small">Dance of District · Season 14 · Signature Event of Rotary Club of Madras North · Hosted at Ethiraj College Auditorium</p>
          </div>
        </div>
      </section>

      <section className="public-section wide">
        <div className="section-intro">
          <span className="chip"><FiUsers /> Club Leadership</span>
          <h2 className="section-title">Rotary Club of Madras North</h2>
          <p className="muted">Leading the club through Rotary Year 2026-27</p>
        </div>
        <div className="leaders">
          {CLUB_LEADERS.map(({ name, title, image, icon: Icon }) => (
            <article key={name} className="leader-card glass">
              <div className="leader-photo">
                <img src={image} alt={name} loading="lazy" />
                <span className="leader-badge"><Icon /> {title}</span>
              </div>
              <div className="leader-info">
                <h3>{name}</h3>
                <p className="leader-role">Club {title}</p>
                <span className="leader-rule" />
                <p className="muted small">Rotary Year 2026-27</p>
                <p className="muted small">Rotary Club of Madras North</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="public-section">
        <div className="fellowship glass">
          <h2 className="section-title gold-text">Fellowship Beyond Boundaries</h2>
          <span className="gold-rule" />
          <p className="muted">Celebrating the 'Family of Rotary' through the vibrant language of dance.</p>
        </div>
      </section>

      <section className="public-section wide">
        <div className="section-intro">
          <span className="chip"><FiUsers /> Who it's for</span>
          <h2 className="section-title">An Exclusive Gathering</h2>
        </div>
        <div className="info-grid two">
          {GATHERING.map(({ icon: Icon, title, text }) => (
            <div key={title} className="step glass">
              <div className="step-icon"><Icon /></div>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

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
          <img src={dodImages.museumTheatre} alt="Ethiraj College Auditorium" className="feature-img" />
        </div>
      </section>

      <section className="public-section wide">
        <div className="section-intro">
          <span className="chip"><GiBallerinaShoes /> Classical Roots</span>
          <h2 className="section-title">Classical Roots</h2>
        </div>
        <div className="feature-row reverse">
          <div className="feature-text">
            <h3>Bharatanatyam Showcase</h3>
            <p className="muted">
              Experience the divine grace of classical dance. Our program features masterfully choreographed segments that
              tell stories of leadership, compassion, and heritage.
            </p>
            <p className="muted">
              Performers from various clubs will showcase the rigorous training and artistic depth that mirrors the
              discipline of Rotary service.
            </p>
          </div>
          <img src={bharatanatyamPhoto} alt="Bharatanatyam stage performance" className="feature-img portrait" />
        </div>
      </section>

      <section className="public-section wide">
        <div className="section-intro">
          <span className="chip"><FiStar /> What we stand for</span>
          <h2 className="section-title">Core Event Pillars</h2>
        </div>
        <div className="info-grid three">
          {PILLARS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="step glass pillar">
              <div className="step-icon"><Icon /></div>
              <h3>{title}</h3>
              <p className="muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section wide">
        <div className="section-intro">
          <span className="chip"><FiTrendingUp /> Expected Impact</span>
          <h2 className="section-title">Expected Impact</h2>
        </div>
        <div className="impact glass">
          <div className="impact-stat">
            <strong>1200+</strong>
            <span>Rotarians &amp; Families</span>
          </div>
          <div className="feature-text">
            <h3>A Growing Legacy</h3>
            <p className="muted">
              With invitations extended to multiple districts, we anticipate a record-breaking turnout. This serves as a
              testament to the vibrant energy of our newly chartered District 3233 and its collaborative spirit.
            </p>
            <p className="muted">Every ticket represents a family united by the ideal of service and the joy of fellowship.</p>
          </div>
        </div>
      </section>

      <section className="public-section wide">
        <div className="section-intro">
          <span className="chip"><GiTheaterCurtains /> Programme</span>
          <h2 className="section-title">Vibrant Traditions</h2>
        </div>
        <div className="info-grid two">
          {TRADITIONS.map(({ title, src }) => (
            <div key={title} className="tradition-card glass">
              <img src={src} alt={title} loading="lazy" />
              <span>{title}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section wide">
        <div className="section-intro">
          <span className="chip"><FiTrendingUp /> Growth</span>
          <h2 className="section-title">Engagement Growth</h2>
        </div>
        <div className="growth glass">
          <div className="growth-plot">
            <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden="true">
              <polygon points={`0,300 ${GROWTH_LINE} 1000,300`} className="growth-area" />
              <polyline points={GROWTH_LINE} className="growth-line" />
            </svg>
            {GROWTH.map((p) => (
              <span key={p.x} className="growth-dot" style={{ left: `${p.x / 10}%`, top: `${p.y / 3}%` }} />
            ))}
          </div>
          <div className="growth-labels muted small">
            {GROWTH.filter((p) => p.label).map((p) => (
              <span key={p.label}>{p.label}</span>
            ))}
          </div>
        </div>
        <p className="muted center-text">Expanding the horizons of Rotary Fellowship across Southern India.</p>
      </section>

      <section className="public-section">
        <blockquote className="dod-quote glass">
          <img src={dodImages.compass} alt="" className="quote-compass" />
          <FaQuoteLeft className="quote-icon" />
          <p>
            "Fellowship is the foundation upon which Rotary service is built. When families dance together, districts
            unite."
          </p>
          <cite>— The Spirit of Rotary Fellowship</cite>
        </blockquote>
      </section>

      <section className="public-section" id="join">
        <div className="join glass">
          <h2 className="section-title gold-text">Join the Rhythm</h2>
          <p className="muted">RSVP and registrations open for all Rotary Districts</p>
          <div className="join-box">
            <strong>{EVENT.organiser}</strong>
            <span><FiMapPin /> Venue: {EVENT.venue}</span>
            <span><FiCalendar /> Date: {EVENT.date} | <FiClock /> Time: {EVENT.time}</span>
          </div>
          <a href={REGISTER_FORM_URL} target="_blank" rel="noreferrer" className="btn btn-primary">
            <FiUserPlus /> Register Now
          </a>
        </div>
      </section>

      <section className="public-section wide" id="gallery">
        <div className="section-intro">
          <span className="chip"><GiPartyPopper /> Gallery</span>
          <h2 className="section-title">Dance of District</h2>
        </div>
        <div className="dod-gallery">
          {GALLERY.map(({ src, alt }) => (
            <img key={alt} src={src} alt={alt} loading="lazy" />
          ))}
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

      <section className="public-section" id="how">
        <div className="section-intro">
          <span className="chip"><GiTheaterCurtains /> How it works</span>
          <h2 className="section-title">From Audition To Champion</h2>
        </div>
        <div className="steps">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="step glass">
              <span className="step-no">0{i + 1}</span>
              <div className="step-icon"><Icon /></div>
              <h3>{title}</h3>
              <p className="muted small">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="public-section" id="results">
        {!settings.resultsPublished ? (
          <div className="coming-soon glass">
            <img src={dancePhotos.balletSolo} alt="" className="coming-soon-bg" />
            <GiMusicalNotes size={48} />
            <h2>Results coming soon</h2>
            <p className="muted">Our judges are scoring the performances. Check back after the results are published.</p>
            {!currentUser && (
              <Link to="/login" className="btn btn-ghost">
                <FiLogIn /> Login to follow along <FiArrowRight />
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
                  {(classifications || []).filter((item) => item.kind === 'category').map((item) => {
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
                      #{p.chestNo} · {p.category}
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
    </div>
  )
}
