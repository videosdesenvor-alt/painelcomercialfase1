import { UF_NOME } from '../../lib/utils'
import { BR_VIEWBOX, BR_STATES } from '../../lib/brazil-geo'

/**
 * Mapa do Brasil com o contorno geográfico real de cada estado (UF).
 * A cor indica a quantidade de clientes; o número é demarcado no centro
 * do estado. Clicar filtra a página Clientes por aquele estado.
 */
export function BrazilMap({
  counts,
  max,
  onSelect,
}: {
  counts: Record<string, number>
  max: number
  onSelect: (uf: string) => void
}) {
  return (
    <svg
      viewBox={BR_VIEWBOX}
      width="100%"
      className="h-auto w-full max-h-[560px]"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Mapa de clientes por estado do Brasil"
    >
      {/* estados */}
      {BR_STATES.map((s) => {
        const n = counts[s.uf] ?? 0
        const t = max > 0 ? n / max : 0
        const fill = n === 0 ? 'var(--map-empty)' : `rgba(253,78,23,${(0.16 + t * 0.74).toFixed(3)})`
        return (
          <path
            key={s.uf}
            d={s.d}
            fill={fill}
            className="br-state"
            onClick={() => onSelect(s.uf)}
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(s.uf)}
          >
            <title>{`${UF_NOME[s.uf]} — ${n} cliente${n === 1 ? '' : 's'}`}</title>
          </path>
        )
      })}

      {/* números por estado */}
      {BR_STATES.map((s) => {
        const n = counts[s.uf] ?? 0
        if (!n) return null
        const t = max > 0 ? n / max : 0
        return (
          <text
            key={s.uf}
            x={s.cx}
            y={s.cy}
            textAnchor="middle"
            dominantBaseline="central"
            className="pointer-events-none select-none"
            style={{
              fontFamily: "'Manrope', sans-serif",
              fontSize: t > 0.35 ? 17 : 14,
              fontWeight: 700,
              fill: '#fff',
              stroke: 'rgba(8,8,9,0.9)',
              strokeWidth: 3.4,
              paintOrder: 'stroke',
            }}
          >
            {n}
          </text>
        )
      })}
    </svg>
  )
}
