import { useEffect, useState } from 'react'
import { X, ChevronDown, Megaphone } from 'lucide-react'
import { useData, useUI } from '../lib/store'
import { CANAIS_TRAFEGO, type TrafegoEntry } from '../lib/types'

function parseNum(v: string): number {
  return Number(v.replace(/\s/g, '').replace(/\./g, '').replace(',', '.')) || 0
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[10px] text-ink-mute">{hint}</span>}
    </label>
  )
}

export function TrafegoEditor({ entry, onClose }: { entry: TrafegoEntry | null; onClose: () => void }) {
  const { addTrafego, updateTrafego } = useData()
  const notify = useUI((s) => s.notify)
  const [f, setF] = useState({
    canal: entry?.canal ?? CANAIS_TRAFEGO[0],
    investido: entry ? String(entry.investido) : '',
    faturado: entry ? String(entry.faturado) : '',
    leads: entry ? String(entry.leads) : '',
    vendas: entry ? String(entry.vendas) : '',
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = (patch: Partial<typeof f>) => setF((p) => ({ ...p, ...patch }))

  function save() {
    const payload = {
      canal: f.canal,
      investido: parseNum(f.investido),
      faturado: parseNum(f.faturado),
      leads: Math.round(parseNum(f.leads)),
      vendas: Math.round(parseNum(f.vendas)),
    }
    if (entry) {
      updateTrafego(entry.id, payload)
      notify('Canal atualizado')
    } else {
      addTrafego(payload)
      notify('Canal de tráfego adicionado')
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg animate-fade-up rounded-t-3xl border border-hair bg-surface p-6 shadow-lift sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-ember/15 text-ember">
              <Megaphone size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">
                {entry ? 'Editar canal' : 'Adicionar canal de tráfego'}
              </h2>
              <p className="text-xs text-ink-mute">Investimento e resultados da fonte</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-hair text-ink-sub hover:text-ink" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Canal / Fonte">
              <div className="relative">
                <select value={f.canal} onChange={(e) => set({ canal: e.target.value })} className="input appearance-none pr-9">
                  {CANAIS_TRAFEGO.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-mute" />
              </div>
            </Field>
          </div>

          <Field label="Investido (R$)" hint="Verba gasta em anúncios">
            <input className="input tnum" value={f.investido} onChange={(e) => set({ investido: e.target.value })} placeholder="12.400,00" inputMode="decimal" autoFocus />
          </Field>
          <Field label="Faturado (R$)" hint="Receita gerada">
            <input className="input tnum" value={f.faturado} onChange={(e) => set({ faturado: e.target.value })} placeholder="268.000,00" inputMode="decimal" />
          </Field>
          <Field label="Leads" hint="Contatos gerados">
            <input className="input tnum" value={f.leads} onChange={(e) => set({ leads: e.target.value })} placeholder="980" inputMode="numeric" />
          </Field>
          <Field label="Vendas" hint="Clientes fechados">
            <input className="input tnum" value={f.vendas} onChange={(e) => set({ vendas: e.target.value })} placeholder="190" inputMode="numeric" />
          </Field>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button onClick={save} className="btn-ember">{entry ? 'Salvar' : 'Adicionar'}</button>
        </div>
      </div>
    </div>
  )
}
