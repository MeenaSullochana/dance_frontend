import { defaultPlayer, groupDefault } from '../assets/images'

export const playerPhoto = (player) => player.photo || (player.type === 'group' ? groupDefault : defaultPlayer)
