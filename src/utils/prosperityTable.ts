const PROSPERITY_THRESHOLDS = [0, 4, 9, 15, 22, 30, 39, 50, 64]

export function getProsperityLevel(checkmarks: number): number {
  for (let i = PROSPERITY_THRESHOLDS.length - 1; i >= 0; i--) {
    if (checkmarks >= PROSPERITY_THRESHOLDS[i]!) {
      return i + 1
    }
  }
  return 1
}

export function getShopPriceModifier(reputation: number): number {
  if (reputation >= 19) return -5
  if (reputation >= 15) return -4
  if (reputation >= 11) return -3
  if (reputation >= 7) return -2
  if (reputation >= 3) return -1
  if (reputation >= -2) return 0
  if (reputation >= -6) return 1
  if (reputation >= -10) return 2
  if (reputation >= -14) return 3
  if (reputation >= -18) return 4
  return 5
}

export const XP_THRESHOLDS = [0, 45, 95, 150, 210, 275, 345, 420, 500]

export function getLevelFromXp(xp: number): number {
  for (let i = XP_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= XP_THRESHOLDS[i]!) {
      return i + 1
    }
  }
  return 1
}
