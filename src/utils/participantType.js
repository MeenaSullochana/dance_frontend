export const PARTICIPANT_TYPES = ['single', 'couple', 'group']

export function readParticipantType(value, fallback = 'single') {
  return PARTICIPANT_TYPES.includes(value) ? value : fallback
}

export function participantsPath(role, type = 'single') {
  const kind = readParticipantType(type)
  if (role === 'admin') return `/admin/players?type=${kind}`
  if (role === 'judge') return `/judge?type=${kind}`
  if (role === 'user') return `/user?type=${kind}`
  return null
}
