import { useEffect } from 'react'
import { CheckCircle2, Info, AlertTriangle } from 'lucide-react'
import { useUI } from '../lib/store'

export function Toast() {
  const toast = useUI((s) => s.toast)
  const set = useUI

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => set.setState({ toast: null }), 3200)
    return () => clearTimeout(t)
  }, [toast])

  if (!toast) return null
  const cfg = {
    ok: { Icon: CheckCircle2, color: '#34D399' },
    info: { Icon: Info, color: '#38BDF8' },
    danger: { Icon: AlertTriangle, color: '#F5544F' },
  }[toast.tone]
  const Icon = cfg.Icon

  return (
    <div
      className="fixed bottom-20 left-1/2 z-[80] -translate-x-1/2 lg:bottom-6"
      role="status"
      aria-live="polite"
    >
      <div
        key={toast.id}
        className="flex animate-fade-up items-center gap-2.5 rounded-xl border border-hair bg-elevated/95 px-4 py-3 text-sm font-medium text-ink shadow-lift backdrop-blur-xl"
        style={{ boxShadow: `0 0 0 1px ${cfg.color}22, 0 20px 50px -15px rgba(0,0,0,.8)` }}
      >
        <Icon size={18} style={{ color: cfg.color }} />
        {toast.msg}
      </div>
    </div>
  )
}
