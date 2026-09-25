'use client'
import { useRef, useMemo, useState, useCallback } from 'react'
import Map, { Source, Layer } from 'react-map-gl/maplibre'
import type { MapRef, MapLayerMouseEvent } from 'react-map-gl/maplibre'
import type { LayerProps } from 'react-map-gl/maplibre'
import type { LayerId } from './LayerSwitcher'

const STYLE_URL = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
const NUTS2_URL = '/geo/nuts2_10m.geojson'

const FALLBACK_COLOR = '#141414'

// Linear interpolation between two RGB triples
function lerpColor(c0: [number, number, number], c1: [number, number, number], t: number): string {
  const r = Math.round(c0[0] + (c1[0] - c0[0]) * t)
  const g = Math.round(c0[1] + (c1[1] - c0[1]) * t)
  const b = Math.round(c0[2] + (c1[2] - c0[2]) * t)
  return `rgb(${r},${g},${b})`
}

const LAYER_PALETTES: Record<string, { lo: [number,number,number]; hi: [number,number,number] }> = {
  innovation: { lo: [20, 20, 28], hi: [77, 124, 255] },   // dark → blue
  investment: { lo: [20, 20, 14], hi: [232, 255, 71] },   // dark → yellow
  gdp:        { lo: [22, 18, 14], hi: [255, 153, 0] },    // dark → orange
}

function buildMatchExpr(
  layerValues: Record<string, number>,
  layerId: string,
  selectedId: string | null,
): string | any[] {
  const entries = Object.entries(layerValues).filter(([, v]) => v != null && !isNaN(v))
  if (entries.length === 0) return FALLBACK_COLOR

  const vals = entries.map(([, v]) => v)
  const min = Math.min(...vals)
  const max = Math.max(...vals)
  const range = max - min || 1

  const matchArgs: any[] = ['match', ['get', 'NUTS_ID']]

  if (layerId === 'reform-impact') {
    // Diverging: red (negative pop loss) ↔ dark gray ↔ green (positive)
    const zeroT = (0 - min) / range
    entries.forEach(([id, v]) => {
      const t = (v - min) / range
      let color: string
      if (t <= zeroT) {
        const s = zeroT > 0 ? t / zeroT : 0
        color = lerpColor([255, 77, 77], [28, 28, 28], s)
      } else {
        const s = zeroT < 1 ? (t - zeroT) / (1 - zeroT) : 1
        color = lerpColor([28, 28, 28], [77, 255, 180], s)
      }
      matchArgs.push(id, color)
    })
  } else {
    const pal = LAYER_PALETTES[layerId] ?? LAYER_PALETTES.innovation
    entries.forEach(([id, v]) => {
      const t = (v - min) / range
      matchArgs.push(id, lerpColor(pal.lo, pal.hi, t))
    })
  }

  matchArgs.push(FALLBACK_COLOR)
  return matchArgs
}

interface Props {
  layerValues: Record<string, number>
  activeLayer: LayerId
  selectedId: string | null
  onSelectRegion: (id: string) => void
}

export default function MapView({ layerValues, activeLayer, selectedId, onSelectRegion }: Props) {
  const mapRef = useRef<MapRef>(null)
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [cursor, setCursor] = useState<'default' | 'pointer'>('default')

  const fillColor = useMemo(
    () => buildMatchExpr(layerValues, activeLayer, selectedId),
    [layerValues, activeLayer, selectedId],
  )

  const handleClick = useCallback((e: MapLayerMouseEvent) => {
    const feature = e.features?.[0]
    if (!feature) return
    const id = feature.properties?.NUTS_ID as string | undefined
    if (id) onSelectRegion(id)
  }, [onSelectRegion])

  const handleMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const id = e.features?.[0]?.properties?.NUTS_ID as string | undefined
    setHoveredId(id ?? null)
    setCursor(id ? 'pointer' : 'default')
  }, [])

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null)
    setCursor('default')
  }, [])

  const fillLayer: LayerProps = {
    id: 'regions-fill',
    type: 'fill',
    paint: {
      'fill-color': fillColor as any,
      'fill-opacity': 0.82,
    },
  }

  const outlineLayer: LayerProps = {
    id: 'regions-outline',
    type: 'line',
    paint: {
      'line-color': '#0a0a0a',
      'line-width': 0.4,
    },
  }

  const hoverLayer: LayerProps = {
    id: 'regions-hover',
    type: 'fill',
    filter: ['==', ['get', 'NUTS_ID'], hoveredId ?? ''],
    paint: {
      'fill-color': '#ffffff',
      'fill-opacity': 0.08,
    },
  }

  const selectedLayer: LayerProps = {
    id: 'regions-selected',
    type: 'line',
    filter: ['==', ['get', 'NUTS_ID'], selectedId ?? ''],
    paint: {
      'line-color': '#e8ff47',
      'line-width': 1.5,
    },
  }

  return (
    <div style={{ width: '100%', height: '100%', cursor }}>
      <Map
        ref={mapRef}
        initialViewState={{ longitude: 18, latitude: 52, zoom: 3.8 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={STYLE_URL}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        interactiveLayerIds={['regions-fill']}
        attributionControl={false}
      >
        <Source id="regions" type="geojson" data={NUTS2_URL}>
          <Layer {...fillLayer} />
          <Layer {...outlineLayer} />
          <Layer {...hoverLayer} />
          <Layer {...selectedLayer} />
        </Source>
      </Map>
    </div>
  )
}
