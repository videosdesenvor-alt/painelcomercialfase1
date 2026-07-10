interface Seg {
  value: number
  color: string
  label: string
}

export function Donut({
  segments,
  size = 190,
  thickness = 20,
  centerTop,
  centerMain,
  centerSub,
}: {
  segments: Seg[]
  size?: number
  thickness?: number
  centerTop?: string
  centerMain?: string
  centerSub?: string
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1
  const r = (size - thickness) / 2
  const C = 2 * Math.PI * r
  const gap = 2 // px de respiro entre fatias
  let acc = 0

  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={thickness}
        />
        {segments.map((s, i) => {
          if (s.value <= 0) return null
          const frac = s.value / total
          const len = frac * C
          const dash = Math.max(len - gap, 0.5)
          const el = (
            <circle
              key={i}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={thickness}
              strokeLinecap="round"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-acc}
              style={{ transition: 'stroke-dasharray .6s cubic-bezier(.16,1,.3,1)' }}
            />
          )
          acc += len
          return el
        })}
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        {centerTop && <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">{centerTop}</div>}
        {centerMain && <div className="font-display text-2xl font-bold text-ink tnum leading-tight">{centerMain}</div>}
        {centerSub && <div className="text-[11px] text-ink-sub">{centerSub}</div>}
      </div>
    </div>
  )
}
