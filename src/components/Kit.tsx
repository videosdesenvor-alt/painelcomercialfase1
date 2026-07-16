import { cn } from '../lib/utils'
import { MiniSpark } from './charts/MiniSpark'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

export function CardHead({
  title,
  sub,
  right,
}: {
  title: string
  sub?: string
  right?: React.ReactNode
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h3 className="font-display text-[15px] font-bold text-ink">{title}</h3>
        {sub && <p className="mt-0.5 text-xs text-ink-mute">{sub}</p>}
      </div>
      {right}
    </div>
  )
}

export function KpiCard({
  label,
  value,
  delta,
  deltaUp,
  spark,
  color = '#FD4E17',
  glow = false,
  icon: Icon,
}: {
  label: string
  value: string
  delta?: string
  deltaUp?: boolean
  spark?: number[]
  color?: string
  glow?: boolean
  icon?: typeof ArrowUpRight
}) {
  return (
    <div
      className={cn(
        'panel panel-hover relative overflow-hidden p-4 sm:p-5',
        glow && 'ring-1 ring-ember/25',
      )}
    >
      {glow && (
        <div className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-ember/25 blur-3xl" />
      )}
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-ink-mute">
          {Icon && (
            <span className="grid h-6 w-6 place-items-center rounded-md" style={{ background: color + '1f', color }}>
              <Icon size={13} />
            </span>
          )}
          {label}
        </div>
        {delta && (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-bold',
              deltaUp ? 'text-positive' : 'text-danger',
            )}
            style={{ background: (deltaUp ? '#34D399' : '#F5544F') + '18' }}
          >
            {deltaUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {delta}
          </span>
        )}
      </div>
      <div className="relative mt-3 flex items-end justify-between gap-2">
        <div className="font-display text-[26px] font-bold leading-none text-ink tnum sm:text-3xl">{value}</div>
        {spark && (
          <div className="shrink-0">
            <MiniSpark data={spark} color={color} />
          </div>
        )}
      </div>
    </div>
  )
}

/** Barra horizontal com rótulo, valor e trilho */
export function BarStat({
  label,
  value,
  max,
  color,
  suffix,
  leading,
  display,
}: {
  label: string
  value: number
  max: number
  color: string
  suffix?: string
  leading?: React.ReactNode
  /** sobrepõe o número exibido (ex.: moeda); a barra continua usando `value` */
  display?: string
}) {
  const pctW = max > 0 ? Math.max((value / max) * 100, 2) : 0
  return (
    <div className="flex items-center gap-3">
      {leading}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center justify-between text-sm">
          <span className="truncate font-medium text-ink">{label}</span>
          <span className="ml-2 shrink-0 font-semibold text-ink-sub tnum">
            {display ?? value.toLocaleString('pt-BR')}
            {suffix}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-overlay-2">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pctW}%`, background: `linear-gradient(90deg, ${color}, ${color}bb)` }}
          />
        </div>
      </div>
    </div>
  )
}

export function PageTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink sm:text-[28px]">{title}</h1>
      {sub && <p className="mt-1 text-sm text-ink-sub">{sub}</p>}
    </div>
  )
}
