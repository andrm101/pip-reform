'use client'

export type LayerId = 'reform-impact' | 'innovation' | 'investment' | 'gdp'

const LAYERS: { id: LayerId; label: string; color: string }[] = [
  { id: 'reform-impact', label: 'Reform Impact', color: '#4dffb4' },
  { id: 'innovation',    label: 'Innovation',    color: '#4d7cff' },
  { id: 'investment',    label: 'Investment',    color: '#e8ff47' },
  { id: 'gdp',          label: 'GDP / Capita',  color: '#ff9900' },
]

interface Props {
  active: LayerId
  onChange: (id: LayerId) => void
}

export default function LayerSwitcher({ active, onChange }: Props) {
  return (
    <div className="flex gap-1">
      {LAYERS.map(({ id, label, color }) => {
        const isActive = id === active
        return (
          <button
            key={id}
            onClick={() => onChange(id)}
            style={{
              borderColor: isActive ? color : 'transparent',
              color: isActive ? color : '#888888',
              background: isActive ? `${color}14` : 'transparent',
            }}
            className="
              px-3 py-1.5 text-xs font-mono tracking-widest uppercase
              border transition-all duration-150 rounded-none
              hover:text-[#f0f0f0] hover:border-[#2a2a2a]
              cursor-pointer select-none
            "
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
