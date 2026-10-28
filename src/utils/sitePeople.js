import { dodImages, judgeAvatar } from '../assets/images'

export function sitePhoto(item, fallback = judgeAvatar) {
  return item?.photo || dodImages[item?.imageKey] || fallback
}

export function bySortOrder(list) {
  return [...(list || [])].sort(
    (a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || String(a.name || '').localeCompare(String(b.name || '')),
  )
}

export function visibleSitePeople(list) {
  return bySortOrder(list).filter((item) => item.active !== false)
}
