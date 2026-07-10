import { useState } from 'react'
import { BRAND } from '../lib/brand'
import { cn } from '../lib/utils'

/**
 * Logo da marca. Ordem: SVG → PNG → monograma.
 * Troque os arquivos em `public/logo.svg` / `public/logo.png`.
 */
export function Logo({
  size = 40,
  rounded = 'rounded-xl',
  className,
}: {
  size?: number
  rounded?: string
  className?: string
}) {
  const sources = [BRAND.logo, BRAND.logoFallback].filter(Boolean) as string[]
  const [idx, setIdx] = useState(0)
  const src = sources[idx]

  if (src) {
    return (
      <img
        src={src}
        alt={BRAND.name}
        onError={() => setIdx((i) => i + 1)}
        className={cn('object-contain', rounded, className)}
        style={{ width: size, height: size }}
      />
    )
  }

  // Fallback: monograma com gradiente da marca
  return (
    <span
      className={cn('grid shrink-0 place-items-center bg-gradient-to-br from-ember-glow to-ember-deep shadow-glow', rounded, className)}
      style={{ width: size, height: size }}
    >
      <span className="font-display font-bold leading-none text-white" style={{ fontSize: size * 0.46 }}>
        {BRAND.name.charAt(0)}
      </span>
    </span>
  )
}
