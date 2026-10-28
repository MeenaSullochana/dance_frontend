export function canGoLive(player) {
  return Boolean(player?.arrived) && player?.pendriveStatus === 'received'
}

export function registeredId(player) {
  return player?.registeredId || (player?.chestNo != null ? `#${player.chestNo}` : '—')
}

export function goLiveBlockedReason(player) {
  if (!player?.arrived) return 'Mark Arrived before going live'
  if (player.pendriveStatus !== 'received') return 'Audio track must be received before going live'
  return ''
}

export function isPerforming(settings, player) {
  return Boolean(player?.id) && settings?.livePlayerId === player.id
}

export function isVotingOpen(settings, player) {
  return isPerforming(settings, player) && Boolean(settings?.votingOpen)
}
