import { useState } from 'react'
import { FiMail, FiMapPin, FiPhone, FiClock, FiSend, FiMessageSquare } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'
import { useApp } from '../context/AppContext'
import { DANCE_STYLES } from '../constants/danceStyles'
import { CONTACT, mailLink, telLink, whatsappLink } from '../constants/contact'

const INFO = [
  { icon: FiMapPin, title: 'Address', value: CONTACT.address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT.mapQuery)}` },
  { icon: FiMail, title: 'Email', value: CONTACT.email, href: mailLink },
  { icon: FiPhone, title: 'Call', value: CONTACT.phone, href: telLink },
  { icon: FaWhatsapp, title: 'WhatsApp', value: CONTACT.whatsapp, href: whatsappLink },
  { icon: FiClock, title: 'Office Hours', value: CONTACT.hours },
]

const ENQUIRY_TYPES = ['Registration', 'Event Details', 'Sponsorship', 'Judging', 'Other']

const EMPTY = { name: '', email: '', phone: '', type: ENQUIRY_TYPES[0], style: '', message: '' }

export default function ContactSection() {
  const { showToast } = useApp()
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = () => {
    const next = {}
    if (!form.name.trim()) next.name = 'Please enter your name'
    if (!/^\S+@\S+\.\S+$/.test(form.email)) next.email = 'Please enter a valid email'
    if (form.phone && !/^[+\d\s-]{7,15}$/.test(form.phone)) next.phone = 'Please enter a valid phone number'
    if (form.message.trim().length < 10) next.message = 'Message should be at least 10 characters'
    return next
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (Object.keys(next).length) return

    const saved = JSON.parse(localStorage.getItem('enquiries') || '[]')
    localStorage.setItem('enquiries', JSON.stringify([...saved, { ...form, id: Date.now(), date: new Date().toISOString() }]))
    showToast('Thanks! Your enquiry has been sent. We will contact you soon.')
    setForm(EMPTY)
  }

  return (
    <section className="public-section wide" id="contact">
      <div className="section-intro">
        <span className="chip"><FiMessageSquare /> Contact Us</span>
        <h2 className="section-title">Get In Touch</h2>
        <p className="muted">Have a question about registration, events or sponsorship? Send us an enquiry and our team will reply within 24 hours.</p>
      </div>

      <div className="contact-info">
        {INFO.map(({ icon: Icon, title, value, href }) => {
          const content = (
            <>
              <div className="step-icon"><Icon /></div>
              <div>
                <strong>{title}</strong>
                <span className="muted small">{value}</span>
              </div>
            </>
          )
          return href ? (
            <a key={title} href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="contact-card glass">
              {content}
            </a>
          ) : (
            <div key={title} className="contact-card glass">{content}</div>
          )
        })}
      </div>

      <div className="contact-grid">
        <form className="form contact-form glass" onSubmit={handleSubmit} noValidate>
          <h3>Enquiry Form</h3>
          <div className="contact-row">
            <label>
              Full Name *
              <input value={form.name} onChange={update('name')} placeholder="Your name" />
              {errors.name && <span className="error">{errors.name}</span>}
            </label>
            <label>
              Email *
              <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" />
              {errors.email && <span className="error">{errors.email}</span>}
            </label>
          </div>
          <div className="contact-row">
            <label>
              Phone
              <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+91 98765 43210" />
              {errors.phone && <span className="error">{errors.phone}</span>}
            </label>
            <label>
              Enquiry Type
              <select value={form.type} onChange={update('type')}>
                {ENQUIRY_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </label>
          </div>
          <label>
            Interested Dance Style
            <select value={form.style} onChange={update('style')}>
              <option value="">Select a style (optional)</option>
              {DANCE_STYLES.map((s) => <option key={s.name}>{s.name}</option>)}
            </select>
          </label>
          <label>
            Message *
            <textarea rows={5} value={form.message} onChange={update('message')} placeholder="Write your enquiry..." />
            {errors.message && <span className="error">{errors.message}</span>}
          </label>
          <button type="submit" className="btn btn-primary">
            <FiSend /> Send Enquiry
          </button>
        </form>

        <div className="contact-map glass">
          <iframe
            title="Dance Fest location"
            src={`https://www.google.com/maps?q=${encodeURIComponent(CONTACT.mapQuery)}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>
      </div>
    </section>
  )
}
