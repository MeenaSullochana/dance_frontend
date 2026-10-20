export function memberLabel(member) {
  if (!member) return ''
  if (typeof member === 'string') return member
  const name = member.name || ''
  return member.age ? `${name} · ${member.age}` : name
}

export function asPeople(members) {
  return (members || []).map((member) =>
    typeof member === 'string' ? { name: member, age: '' } : { name: member?.name || '', age: member?.age ?? '' },
  )
}
