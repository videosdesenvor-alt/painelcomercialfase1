import { STATUS, type StatusId } from '../lib/types'
import { cn } from '../lib/utils'

export function StatusBadge({
  status,
  size = 'md',
}: {
  status: StatusId
  size?: 'sm' | 'md'
}) {
  const m = STATUS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
      )}
      style={{
        color: m.color,
        borderColor: m.color + '33',
        background: m.color + '14',
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: m.color }} />
      {m.short}
    </span>
  )
}

export function Dot({ color }: { color: string }) {
  return <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
}
