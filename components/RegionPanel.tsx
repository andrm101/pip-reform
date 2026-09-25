'use client'
import { useEffect, useState } from 'react'
import type { RegionProfile, AttEstimate, EcoScore } from '@/lib/types'
import PopChart from './PopChart'

interface Props {
  id: string
  onClose: () => void
}

function useProfile(id: string | null) {
  const [data, setData] = useState<RegionProfile | null>(null)
  const [loading, setLoading] = useState(false)
  useEffect(() => {
    if (!id) { setData(null); return }
    setLoading(true)
    fetch(`/data/region/${id}.json`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { setData(d); setLoading(false) })
      .catch(() => { setData(null); setLoading(false) })
  }, [id])
  return { data, loading }
}

function Stat({ label, value, unit }: { label: string; value: string | number | null; unit?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest">{label}</span>
      <span className="text-sm font-mono text-[#f0f0f0]">
        {value != null ? `${value}${unit ?? ''}` : <span className="text-[#2a2a2a]">—</span>}
      </span>
    </div>
  )
}

function AttRow({ label, att }: { label: string; att: AttEstimate | null }) {
  if (!att) return null
  const isPlaceholder = att.isPlaceholder
  const coef = att.coef != null ? (att.coef > 0 ? '+' : '') + att.coef.toFixed(3) : null
  const ci = att.ci95lo != null && att.ci95hi != null
    ? `[${att.ci95lo.toFixed(3)}, ${att.ci95hi.toFixed(3)}]`
    : null

  return (
    <div className="border-t border-[#1e1e1e] pt-2">
      <div className="flex justify-between items-baseline">
        <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest">{label}</span>
        {isPlaceholder
          ? <span className="text-[10px] font-mono text-[#444] italic">pending DiD</span>
          : null
        }
      </div>
      {isPlaceholder ? (
        <div className="mt-1 h-5 w-24 bg-[#1c1c1c] animate-pulse rounded-none" />
      ) : (
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className={`text-sm font-mono font-semibold ${att.coef! < 0 ? 'text-[#ff4d4d]' : 'text-[#4dffb4]'}`}>
            {coef}
          </span>
          {ci && <span className="text-[10px] font-mono text-[#444]">{ci}</span>}
        </div>
      )}
    </div>
  )
}

function EcoBar({ score }: { score: EcoScore }) {
  const tierColor = score.tier === 1 ? '#e8ff47' : score.tier === 2 ? '#4d7cff' : '#2a2a2a'
  return (
    <div className="flex items-center gap-2">
      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tierColor }} />
      <span className="text-[10px] font-mono text-[#888] flex-1 truncate">{score.label}</span>
      <div className="w-16 h-1 bg-[#1c1c1c] rounded-full overflow-hidden flex-shrink-0">
        <div className="h-full rounded-full" style={{ width: `${score.score * 100}%`, background: tierColor }} />
      </div>
      <span className="text-[10px] font-mono text-[#444] w-8 text-right flex-shrink-0">
        {(score.score * 100).toFixed(0)}
      </span>
    </div>
  )
}

