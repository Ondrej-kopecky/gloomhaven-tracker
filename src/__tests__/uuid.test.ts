import { describe, it, expect } from 'vitest'
import { uuid } from '@/utils/uuid'

describe('uuid', () => {
  it('generates a string', () => {
    expect(typeof uuid()).toBe('string')
  })

  it('generates valid UUID v4 format', () => {
    const id = uuid()
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/
    expect(id).toMatch(uuidRegex)
  })

  it('generates unique values', () => {
    const ids = new Set(Array.from({ length: 100 }, () => uuid()))
    expect(ids.size).toBe(100)
  })

  it('has correct length (36 chars)', () => {
    expect(uuid().length).toBe(36)
  })
})
