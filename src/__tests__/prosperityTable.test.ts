import { describe, it, expect } from 'vitest'
import { getProsperityLevel, getShopPriceModifier, getLevelFromXp } from '@/utils/prosperityTable'

describe('getProsperityLevel', () => {
  it('returns 1 for 0 checkmarks', () => {
    expect(getProsperityLevel(0)).toBe(1)
  })

  it('returns 1 for 3 checkmarks (below threshold)', () => {
    expect(getProsperityLevel(3)).toBe(1)
  })

  it('returns 2 at exactly 4 checkmarks', () => {
    expect(getProsperityLevel(4)).toBe(2)
  })

  it('returns 3 at exactly 9 checkmarks', () => {
    expect(getProsperityLevel(9)).toBe(3)
  })

  it('returns 9 at 64 checkmarks (max)', () => {
    expect(getProsperityLevel(64)).toBe(9)
  })

  it('returns 9 for values above 64', () => {
    expect(getProsperityLevel(100)).toBe(9)
  })

  it('returns correct level at each threshold boundary', () => {
    const thresholds = [0, 4, 9, 15, 22, 30, 39, 50, 64]
    thresholds.forEach((threshold, i) => {
      expect(getProsperityLevel(threshold)).toBe(i + 1)
    })
  })
})

describe('getShopPriceModifier', () => {
  it('returns 0 for neutral reputation (0)', () => {
    expect(getShopPriceModifier(0)).toBe(0)
  })

  it('returns -5 for max positive reputation (20)', () => {
    expect(getShopPriceModifier(20)).toBe(-5)
  })

  it('returns 5 for max negative reputation (-20)', () => {
    expect(getShopPriceModifier(-20)).toBe(5)
  })

  it('returns -1 for reputation 3', () => {
    expect(getShopPriceModifier(3)).toBe(-1)
  })

  it('returns 1 for reputation -3', () => {
    expect(getShopPriceModifier(-3)).toBe(1)
  })

  it('returns 0 for reputation -2 (boundary)', () => {
    expect(getShopPriceModifier(-2)).toBe(0)
  })

  it('returns -5 for reputation 19 (boundary)', () => {
    expect(getShopPriceModifier(19)).toBe(-5)
  })
})

describe('getLevelFromXp', () => {
  it('returns 1 for 0 XP', () => {
    expect(getLevelFromXp(0)).toBe(1)
  })

  it('returns 1 for 44 XP (just below level 2)', () => {
    expect(getLevelFromXp(44)).toBe(1)
  })

  it('returns 2 at exactly 45 XP', () => {
    expect(getLevelFromXp(45)).toBe(2)
  })

  it('returns 3 at exactly 95 XP', () => {
    expect(getLevelFromXp(95)).toBe(3)
  })

  it('returns 9 at 500 XP (max level)', () => {
    expect(getLevelFromXp(500)).toBe(9)
  })

  it('returns 9 for XP above 500', () => {
    expect(getLevelFromXp(999)).toBe(9)
  })
})
