import { Moon, Sun } from 'lucide-react'
import { Toggle } from './ui/toggle'
import { useData } from '@/lib/store'

/** Alterna entre tema claro e escuro (persistido no store). */
export function ThemeToggle() {
  const tema = useData((s) => s.tema)
  const toggleTema = useData((s) => s.toggleTema)
  const dark = tema === 'dark'

  return (
    <Toggle
      variant="outline"
      pressed={dark}
      onPressedChange={toggleTema}
      aria-label={`Mudar para tema ${dark ? 'claro' : 'escuro'}`}
      title={`Mudar para tema ${dark ? 'claro' : 'escuro'}`}
      className="group relative size-11 shrink-0 p-0 data-[state=on]:bg-overlay"
    >
      <Moon
        size={18}
        strokeWidth={2}
        className="shrink-0 scale-0 opacity-0 transition-all group-data-[state=on]:scale-100 group-data-[state=on]:opacity-100"
        aria-hidden="true"
      />
      <Sun
        size={18}
        strokeWidth={2}
        className="absolute shrink-0 scale-100 opacity-100 transition-all group-data-[state=on]:scale-0 group-data-[state=on]:opacity-0"
        aria-hidden="true"
      />
    </Toggle>
  )
}