export default function RegionPanel({ id, onClose }: Props) {
  const { data: p, loading } = useProfile(id)

  const reformColor = p?.reformStatus === 'demoted'
    ? '#ff4d4d'
    : p?.reformStatus === 'retained'
    ? '#4dffb4'
    : null

  const popChangePct = p?.popChange20yr != null
    ? `${p.popChange20yr > 0 ? '+' : ''}${(p.popChange20yr * 100).toFixed(1)}%`
    : null

  return (
    <aside
      className="
        w-[340px] flex-shrink-0 flex flex-col h-full
        border-l border-[#1e1e1e] bg-[#080808]
        overflow-y-auto
      "
    >
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b border-[#1e1e1e] sticky top-0 bg-[#080808] z-10">
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="h-5 w-40 bg-[#1c1c1c] animate-pulse rounded-none mb-1" />
          ) : (
            <h2 className="text-sm font-semibold text-[#f0f0f0] leading-tight truncate">
              {p?.name ?? id}
            </h2>
          )}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest">{p?.country ?? ''}</span>
            <span className="text-[10px] font-mono text-[#2a2a2a]">/</span>
            <span className="text-[10px] font-mono text-[#444]">{id}</span>
            {p?.level && (
              <>
                <span className="text-[10px] font-mono text-[#2a2a2a]">/</span>
                <span className="text-[10px] font-mono text-[#444]">{p.level}</span>
              </>
            )}
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-3 text-[#444] hover:text-[#f0f0f0] transition-colors text-lg leading-none cursor-pointer mt-0.5"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      {loading && (
        <div className="flex flex-col gap-3 p-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-4 bg-[#1c1c1c] animate-pulse rounded-none" style={{ width: `${60 + i * 10}%` }} />
          ))}
        </div>
      )}

      {!loading && p && (
        <div className="flex flex-col gap-0">

          {/* Archetype + reform status */}
          <div className="px-4 py-3 flex flex-wrap gap-2 border-b border-[#1e1e1e]">
            {p.archetype && (
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[#2a2a2a] text-[#888] uppercase tracking-widest">
                {p.archetype}
              </span>
            )}
            {p.reformStatus && (
              <span
                className="text-[10px] font-mono px-2 py-0.5 border uppercase tracking-widest font-semibold"
                style={{ borderColor: reformColor!, color: reformColor!, background: `${reformColor}14` }}
              >
                {p.reformStatus}
              </span>
            )}
            {p.isTransitionRegion && (
              <span className="text-[10px] font-mono px-2 py-0.5 border border-[#2a2a2a] text-[#444] uppercase tracking-widest">
                transition region
              </span>
            )}
          </div>

          {/* Key stats */}
          <div className="px-4 py-3 grid grid-cols-2 gap-x-4 gap-y-3 border-b border-[#1e1e1e]">
            <Stat
              label="GDP / cap PPS"
              value={p.gdpPerCapitaPps != null ? Math.round(p.gdpPerCapitaPps).toLocaleString() : null}
              unit=" €"
            />
            <Stat
              label="R&D % GDP"
              value={p.rdExpenditurePctGdp != null ? p.rdExpenditurePctGdp.toFixed(2) : null}
              unit="%"
            />
            <Stat
              label="HRST / 1000"
              value={p.hrstPer1000 != null ? p.hrstPer1000.toFixed(1) : null}
            />
            <Stat
              label="Pop Δ 20yr"
              value={popChangePct}
            />
          </div>

          {/* Polish reform stats */}
          {p.reformStatus && (
            <div className="px-4 py-3 border-b border-[#1e1e1e] flex flex-col gap-2">
              <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest mb-1">
                DiD Estimates (ATT, horizon {p.attPopulation?.horizon ?? 20}yr)
              </span>
              <AttRow label="Population (ln)" att={p.attPopulation ?? null} />
              <AttRow label="Firms / 1k pop" att={p.attFirms ?? null} />
              <AttRow label="Unemployment" att={p.attUnemployment ?? null} />
              <AttRow label="Avg Wages (ln)" att={p.attWages ?? null} />
            </div>
          )}

          {/* Population chart */}
          {p.populationSeries && p.populationSeries.length > 0 && (
            <div className="px-4 py-3 border-b border-[#1e1e1e]">
              <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest block mb-2">
                Population
              </span>
              <PopChart data={p.populationSeries} reformYear={1999} />
            </div>
          )}

          {/* Eco scores */}
          {p.ecoScores && p.ecoScores.length > 0 && (
            <div className="px-4 py-3">
              <span className="text-[10px] font-mono text-[#444] uppercase tracking-widest block mb-2">
                Deep-Tech Suitability
              </span>
              <div className="flex flex-col gap-2">
                {p.ecoScores.slice(0, 6).map(s => (
                  <EcoBar key={s.type} score={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!loading && !p && (
        <div className="flex items-center justify-center flex-1 p-4">
          <span className="text-xs font-mono text-[#444]">no profile for {id}</span>
        </div>
      )}
    </aside>
  )
}
