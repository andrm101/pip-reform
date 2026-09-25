// Matches region_profiles_gold.parquet schema (EU Innovation Panel)
// and panel_powiat.parquet schema (PL DiD analysis)
export interface RegionSummary {
  id: string                  // NUTS2 or NUTS3 code, e.g. "PL921"
  name: string                // human name
  country: string             // ISO2 country code
  level: 'NUTS2' | 'NUTS3'
  archetype: 'Advanced Innovation' | 'Catching-Up Peripheral' | null
  archetypeId: 0 | 1 | null
  gdpPerCapitaPps: number | null
  rdExpenditurePctGdp: number | null
  hrstPer1000: number | null
  isTransitionRegion: boolean
  reformStatus: 'retained' | 'demoted' | 'ro-candidate' | 'ro-at-risk' | null
  popChange20yr: number | null
  topEcoType: EcoTypeCode | null
  topEcoScore: number | null
  lat: number | null
  lng: number | null
}

export interface RegionProfile extends RegionSummary {
  namePl?: string
  voivodeship?: string
  capitalType?: string
  population1998: number | null
  unemploymentPeak: number | null
  unemploymentPeakYear: number | null
  regonFirmsChange: number | null
  avgWageChange: number | null
  attPopulation: AttEstimate | null
  attFirms: AttEstimate | null
  attUnemployment: AttEstimate | null
  attWages: AttEstimate | null
  populationSeries: TimePoint[]
  ecoScores: EcoScore[]
  scenarios: ScenarioResult[]
  related: RegionSummary[]
}

export interface AttEstimate {
  coef: number | null
  se: number | null
  ci95lo: number | null
  ci95hi: number | null
  horizon: number
  isPlaceholder: boolean
}

export interface TimePoint {
  year: number
  value: number
  isProjection: boolean
}

export type EcoTypeCode = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'T8'

export const ECO_TYPE_LABELS: Record<EcoTypeCode, string> = {
  T1: 'AI / ML Hub',
  T2: 'Biotech / Life Sci',
  T3: 'Semiconductors',
  T4: 'Cleantech / Green',
  T5: 'Hyperscale Data Centre',
  T6: 'Advanced Nuclear',
  T7: 'Deep-Tech Robotics',
  T8: 'Quantum / Photonics',
}

export interface EcoScore {
  type: EcoTypeCode
  label: string
  score: number
  tier: 1 | 2 | 3
  shortlisted: boolean
  uncertainty: number
}

export interface ScenarioResult {
  id: 'baseline' | '8-region' | '10-region' | '12-region'
  label: string
  nDemoted: number
  nCapitals: number
  riskLevel: 'none' | 'low' | 'medium' | 'high'
  popProjection20yr: number | null
  gdpImpact: number | null
  isRecommended: boolean
}

export interface MapLayer {
  id: string
  label: string
  values: Record<string, number>
  domain: [number, number]
  colorScheme: 'blue' | 'diverging' | 'sequential-green'
}

export type AudienceMode = 'public' | 'analyst'
