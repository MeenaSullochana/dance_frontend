import { FiInstagram, FiYoutube, FiFacebook, FiTwitter } from 'react-icons/fi'
import { FaWhatsapp } from 'react-icons/fa'

export const CONTACT = {
  address: 'Ethiraj College Auditorium',
  email: 'rotaryclubofmadrasnorth@gmail.com',
  phone: '+91 99406 87628',
  whatsapp: '+91 98409 96284',
  hours: 'Mon – Sat · 9:00 AM – 5:00 PM',
  mapQuery: 'Ethiraj College for Women Auditorium, Egmore, Chennai',
}

export const telLink = `tel:${CONTACT.phone.replace(/\s/g, '')}`
export const mailLink = `mailto:${CONTACT.email}`
export const whatsappLink = `https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`

export const SOCIAL_LINKS = [
  { label: 'Instagram', href: 'https://www.instagram.com/', icon: FiInstagram },
  { label: 'Facebook', href: 'https://www.facebook.com/', icon: FiFacebook },
  { label: 'YouTube', href: 'https://www.youtube.com/', icon: FiYoutube },
  { label: 'X (Twitter)', href: 'https://x.com/', icon: FiTwitter },
  { label: 'WhatsApp', href: whatsappLink, icon: FaWhatsapp },
]
