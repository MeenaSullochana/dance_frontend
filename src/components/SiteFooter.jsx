import { Link, NavLink } from 'react-router-dom'
import { FiCalendar, FiMail, FiMapPin, FiPhone, FiFileText, FiShield } from 'react-icons/fi'
import { rotaryDistrictLogo, dodLogo, rcmnEmblem } from '../assets/images'
import { CONTACT, SOCIAL_LINKS, mailLink, telLink } from '../constants/contact'
import { TERMS, PRIVACY } from '../constants/legal'

const QUICK_LINKS = [
  { label: 'Register', href: '/#register' },
  { label: 'Venue', href: '/#venue' },
  { label: 'Dance Styles', href: '/#styles' },
  { label: 'Results', href: '/#results' },
  { label: 'Contact', href: '/#contact' },
]

const LEGAL = [
  { ...TERMS, icon: FiFileText },
  { ...PRIVACY, icon: FiShield },
]

export default function SiteFooter() {
  return (
    <footer className="public-footer">
      <div className="footer-top">
        <Link to="/" className="footer-brand">
          <img src={rotaryDistrictLogo} alt="Rotary District 3233" className="logo-district" />
          <img src={dodLogo} alt="DOD – RCM North, 31st Oct" className="logo-dod" />
          <img src={rcmnEmblem} alt="Rotary Club of Madras North" className="logo-emblem" />
        </Link>
        <div className="footer-social">
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}>
              <Icon />
            </a>
          ))}
        </div>
      </div>

      <div className="footer-cols">
        <div className="footer-col">
          <h4>Dance of District · Season 14</h4>
          <p className="muted small">
            Signature Event of Rotary Club of Madras North. A fellowship dance competition for Rotarians and their
            families under Rotary District 3233.
          </p>
          <p className="footer-meta muted small">
            <FiCalendar /> 31st October 2026 · 9:00 AM to 5:00 PM
          </p>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul className="footer-list">
            {QUICK_LINKS.map(({ label, href }) => (
              <li key={label}>
                <a href={href}>{label}</a>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Legal</h4>
          <ul className="footer-list footer-legal-list">
            {LEGAL.map(({ title, path, icon: Icon }) => (
              <li key={path}>
                <NavLink to={path}>
                  <Icon /> {title}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact</h4>
          <ul className="footer-list footer-contact">
            <li>
              <FiMapPin /> <span>{CONTACT.address}</span>
            </li>
            <li>
              <FiMail /> <a href={mailLink}>{CONTACT.email}</a>
            </li>
            <li>
              <FiPhone /> <a href={telLink}>{CONTACT.phone}</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom muted small">
        <span>© {new Date().getFullYear()} Dance of District · Rotary Club of Madras North</span>
        <nav className="footer-legal">
          <NavLink to={TERMS.path}>{TERMS.title}</NavLink>
          <NavLink to={PRIVACY.path}>{PRIVACY.title}</NavLink>
        </nav>
        <span>Rotary District 3233 Events Committee</span>
      </div>
    </footer>
  )
}
