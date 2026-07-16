import { useMemo, useState } from 'react'
import { Plus, Pencil, Trash2, Megaphone, TrendingUp } from 'lucide-react'
import { useData, useUI } from '../lib/store'
import { computeTrafego } from '../lib/analytics'
import type { TrafegoEntry } from '../lib/types'
import { moneyCents, moneyShort, dec2, num, pct, cn } from '../lib/utils'
import { PageTitle } from '../components/Kit'
import { Donut } from '../components/charts/Donut'
import { TrafegoEditor } from '../components/TrafegoEditor'

const CANAL_COLORS = ['#FD4E17', '#FF2D7E', '#38BDF8', '#8B5CF6', '#34D399', '#FBBF24']
const canalColor = (i: number) => CANAL_COLORS[i % CANAL_COLORS.length]

function KpiBig({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-mute">{label}</div>
      <div className={cn('mt-1.5 font-display text-2xl font-bold tnum sm:text-[27px]', accent ? 'text-ember' : 'text-ink')}>
        {value}
      </div>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hair bg-overlay px-3 py-2">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">{label}</div>
      <div className="mt-0.5 font-display text-sm font-bold text-ink tnum">{value}</div>
    </div>
  )
}

export function Trafego() {
  const trafego = useData((s) => s.trafego)
  const deleteTrafego = useData((s) => s.deleteTrafego)
  const notify = useUI((s) => s.notify)
  const k = useMemo(() => computeTrafego(trafego), [trafego])
  const [tab, setTab] = useState<'gerais' | 'indicadores'>('gerais')
  const [editing, setEditing] = useState<TrafegoEntry | null | undefined>(undefined) // undefined = fechado

  const gerais = [
    { label: 'Faturado', value: moneyCents(k.faturado) },
    { label: 'Investido', value: moneyCents(k.investido) },
    { label: 'Ticket Médio', value: moneyCents(k.ticket) },
    { label: 'CAC', value: moneyCents(k.cac) },
    { label: 'C/Lead', value: moneyCents(k.cLead) },
    { label: 'ROAS', value: `${dec2(k.roas)}×`, accent: true },
  ]
  const indicadores = [
    { label: 'Total de Leads', value: num(k.leads) },
    { label: 'Total de Vendas', value: num(k.vendas) },
    { label: 'Conversão (lead→venda)', value: pct(k.conversao, 2) },
    { label: 'Receita / Lead', value: moneyCents(k.receitaPorLead) },
    { label: 'Lucro Bruto', value: moneyCents(k.lucro) },
    { label: 'ROI', value: `${dec2(k.roi)}×`, accent: true },
  ]
  const items = tab === 'gerais' ? gerais : indicadores

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle title="Tráfego" sub="Investimento em anúncios e resultados consolidados" />
        <button onClick={() => setEditing(null)} className="btn-ember self-start sm:self-auto">
          <Plus size={16} strokeWidth={2.5} /> Adicionar canal
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* ── Resultados (com abas) ── */}
        <div className="panel p-5 lg:col-span-2">
          <div className="mb-5 flex items-center gap-6 border-b border-hair">
            {([['gerais', 'Resultados Gerais'], ['indicadores', 'Principais Indicadores']] as const).map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  'relative -mb-px pb-3 text-sm font-bold uppercase tracking-wider transition-colors',
                  tab === id ? 'text-ember' : 'text-ink-mute hover:text-ink-sub',
                )}
              >
                {label}
                {tab === id && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-ember shadow-[0_0_10px_1px_rgba(253,78,23,0.7)]" />}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-7 py-1 sm:gap-y-8">
            {items.map((m) => (
              <KpiBig key={m.label} label={m.label} value={m.value} accent={'accent' in m ? m.accent : false} />
            ))}
          </div>
        </div>

        {/* ── Investido por canal ── */}
        <div className="panel flex flex-col p-5">
          <div className="mb-2 flex items-center gap-2">
            <TrendingUp size={16} className="text-ember" />
            <span className="text-[13px] font-bold text-ink">Investido por canal</span>
          </div>
          {trafego.length > 0 ? (
            <>
              <div className="grid place-items-center py-2">
                <Donut
                  size={168}
                  thickness={17}
                  segments={trafego.map((t, i) => ({ value: t.investido, color: canalColor(i), label: t.canal }))}
                  centerTop="Investido"
                  centerMain={moneyShort(k.investido)}
                  centerSub={`ROAS ${dec2(k.roas)}×`}
                />
              </div>
              <div className="mt-3 space-y-2">
                {trafego.map((t, i) => (
                  <div key={t.id} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: canalColor(i) }} />
                    <span className="text-ink-sub">{t.canal}</span>
                    <span className="ml-auto font-semibold text-ink tnum">{moneyShort(t.investido)}</span>
                    <span className="w-14 text-right font-semibold text-positive tnum">
                      {t.investido ? dec2(t.faturado / t.investido) : '0'}×
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="grid flex-1 place-items-center py-10 text-center text-sm text-ink-mute">
              Nenhum canal cadastrado ainda.
            </div>
          )}
        </div>
      </div>

      {/* ── Canais (entrada de dados) ── */}
      <div className="panel p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Megaphone size={16} className="text-ember" />
            <h3 className="font-display text-[15px] font-bold text-ink">Canais de tráfego</h3>
          </div>
          <span className="chip">{trafego.length} {trafego.length === 1 ? 'canal' : 'canais'}</span>
        </div>

        <div className="space-y-3">
          {trafego.map((t, i) => {
            const roas = t.investido ? t.faturado / t.investido : 0
            return (
              <div key={t.id} className="rounded-xl border border-hair bg-overlay p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="h-3 w-3 rounded-full" style={{ background: canalColor(i) }} />
                    <span className="font-display font-bold text-ink">{t.canal}</span>
                    <span className="rounded-md bg-positive/12 px-1.5 py-0.5 text-[11px] font-bold text-positive tnum">
                      ROAS {dec2(roas)}×
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setEditing(t)} className="grid h-8 w-8 place-items-center rounded-lg border border-hair text-ink-sub hover:text-ink" aria-label="Editar">
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => {
                        deleteTrafego(t.id)
                        notify(`Canal "${t.canal}" removido`, 'danger')
                      }}
                      className="grid h-8 w-8 place-items-center rounded-lg border border-danger/30 text-danger hover:bg-danger/10"
                      aria-label="Excluir"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <MiniStat label="Investido" value={moneyCents(t.investido)} />
                  <MiniStat label="Faturado" value={moneyCents(t.faturado)} />
                  <MiniStat label="Leads" value={num(t.leads)} />
                  <MiniStat label="Vendas" value={num(t.vendas)} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {editing !== undefined && <TrafegoEditor entry={editing} onClose={() => setEditing(undefined)} />}
    </div>
  )
}
