import { cn } from '../lib/utils'

/**
 * "Imagem" colorida de fundo (mesh gradient + grão), no estilo da referência.
 * Fica atrás dos cards de vidro do topo. 100% CSS — sem asset externo.
 */
export function MeshBanner({ className, height = 300 }: { className?: string; height?: number }) {
  return (
    <div
      className={cn('pointer-events-none absolute inset-x-0 top-0 overflow-hidden', className)}
      style={{ height }}
      aria-hidden
    >
      {/* camada de cor */}
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: '#141019',
          backgroundImage: [
            'radial-gradient(60% 120% at 88% 18%, rgba(255,86,36,0.95), transparent 60%)',
            'radial-gradient(50% 100% at 100% 55%, rgba(255,45,126,0.85), transparent 60%)',
            'radial-gradient(45% 90% at 72% 4%, rgba(255,176,32,0.75), transparent 55%)',
            'radial-gradient(55% 120% at 12% 26%, rgba(18,184,166,0.55), transparent 60%)',
            'radial-gradient(50% 110% at 36% 0%, rgba(124,58,237,0.45), transparent 55%)',
            'radial-gradient(70% 140% at 50% 120%, rgba(11,11,12,0.9), transparent 60%)',
          ].join(','),
          filter: 'saturate(1.15)',
        }}
      />
      {/* grão */}
      <div
        className="absolute inset-0 opacity-[0.18] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      {/* leve blur/brilho */}
      <div className="absolute inset-0 backdrop-blur-[2px]" />
      {/* fade para o fundo base */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, rgba(11,11,12,0) 30%, rgba(11,11,12,0.55) 72%, #0B0B0C 100%)',
        }}
      />
    </div>
  )
}
