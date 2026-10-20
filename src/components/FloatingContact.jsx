import { useEffect, useRef, useState } from 'react'
import { FiMail, FiPhone, FiX } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { CONTACT, mailLink, telLink, whatsappLink } from '../constants/contact'

const ACTIONS = [
  { key: 'whatsapp', label: 'WhatsApp', value: CONTACT.whatsapp, href: whatsappLink, icon: FaWhatsapp, external: true },
  { key: 'call', label: 'Call Us', value: CONTACT.phone, href: telLink, icon: FiPhone },
  { key: 'email', label: 'Email Us', value: CONTACT.email, href: mailLink, icon: FiMail },
]

function DancerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="13.5" cy="3.5" r="2" fill="currentColor" stroke="none" />
      <path d="M5 5.5l7.5 3 6-4.5" />
      <path d="M12.5 8.5L11 14" />
      <path d="M11 14l-4.5 6.5" />
      <path d="M11 14l4.5 2.5 2 4.5" />
    </svg>
  )
}

export default function FloatingContact() {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('pointerdown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div ref={ref} className={`fab-contact${open ? ' open' : ''}`}>
      <ul className="fab-actions" aria-hidden={!open}>
        {ACTIONS.map(({ key, label, value, href, icon: Icon, external }, i) => (
          <li key={key} style={{ '--i': ACTIONS.length - i }}>
            <a
              href={href}
              className={`fab-action fab-${key}`}
              target={external ? '_blank' : undefined}
              rel="noreferrer"
              tabIndex={open ? 0 : -1}
              aria-label={`${label}: ${value}`}
              onClick={() => setOpen(false)}
            >
              <span className="fab-label">
                <strong>{label}</strong>
                <small>{value}</small>
              </span>
              <span className="fab-icon"><Icon /></span>
            </a>
          </li>
        ))}
      </ul>

      <button
        type="button"
        className="fab-toggle"
        aria-expanded={open}
        aria-label={open ? 'Close contact options' : 'Contact us'}
        onClick={() => setOpen((o) => !o)}
      >
        <span className="fab-toggle-icon fab-dancer"><DancerIcon /></span>
        <span className="fab-toggle-icon fab-close"><FiX /></span>
      </button>
    </div>
  )
}
