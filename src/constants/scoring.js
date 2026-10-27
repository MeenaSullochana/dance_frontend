import { DANCE_STYLES } from './danceStyles'

export const CRITERIA = [
  { key: 'technique', label: 'Technique' },
  { key: 'expression', label: 'Expression' },
  { key: 'timing', label: 'Timing & Rhythm' },
  { key: 'costume', label: 'Costume & Stage' },
]

export const MAX_PER_CRITERION = 10
export const MAX_TOTAL = CRITERIA.length * MAX_PER_CRITERION
export const PASS_PERCENT = 70

export function activeCriteria(markCriteria) {
  const saved = (markCriteria || []).filter((item) => item.active !== false)
  const source = saved.length
    ? saved
    : CRITERIA.map((item, index) => ({
        id: item.key,
        key: item.key,
        name: item.label,
        maxMarks: MAX_PER_CRITERION,
        sortOrder: index + 1,
        active: true,
      }))
  return [...source]
    .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
    .map((item) => ({
      ...item,
      label: item.name || item.label,
      maxMarks: Number(item.maxMarks || MAX_PER_CRITERION),
    }))
}

export function totalMax(criteria) {
  return criteria.reduce((sum, item) => sum + Number(item.maxMarks || 0), 0) || 1
}

export const CATEGORIES = DANCE_STYLES.map((s) => s.name)

export const LEGACY_CATEGORY_NAMES = {
  'Hip Hop': 'Hip-Hop Dance',
  Classical: 'Classical Dance',
  Freestyle: 'Freestyle Dance',
}

export const ROLES = [
  { value: 'admin', label: 'Admin', home: '/admin' },
  { value: 'judge', label: 'Judge', home: '/judge' },
  { value: 'user', label: 'Audience', home: '/user' },
]

export const REGISTER_ROLES = ['user']

export const homePath = (role) => ROLES.find((r) => r.value === role)?.home || '/'

export const initialUsers = [
  { id: 'u1', name: 'Priya Admin', email: 'admin@dance.com', password: 'admin123', role: 'admin', active: true },
  { id: 'j1', name: 'Rahul Mehra', email: 'judge1@dance.com', password: 'judge123', role: 'judge', active: true },
  { id: 'j2', name: 'Anita Desai', email: 'judge2@dance.com', password: 'judge123', role: 'judge', active: true },
  { id: 'j3', name: 'Vikram Rao', email: 'judge3@dance.com', password: 'judge123', role: 'judge', active: true },
  { id: 'm1', name: 'Neha Verma', email: 'user@dance.com', password: 'user123', role: 'user', active: true },
]

export const initialPlayers = [
  { id: 'p1', name: 'Aarav Sharma', type: 'single', category: 'Hip-Hop Dance', members: [], photo: null, chestNo: 101, winner: false },
  { id: 'p2', name: 'Diya Patel', type: 'single', category: 'Classical Dance', members: [], photo: null, chestNo: 102, winner: false },
  { id: 'p3', name: 'Kabir Singh', type: 'single', category: 'Freestyle Dance', members: [], photo: null, chestNo: 103, winner: false },
  { id: 'p4', name: 'Meera Nair', type: 'single', category: 'Western Dance', members: [], photo: null, chestNo: 104, winner: false },
  { id: 'p5', name: 'Rohan Gupta', type: 'single', category: 'Folk Dance', members: [], photo: null, chestNo: 105, winner: false },
  { id: 'p6', name: 'Sara Khan', type: 'single', category: 'Hip-Hop Dance', members: [], photo: null, chestNo: 106, winner: false },
  { id: 'g1', name: 'Street Kings', type: 'group', category: 'Hip-Hop Dance', members: ['Arjun', 'Neel', 'Dev', 'Ishaan'], photo: null, chestNo: 201, winner: false },
  { id: 'g2', name: 'Natya Sangam', type: 'group', category: 'Classical Dance', members: ['Lakshmi', 'Kavya', 'Pooja'], photo: null, chestNo: 202, winner: false },
  { id: 'g3', name: 'Bolly Beats', type: 'group', category: 'Folk Dance', members: ['Riya', 'Aman', 'Tara', 'Kunal', 'Zoya'], photo: null, chestNo: 203, winner: false },
  { id: 'g4', name: 'Flow Motion', type: 'group', category: 'Western Dance', members: ['Nisha', 'Yash', 'Ira'], photo: null, chestNo: 204, winner: false },
]

const s = (id, playerId, judgeId, technique, expression, timing, costume, comment) => ({
  id,
  playerId,
  judgeId,
  criteria: { technique, expression, timing, costume },
  total: technique + expression + timing + costume,
  comment,
  createdAt: '2026-10-12T10:00:00.000Z',
})

export const initialScores = [
  s('s1', 'p1', 'j1', 9, 8, 9, 8, 'Sharp moves, great energy!'),
  s('s2', 'p1', 'j2', 8, 9, 8, 9, 'Loved the expressions.'),
  s('s3', 'p1', 'j3', 9, 9, 8, 8, 'Excellent control.'),
  s('s4', 'p2', 'j1', 7, 8, 7, 9, 'Graceful performance.'),
  s('s5', 'p2', 'j2', 8, 8, 7, 8, ''),
  s('s6', 'p3', 'j1', 5, 6, 5, 6, 'Needs more practice on timing.'),
  s('s7', 'p3', 'j2', 6, 5, 5, 5, ''),
  s('s8', 'p3', 'j3', 5, 6, 6, 5, 'Good attempt.'),
  s('s9', 'g1', 'j1', 9, 9, 10, 9, 'Perfect sync!'),
  s('s10', 'g1', 'j2', 9, 8, 9, 9, ''),
  s('s11', 'g1', 'j3', 10, 9, 9, 8, 'Crowd favourite.'),
  s('s12', 'g3', 'j1', 7, 8, 8, 9, 'Colourful and fun.'),
]

export const initialSettings = { resultsPublished: false }
