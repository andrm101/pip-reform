import { describe, it, expect } from 'vitest'
import { colors, fonts } from '@/lib/tokens'

describe('design tokens', () => {
  it('has accent color', () => expect(colors.accent).toBe('#e8ff47'))
  it('has bg color', () => expect(colors.bg).toBe('#080808'))
  it('has space grotesk font', () => expect(fonts.sans).toContain('Space Grotesk'))
})
