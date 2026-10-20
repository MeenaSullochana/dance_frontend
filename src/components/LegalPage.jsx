import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import SiteFooter from './SiteFooter'
import { FiArrowLeft, FiMail, FiPhone } from 'react-icons/fi'
import { rotaryDistrictLogo, dodLogo, rcmnEmblem } from '../assets/images'
import { CONTACT, mailLink, telLink } from '../constants/contact'
import { LEGAL_UPDATED } from '../constants/legal'

export default function LegalPage({ content }) {
  const { title, intro, sections } = content

  useEffect(() => {
    window.scrollTo(0, 0)
    document.title = `${title} · Dance of District`
  }, [title])

  return (
    <div className="public legal">
      <header className="public-nav legal-nav">
        <Link to="/" className="btn btn-ghost legal-back">
          <FiArrowLeft /> <span>Home</span>
        </Link>
        <Link to="/" className="brand-logos">
          <img src={rotaryDistrictLogo} alt="Rotary District 3233" className="logo-district" />
          <img src={dodLogo} alt="DOD – RCM North, 31st Oct" className="logo-dod" />
          <img src={rcmnEmblem} alt="Rotary Club of Madras North" className="logo-emblem" />
        </Link>
        <span />
      </header>

      <main className="legal-main">
        <div className="legal-head">
          <span className="chip">Dance of District · RCM North</span>
          <h1 className="gradient-text">{title}</h1>
          <p className="muted small">Last updated: {LEGAL_UPDATED}</p>
          <p className="muted">{intro}</p>
        </div>

        <div className="legal-body glass">
          {sections.map((section, i) => (
            <section key={section.heading} className="legal-section">
              <h2>
                <span className="legal-num">{i + 1}.</span> {section.heading}
              </h2>
              <ul>
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </section>
          ))}

          <section className="legal-section legal-contact">
            <h2>Contact Us</h2>
            <p className="muted">
              Questions about this page? Reach the Rotary Club of Madras North organising team:
            </p>
            <div className="legal-contact-links">
              <a href={mailLink}><FiMail /> {CONTACT.email}</a>
              <a href={telLink}><FiPhone /> {CONTACT.phone}</a>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
