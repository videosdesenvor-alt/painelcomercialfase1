import { UF_NOME, UF_REGIAO, type Regiao } from '../../lib/utils'
import { BR_VIEWBOX, BR_STATES } from '../../lib/brazil-geo'

/**
 * Mapa do Brasil com o contorno geográfico real de cada estado (UF).
 * A intensidade da cor e o rótulo seguem a métrica escolhida (clientes ou
 * receita). Clicar filtra a página Clientes por aquele estado.
 */
export function BrazilMap({
  values,
  max,
  format,
  formatLong,
  onSelect,
  regiao = 'all',
}: {
  values: Record<string, number>
  max: number
  /** rótulo dentro do estado — precisa ser curto, o espaço é apertado */
  format: (v: number) => string
  /** versão completa, usada só no tooltip */
  formatLong?: (v: number) => string
  onSelect: (uf: string) => void
  /** 'all' ou uma região — as demais ficam esmaecidas */
  regiao?: 'all' | Regiao
}) {
  const long = formatLong ?? format
  return (
    <svg
      viewBox={BR_VIEWBOX}
      width="100%"
      className="h-auto w-full max-h-[560px]"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Mapa do Brasil por estado"
    >
      {BR_STATES.map((s) => {
        const v = values[s.uf] ?? 0
        const t = max > 0 ? v / max : 0
        const fill = v === 0 ? 'var(--map-empty)' : `rgba(253,78,23,${(0.16 + t * 0.74).toFixed(3)})`
        const fora = regiao !== 'all' && UF_REGIAO[s.uf] !== regiao
        return (
          <path
            key={s.uf}
            d={s.d}
            fill={fill}
            className="br-state"
            opacity={fora ? 0.18 : 1}
            onClick={() => onSelect(s.uf)}
            tabIndex={0}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelect(s.uf)}
          >
            <title>{`${UF_NOME[s.uf]} (${UF_REGIAO[s.uf]}) — ${long(v)}`}</title>
          </path>
        )
      })}

      {/* Rótulos: sigla em cima, valor embaixo */}
      {BR_STATES.map((s) => {
        const v = values[s.uf] ?? 0
        if (!v) return null
        const t = max > 0 ? v / max : 0
        const fora = regiao !== 'all' && UF_REGIAO[s.uf] !== regiao
        return (
          <text
            key={s.uf}
            x={s.cx}
            y={s.cy}
            textAnchor="middle"
            dominantBaseline="central"
            opacity={fora ? 0.2 : 1}
            className="pointer-events-none select-none"
            style={{
              fontFamily: "'Manrope', sans-serif",
              fill: '#fff',
              stroke: 'rgba(8,8,9,0.9)',
              strokeWidth: 3.2,
              paintOrder: 'stroke',
            }}
          >
            <tspan x={s.cx} dy="-0.5em" style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.5 }}>
              {s.uf}
            </tspan>
            <tspan x={s.cx} dy="1.25em" style={{ fontSize: t > 0.35 ? 16 : 13.5, fontWeight: 700 }}>
              {format(v)}
            </tspan>
          </text>
        )
      })}
    </svg>
  )
}
