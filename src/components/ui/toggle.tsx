import * as React from 'react'
import * as TogglePrimitive from '@radix-ui/react-toggle'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

/**
 * Toggle (Radix) adaptado à identidade Desenvor.
 * O original usa tokens do shadcn (bg-muted, text-accent-foreground,
 * ring-ring, border-input…) que não existem neste projeto — aqui eles
 * foram mapeados para os nossos (overlay, hair, ink, ember).
 */
const toggleVariants = cva(
  'inline-flex items-center justify-center rounded-xl text-sm font-medium transition-colors hover:bg-overlay-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember/60 focus-visible:ring-offset-2 focus-visible:ring-offset-base disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-overlay-2 data-[state=on]:text-ink',
  {
    variants: {
      variant: {
        default: 'bg-transparent text-ink-sub',
        outline: 'border border-hair bg-overlay text-ink-sub hover:border-hair-strong',
      },
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-2.5',
        lg: 'h-11 px-5',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & VariantProps<typeof toggleVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TogglePrimitive.Root ref={ref} className={cn(toggleVariants({ variant, size, className }))} {...props} />
))

Toggle.displayName = TogglePrimitive.Root.displayName

export { Toggle, toggleVariants }
