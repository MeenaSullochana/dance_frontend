export const PLACE_LABELS = {
  1: 'Winner',
  2: '1st Runner-up',
  3: '2nd Runner-up',
  4: '3rd Runner-up',
}

export function categoryPlaces(podium, classificationId) {
  return podium?.categories?.find((item) => item.classificationId === classificationId)?.places || []
}
