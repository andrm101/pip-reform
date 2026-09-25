'use client'
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import type { TimePoint } from '@/lib/types'

interface Props {
  data: TimePoint[]
  reformYear?: number
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const val = payload[0]?.value
  return (
    <div className="bg-[#1c1c1c] border border-[#2a2a2a] px-2 py-1.5 text-xs font-mono">
      <span className="text-[#888]">{label} </span>
      <span className="text-[#f0f0f0]">
        {typeof val === 'number' ? val.toLocaleString() : '—'}
      </span>
    </div>
  )
}

export default function PopChart({ data, reformYear = 1999 }: Props) {
  if (!data || data.length === 0) return null

  const chartData = data
    .filter(d => d.value != null)
    .map(d => ({ year: d.year, pop: d.value }))

  const minPop = Math.min(...chartData.map(d => d.pop!))
  const maxPop = Math.max(...chartData.map(d => d.pop!))
  const pad = (maxPop - minPop) * 0.08 || 1000

  return (
    <ResponsiveContainer width="100%" height={120}>
      <LineChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <XAxis
          dataKey="year"
          tick={{ fill: '#444', fontSize: 10, fontFamily: 'Space Mono, monospace' }}
          tickLine={false}
          axisLine={{ stroke: '#1e1e1e' }}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[minPop - pad, maxPop + pad]}
          tick={false}
          axisLine={false}
          tickLine={false}
          width={0}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          x={reformYear}
          stroke="#e8ff47"
          strokeDasharray="3 3"
          strokeWidth={1}
          label={{
            value: `'${String(reformYear).slice(2)}`,
            fill: '#e8ff47',
            fontSize: 9,
            fontFamily: 'Space Mono, monospace',
            position: 'insideTopRight',
          }}
        />
        <Line
          type="monotone"
          dataKey="pop"
          stroke="#4d7cff"
          strokeWidth={1.5}
          dot={false}
          activeDot={{ r: 3, fill: '#e8ff47', stroke: 'none' }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
