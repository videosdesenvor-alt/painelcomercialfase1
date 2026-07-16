import { useEffect, useMemo, useRef, useState } from 'react'
import { Bell, CalendarClock, Clock, PauseCircle, CheckCircle2 } from 'lucide-react'
import { useData, useUI } from '../lib/store'
import { alertas, type Alerta, type AlertaTipo } from '../lib/analytics'
import { moneyShort, cn } from '../lib/utils'

const TIPO: Record<AlertaTipo, { icon: typeof Clock; cor: string; titulo: string }> = {
  atrasado: { icon: Clock, cor: '#F5544F', titulo: 'Follow-up atrasado' },
  hoje: { icon: CalendarClock, cor: '#FD4E17', titulo: 'Follow-up hoje' },
  parado: { icon: PauseCircle, cor: '#FBBF24', titulo: 'Negociação parada' },
}

function detalhe(a: Alerta): string {
  if (a.tipo === 'atrasado') return `${a.dias} dia${a.dias === 1 ? '' : 's'} de atraso`
  if (a.tipo === 'hoje') return 'Vence hoje'
  return `Sem contato há ${a.dias} dias`
}

function Item({ a, onClick }: { a: Alerta; onClick: () => void }) {
  const { icon: Icon, cor } = TIPO[a.tipo]
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-overlay"
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: cor + '1f', color: cor }}>
        <Icon size={15} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[13px] font-semibold text-ink">{a.cliente}</div>
        <div className="truncate text-[11px] text-ink-mute">
          {detalhe(a)} · {a.responsavel}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-xs font-semibold text-ink-sub tnum">{moneyShort(a.valor)}</div>
      </div>
    </button>
  )
}

export function Notificacoes() {
  const leads = useData((s) => s.leads)
  const { openDetail, setFiltro, setPage } = useUI()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const lista = useMemo(() => alertas(leads), [leads])
  const total = lista.length
  const atrasados = lista.filter((a) => a.tipo === 'atrasado').length

  // Fecha ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const grupos: { tipo: AlertaTipo; itens: Alerta[] }[] = (['atrasado', 'hoje', 'parado'] as const)
    .map((tipo) => ({ tipo, itens: lista.filter((a) => a.tipo === tipo) }))
    .filter((g) => g.itens.length > 0)

  return (
    <div className="relative shrink-0" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'relative grid h-11 w-11 place-items-center rounded-xl border border-hair bg-overlay text-ink-sub transition-colors hover:text-ink',
          open && 'border-hair-strong text-ink',
        )}
        aria-label={total ? `Notificações: ${total} pendência${total === 1 ? '' : 's'}` : 'Notificações'}
        aria-expanded={open}
        title="Notificações"
      >
        <Bell size={18} />
        {total > 0 && (
          <span
            className={cn(
              'absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full px-1 text-[10px] font-bold text-white tnum',
              atrasados > 0 ? 'bg-danger' : 'bg-ember',
            )}
            style={{ boxShadow: '0 0 0 2px rgb(var(--base))' }}
          >
            {total > 99 ? '99+' : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-[min(92vw,380px)] animate-fade-up overflow-hidden rounded-2xl border border-hair bg-surface shadow-lift">
          <div className="flex items-center justify-between border-b border-hair px-4 py-3">
            <div>
              <div className="font-display text-sm font-bold text-ink">Notificações</div>
              <div className="text-[11px] text-ink-mute">
                {total === 0 ? 'Nada pendente' : `${total} pendência${total === 1 ? '' : 's'} no funil`}
              </div>
            </div>
            {atrasados > 0 && (
              <span className="rounded-lg bg-danger/15 px-2 py-1 text-[10px] font-bold text-danger tnum">
                {atrasados} atrasado{atrasados === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {total === 0 ? (
            <div className="grid place-items-center px-6 py-10 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-positive/15 text-positive">
                <CheckCircle2 size={22} />
              </div>
              <div className="mt-3 text-sm font-semibold text-ink">Tudo em dia</div>
              <p className="mt-1 text-xs text-ink-mute">Nenhum follow-up atrasado ou negociação parada.</p>
            </div>
          ) : (
            <>
              <div className="max-h-[min(60vh,420px)] overflow-y-auto p-1.5">
                {grupos.map((g) => (
                  <div key={g.tipo}>
                    <div className="px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wider text-ink-mute">
                      {TIPO[g.tipo].titulo} · {g.itens.length}
                    </div>
                    {g.itens.slice(0, 6).map((a) => (
                      <Item
                        key={a.leadId}
                        a={a}
                        onClick={() => {
                          openDetail(a.leadId)
                          setOpen(false)
                        }}
                      />
                    ))}
                    {g.itens.length > 6 && (
                      <div className="px-2.5 pb-1 text-[11px] text-ink-mute">
                        + {g.itens.length - 6} em {TIPO[g.tipo].titulo.toLowerCase()}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-hair p-2">
                <button
                  onClick={() => {
                    setFiltro({ search: '', estado: 'all', vendedor: 'all', status: 'all', campanha: 'all' })
                    setPage('leads')
                    setOpen(false)
                  }}
                  className="w-full rounded-lg py-2 text-xs font-semibold text-ink-sub transition-colors hover:bg-overlay hover:text-ink"
                >
                  Ver todos os leads
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
