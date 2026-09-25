'use client'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import LayerSwitcher, { type LayerId } from '@/components/LayerSwitcher'
import RegionPanel from '@/components/RegionPanel'

const MapView = dynamic(() => import('@/components/Map'), { ssr: false })

const LAYER_DESCRIPTIONS: Record<LayerId, string> = {
  'reform-impact': 'Avg population change in demoted capitals, 1999–2019',
  innovation:      'Innovation archetype score by NUTS2 region',
  investment:      'Deep-tech investment suitability score',
  gdp:             'GDP per capita, PPS (Eurostat REGIO)',
}

export default function Home() {
  const [activeLayer, setActiveLayer] = useState<LayerId>('reform-impact')
  const [layerValues, setLayerValues] = useState<Record<string, number>>({})
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/data/layers/${activeLayer}.json`)
      .then(r => r.json())
      .then(d => setLayerValues(d.values ?? {}))
      .catch(() => setLayerValues({}))
  }, [activeLayer])

  return (
    <div className="flex flex-col h-screen bg-[#080808] overflow-hidden">

      {/* Header */}
      <header className="
        flex items-center justify-between
        px-5 h-12 flex-shrink-0
        border-b border-[#1e1e1e]
      ">
        <div className="flex items-center gap-4 min-w-0">
          <span className="font-mono text-[#e8ff47] text-sm tracking-[0.2em] uppercase font-bold select-none">
            PIP.REFORM
          </span>
          <span className="hidden sm:block text-[10px] font-mono text-[#444] uppercase tracking-widest truncate">
            Polish Capital Reform 1999 · Research Intelligence Platform
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LayerSwitcher active={activeLayer} onChange={setActiveLayer} />
        </div>
      </header>

      {/* Layer description bar */}
      <div className="px-5 h-7 flex-shrink-0 flex items-center border-b border-[#1e1e1e]">
        <span className="text-[10px] font-mono text-[#444]">
          {LAYER_DESCRIPTIONS[activeLayer]}
        </span>
      </div>

      {/* Main */}
      <div className="flex flex-1 min-h-0">

        {/* Map */}
        <div className="flex-1 relative">
          <MapView
            layerValues={layerValues}
            activeLayer={activeLayer}
            selectedId={selectedId}
            onSelectRegion={setSelectedId}
          />

          {/* Legend */}
          <Legend activeLayer={activeLayer} />

          {/* Hint */}
          {!selectedId && (
            <div className="absolute bottom-4 left-4 pointer-events-none">
              <span className="text-[10px] font-mono text-[#444]">
                click a region to inspect
              </span>
            </div>
          )}
        </div>

        {/* Side panel */}
        {selectedId && (
          <RegionPanel id={selectedId} onClose={() => setSelectedId(null)} />
        )}
      </div>
    </div>
  )
}

// ── Inline legend ──────────────────────────────────────────────────────────────

const LEGEND_CONFIG: Record<LayerId, {
  type: 'diverging' | 'sequential'
  lo: string; hi: string; mid?: string
  loLabel: string; hiLabel: string
}> = {
  'reform-impact': {
    type: 'diverging',
    lo: '#ff4d4d', mid: '#1c1c1c', hi: '#4dffb4',
    loLabel: 'pop decline', hiLabel: 'pop growth',
  },
  innovation: {
    type: 'sequential',
    lo: '#141414', hi: '#4d7cff',
    loLabel: 'low', hiLabel: 'high',
  },
  investment: {
    type: 'sequential',
    lo: '#141414', hi: '#e8ff47',
    loLabel: 'low', hiLabel: 'high',
  },
  gdp: {
    type: 'sequential',
    lo: '#141414', hi: '#ff9900',
    loLabel: 'low', hiLabel: 'high',
  },
}

function Legend({ activeLayer }: { activeLayer: LayerId }) {
  const cfg = LEGEND_CONFIG[activeLayer]
  const gradient = cfg.type === 'diverging'
    ? `linear-gradient(to right, ${cfg.lo}, ${cfg.mid ?? '#1c1c1c'}, ${cfg.hi})`
    : `linear-gradient(to right, ${cfg.lo}, ${cfg.hi})`

  return (
    <div className="absolute bottom-4 right-4 bg-[#080808]/80 border border-[#1e1e1e] px-3 py-2 flex flex-col gap-1.5">
      <div className="h-2 w-32 rounded-none" style={{ background: gradient }} />
      <div className="flex justify-between">
        <span className="text-[9px] font-mono text-[#444]">{cfg.loLabel}</span>
        <span className="text-[9px] font-mono text-[#444]">{cfg.hiLabel}</span>
      </div>
    </div>
  )
}
