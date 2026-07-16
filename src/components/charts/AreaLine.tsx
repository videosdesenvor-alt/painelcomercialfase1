import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '../../lib/utils'

interface Props {
  data: number[]
  ghost?: number[]
  labels?: string[]
  format?: (v: number) => string
  height?: number
  color?: string
  color2?: string
  yTicks?: number
}

const W = 760
const padL = 46
const padR = 12
const padT = 24
const padB = 26

function smoothPath(pts: { x: number; y: number }[]): string {
  if (pts.length < 2) return pts.length ? `M ${pts[0].x},${pts[0].y}` : ''
  let d = `M ${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`
  const t = 0.2
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] || p2
    const c1x = p1.x + (p2.x - p0.x) * t
    const c1y = p1.y + (p2.y - p0.y) * t
    const c2x = p2.x - (p3.x - p1.x) * t
    const c2y = p2.y - (p3.y - p1.y) * t
    d += ` C ${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
  }
  return d
}

export function AreaLine({
  data,
  ghost,
  labels,
  format = (v) => String(Math.round(v)),
  height = 280,
  color = '#FD4E17',
  color2 = '#FF7A21',
  yTicks = 4,
}: Props) {
  const H = height
  const ref = useRef<SVGSVGElement>(null)

  const plotW = W - padL - padR
  const plotH = H - padT - padB

  const { pts, ghostPts, line, area, ticks } = useMemo(() => {
    const all = ghost ? [...data, ...ghost] : data
    const max = Math.max(...all, 1)
    const min = Math.min(...all, 0)
    const span = max - min || 1
    const x = (i: number, n: number) => padL + (i / (n - 1 || 1)) * plotW
    const y = (v: number) => padT + plotH * (1 - (v - min) / span)
    const pts = data.map((v, i) => ({ x: x(i, data.length), y: y(v) }))
    const ghostPts = ghost ? ghost.map((v, i) => ({ x: x(i, ghost.length), y: y(v) })) : null
    const line = smoothPath(pts)
    const area = `${line} L ${padL + plotW},${padT + plotH} L ${padL},${padT + plotH} Z`
    const ticks = Array.from({ length: yTicks + 1 }, (_, k) => {
      const val = min + (span * k) / yTicks
      return { val, y: y(val) }
    })
    return { pts, ghostPts, line, area, ticks }
  }, [data, ghost, plotW, plotH, yTicks])

  const defaultIdx = useMemo(() => {
    let mi = 0
    for (let i = 1; i < data.length; i++) if (data[i] > data[mi]) mi = i
    return Math.min(mi, data.length - 1)
  }, [data])

  const [hover, setHover] = useState<number | null>(null)
  useEffect(() => setHover(defaultIdx), [defaultIdx])

  function onMove(e: React.PointerEvent<SVGSVGElement>) {
    const rect = ref.current!.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const idx = Math.round(((px - padL) / plotW) * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, idx)))
  }

  const hp = hover !== null ? pts[hover] : null

  return (
    <div className="relative w-full select-none">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        preserveAspectRatio="none"
        onPointerMove={onMove}
        onPointerLeave={() => setHover(defaultIdx)}
        style={{ touchAction: 'none', display: 'block' }}
      >
        <defs>
          <linearGradient id="al-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={color2} />
            <stop offset="0.5" stopColor={color} />
            <stop offset="1" stopColor="#FF9A5C" />
          </linearGradient>
          <linearGradient id="al-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.30" />
            <stop offset="0.6" stopColor={color} stopOpacity="0.06" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
          <filter id="al-glow" x="-20%" y="-60%" width="140%" height="220%">
            <feGaussianBlur stdDeviation="5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Y gridlines + labels */}
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={t.y} y2={t.y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <text x={padL - 10} y={t.y + 3} textAnchor="end" fontSize="10" fontFamily="'Manrope', sans-serif" fill="#66738B">
              {format(t.val)}
            </text>
          </g>
        ))}

        {/* Ghost line (comparativo) */}
        {ghostPts && (
          <path d={smoothPath(ghostPts)} fill="none" stroke="#8B5CF6" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" strokeDasharray="1 0" />
        )}

        {/* Área + linha principal */}
        <path d={area} fill="url(#al-fill)" />
        <path d={line} fill="none" stroke="url(#al-stroke)" strokeWidth="3" strokeLinecap="round" filter="url(#al-glow)" />

        {/* Ponto + guia */}
        {hp && (
          <>
            <line x1={hp.x} x2={hp.x} y1={padT - 6} y2={H - padB} stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
            <circle cx={hp.x} cy={hp.y} r="6.5" fill="#fff" stroke={color} strokeWidth="3" />
            <circle cx={hp.x} cy={hp.y} r="13" fill="none" stroke={color} strokeOpacity="0.35" strokeWidth="1.5" />
          </>
        )}
      </svg>

      {/* Tooltip (vira pra baixo quando o ponto está no topo) */}
      {hp && hover !== null && (
        <div
          className={cn(
            'pointer-events-none absolute z-10 flex -translate-x-1/2 flex-col items-center rounded-xl border border-hair bg-elevated/95 px-3 py-2 shadow-lift backdrop-blur',
            hp.y < 70 ? 'translate-y-0' : '-translate-y-full',
          )}
          style={{
            left: `${Math.min(Math.max((hp.x / W) * 100, 9), 91)}%`,
            top: `${hp.y < 70 ? hp.y + 16 : hp.y - 14}px`,
          }}
        >
          <div className="whitespace-nowrap font-display text-sm font-bold text-ink tnum">{format(data[hover])}</div>
          {labels && <div className="whitespace-nowrap text-[10px] text-ink-mute">{labels[hover]}</div>}
        </div>
      )}

      {/* X labels */}
      {labels && (
        <div className="mt-1 flex justify-between text-[10px] text-ink-mute" style={{ paddingLeft: `${(padL / W) * 100}%`, paddingRight: `${(padR / W) * 100}%` }}>
          {labels.map((l, i) => {
            const stepN = Math.ceil(labels.length / 9)
            return i % stepN === 0 || i === labels.length - 1 ? (
              <span key={i} className="tnum">{l}</span>
            ) : (
              <span key={i} className="w-0 opacity-0">·</span>
            )
          })}
        </div>
      )}
    </div>
  )
}
