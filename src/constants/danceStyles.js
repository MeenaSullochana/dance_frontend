import traditional from '../assets/images/styles/traditional.jpg'
import hiphop from '../assets/images/styles/hiphop.jpg'
import classical from '../assets/images/styles/classical.jpg'
import folk from '../assets/images/styles/folk.jpg'
import popping from '../assets/images/styles/popping.jpg'
import bharatanatyam from '../assets/images/styles/bharatanatyam.jpg'
import kathak from '../assets/images/styles/kathak.jpg'
import kuchipudi from '../assets/images/styles/kuchipudi.jpg'
import odissi from '../assets/images/styles/odissi.jpg'
import kathakali from '../assets/images/styles/kathakali.jpg'
import mohiniyattam from '../assets/images/styles/mohiniyattam.jpg'
import karagattam from '../assets/images/styles/karagattam.jpg'
import kummi from '../assets/images/styles/kummi.jpg'
import kolattam from '../assets/images/styles/kolattam.jpg'
import gaana from '../assets/images/styles/gaana.jpg'
import western from '../assets/images/styles/western.png'
import freestyle from '../assets/images/styles/freestyle.jpg'
import breakdance from '../assets/images/dance/breakdance-stage.jpg'
import street from '../assets/images/dance/hiphop-street.jpg'
import kpop from '../assets/images/dance/group-stage.jpg'

export const STYLE_GROUPS = ['Indian Classical', 'Folk & Traditional', 'Western & Street']

export const DANCE_STYLES = [
  { name: 'Traditional Dance', group: 'Folk & Traditional', photo: traditional, color: '#ff8a00' },
  { name: 'Hip-Hop Dance', group: 'Western & Street', photo: hiphop, color: '#ff2e88' },
  { name: 'Classical Dance', group: 'Indian Classical', photo: classical, color: '#ffd54a' },
  { name: 'Folk Dance', group: 'Folk & Traditional', photo: folk, color: '#22d39b' },
  { name: 'Western Dance', group: 'Western & Street', photo: western, color: '#3ea6ff' },
  { name: 'Freestyle Dance', group: 'Western & Street', photo: freestyle, color: '#22d39b' },
  { name: 'Breakdance', group: 'Western & Street', photo: breakdance, color: '#ff5470' },
  { name: 'Locking and Popping', group: 'Western & Street', photo: popping, color: '#3ea6ff' },
  { name: 'Street Dance', group: 'Western & Street', photo: street, color: '#ff8a00' },
  { name: 'K-Pop Dance', group: 'Western & Street', photo: kpop, color: '#ff9fd0' },
  { name: 'Bharatanatyam', group: 'Indian Classical', photo: bharatanatyam, color: '#ff8a00' },
  { name: 'Kathak', group: 'Indian Classical', photo: kathak, color: '#22d39b' },
  { name: 'Kuchipudi', group: 'Indian Classical', photo: kuchipudi, color: '#ffd54a' },
  { name: 'Odissi', group: 'Indian Classical', photo: odissi, color: '#3ea6ff' },
  { name: 'Kathakali', group: 'Indian Classical', photo: kathakali, color: '#ff5470' },
  { name: 'Mohiniyattam', group: 'Indian Classical', photo: mohiniyattam, color: '#ffd54a' },
  { name: 'Karagattam', group: 'Folk & Traditional', photo: karagattam, color: '#ff8a00' },
  { name: 'Kummi', group: 'Folk & Traditional', photo: kummi, color: '#ff2e88' },
  { name: 'Kolattam', group: 'Folk & Traditional', photo: kolattam, color: '#22d39b' },
  { name: 'Gaana Dance', group: 'Folk & Traditional', photo: gaana, color: '#c59bff' },
]

export const PHOTO_CREDITS = [
  'Traditional: WarmaFiesta (CC BY-SA 4.0)',
  'Hip-Hop: Muhammed amine benloulou (CC BY-SA 4.0)',
  'Classical: Augustus Binu (CC BY-SA 3.0)',
  'Folk: Samkitcse (CC BY-SA 4.0)',
  'Locking and Popping: Stefan Bootin (CC BY-SA 2.5)',
  'Bharatanatyam, Kuchipudi, Odissi: Augustus Binu (CC BY-SA 3.0)',
  'Images from Wikimedia Commons, resized',
  'Kathak: Rhythm India (CC0)',
  'Kathakali: Prathyush Thomas (GFDL 1.2)',
  'Mohiniyattam: Shagil Kannur (CC BY-SA 4.0)',
  'Karagattam: Song & Drama Division, Govt. of India (GODL-India)',
  'Kummi: The open draft (CC BY-SA 4.0)',
  'Kolattam: Ramasaha16 (CC BY-SA 4.0)',
  'Gaana: Rajneesh.arts (CC BY-SA 4.0)',
  'Breakdance, Street, K-Pop: Unsplash (Unsplash License)',
]
