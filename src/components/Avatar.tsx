import { initials, vendedorColor, cn } from '../lib/utils'

export function Avatar({
  name,
  size = 'md',
  ring = true,
}: {
  name: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  ring?: boolean
}) {
  const c = vendedorColor(name)
  const dim = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-9 w-9 text-[13px]',
    lg: 'h-12 w-12 text-base',
  }[size]
  return (
    <span
      className={cn('inline-grid place-items-center rounded-full font-bold text-white shrink-0', dim)}
      style={{
        background: `linear-gradient(150deg, ${c}, ${c}bb)`,
        boxShadow: ring ? `0 0 0 2px ${c}33` : undefined,
      }}
      title={name}
    >
      {initials(name)}
    </span>
  )
}
