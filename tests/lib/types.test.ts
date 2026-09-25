import { describe, it, expectTypeOf } from 'vitest'
import type { RegionSummary, RegionProfile, EcoScore, ScenarioResult } from '@/lib/types'

describe('types', () => {
  it('RegionSummary has required fields', () => {
    expectTypeOf<RegionSummary>().toHaveProperty('id')
    expectTypeOf<RegionSummary>().toHaveProperty('name')
    expectTypeOf<RegionSummary>().toHaveProperty('country')
    expectTypeOf<RegionSummary>().toHaveProperty('archetype')
    expectTypeOf<RegionSummary>().toHaveProperty('popChange20yr')
  })
  it('EcoScore T1-T8 union is valid', () => {
    const t: EcoScore['type'] = 'T1'
    expectTypeOf(t).toBeString()
  })
})
