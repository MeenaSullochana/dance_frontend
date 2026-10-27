import { FiMail, FiPhone, FiMessageSquare } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { CONTACT, mailLink, telLink, whatsappLink } from '../constants/contact'

const INFO = [
  { icon: FiMail, title: 'Email', value: CONTACT.email, href: mailLink },
  { icon: FiPhone, title: 'Call', value: CONTACT.phone, href: telLink },
  { icon: FaWhatsapp, title: 'WhatsApp', value: CONTACT.whatsapp, href: whatsappLink },
]

export default function ContactSection() {
  return (
    <section className="public-section wide" id="contact">
      <div className="section-intro">
        <span className="chip"><FiMessageSquare /> Contact Us</span>
        <h2 className="section-title">Get In Touch</h2>
        <p className="muted">Reach us by email, phone, or WhatsApp.</p>
      </div>

      <div className="contact-info contact-info-three">
        {INFO.map(({ icon: Icon, title, value, href }) => (
          <a
            key={title}
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel="noreferrer"
            className="contact-card glass"
          >
            <div className="step-icon"><Icon /></div>
            <div>
              <strong>{title}</strong>
              <span className="muted small">{value}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  )
}
