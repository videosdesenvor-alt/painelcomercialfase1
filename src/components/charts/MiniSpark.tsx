export function MiniSpark({
  data,
  color = '#FF4C24',
  width = 108,
  height = 34,
}: {
  data: number[]
  color?: string
  width?: number
  height?: number
}) {
  if (!data.length) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const span = max - min || 1
  const step = width / (data.length - 1 || 1)
  const pts = data.map((v, i) => [i * step, height - 3 - (height - 6) * ((v - min) / span)])
  const line = pts.map((p, i) => `${i ? 'L' : 'M'} ${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ')
  const area = `${line} L ${width},${height} L 0,${height} Z`
  const gid = 'ms-' + color.replace('#', '')
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={color} />
    </svg>
  )
}
