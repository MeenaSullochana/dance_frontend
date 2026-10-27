export function ageFloor(band) {
  return band?.minAge == null || band?.minAge === '' ? Number.NEGATIVE_INFINITY : Number(band.minAge)
}

export function ageCeil(band) {
  return band?.maxAge == null || band?.maxAge === '' ? Number.POSITIVE_INFINITY : Number(band.maxAge)
}

export function bandCoversAge(band, age) {
  const ageNum = Number(age)
  if (!Number.isFinite(ageNum)) return false
  return ageNum >= ageFloor(band) && ageNum <= ageCeil(band)
}

export function bandSpan(band) {
  const min = band?.minAge == null || band?.minAge === '' ? 0 : Number(band.minAge)
  const max = band?.maxAge == null || band?.maxAge === '' ? 120 : Number(band.maxAge)
  return Math.max(0, max - min)
}

export function formatAgeRange(band) {
  const hasMin = band?.minAge != null && band?.minAge !== ''
  const hasMax = band?.maxAge != null && band?.maxAge !== ''
  if (hasMin && hasMax) return `${band.minAge}-${band.maxAge}`
  if (hasMin) return `${band.minAge}+`
  if (hasMax) return `Under ${band.maxAge}`
  return '—'
}

export function openAgeValue(value) {
  return value == null || value === '' ? '' : value
}

export function agePayload(minAge, maxAge) {
  return {
    minAge: minAge === '' || minAge == null ? null : Number(minAge),
    maxAge: maxAge === '' || maxAge == null ? null : Number(maxAge),
  }
}
