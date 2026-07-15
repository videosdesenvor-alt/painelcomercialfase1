import { useMemo, useState, useEffect } from 'react'
import { Trophy, Wallet, Target, Flame, TrendingUp, UserPlus, X } from 'lucide-react'
import { useData, useUI } from '../lib/store'
import { porVendedor, computeKpis, type VendedorAgg } from '../lib/analytics'
import { money, moneyShort, num, pct, cn, vendedorColor } from '../lib/utils'
import { Avatar } from '../components/Avatar'
import { PageTitle, CardHead } from '../components/Kit'

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-hair bg-white/[0.02] px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">{label}</div>
      <div className="mt-0.5 font-display text-lg font-bold tnum" style={{ color: color ?? '#F5F6FA' }}>
        {value}
      </div>
    </div>
  )
}

function VendedorCard({ v, rank, maxReceita }: { v: VendedorAgg; rank: number; maxReceita: number }) {
  const { setFiltro, setPage } = useUI()
  const c = vendedorColor(v.nome)
  const total = v.ativos + v.ganhos + v.perdidos || 1
  const top = rank === 0

  return (
    <div className={cn('panel panel-hover relative overflow-hidden p-5', top && 'ring-1 ring-ember/25')}>
      {top && <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-ember/20 blur-3xl" />}
      <div className="relative flex items-center gap-3">
        <Avatar name={v.nome} size="lg" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate font-display text-base font-bold text-ink">{v.nome}</span>
            {top && (
              <span className="inline-flex items-center gap-1 rounded-md bg-ember/15 px-1.5 py-0.5 text-[10px] font-bold text-ember">
                <Trophy size={11} /> TOP
              </span>
            )}
          </div>
          <div className="text-xs text-ink-mute">{num(v.total)} leads sob responsabilidade</div>
        </div>
        <div className="text-right">
          <div className="font-display text-xl font-bold text-ink tnum">{moneyShort(v.receita)}</div>
          <div className="text-[10px] text-ink-mute">receita</div>
        </div>
      </div>

      {/* barra composição */}
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-white/[0.05]">
        <div style={{ width: `${(v.ativos / total) * 100}%`, background: '#FF7A21' }} title={`Ativos: ${v.ativos}`} />
        <div style={{ width: `${(v.ganhos / total) * 100}%`, background: '#34D399' }} title={`Ganhos: ${v.ganhos}`} />
        <div style={{ width: `${(v.perdidos / total) * 100}%`, background: '#F5544F' }} title={`Perdidos: ${v.perdidos}`} />
      </div>
      <div className="mt-2 flex items-center gap-3 text-[11px] text-ink-mute">
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: '#FF7A21' }} />{v.ativos} ativos</span>
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: '#34D399' }} />{v.ganhos} ganhos</span>
        <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: '#F5544F' }} />{v.perdidos} perdidos</span>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        <StatPill label="Conversão" value={pct(v.conversao)} color={v.conversao >= 50 ? '#34D399' : '#F5F6FA'} />
        <StatPill label="Em aberto" value={moneyShort(v.emAberto)} />
        <StatPill label="Ticket" value={v.ganhos ? moneyShort(Math.round(v.receita / v.ganhos)) : '—'} />
      </div>

      <button
        onClick={() => {
          setFiltro({ vendedor: v.nome, search: '', estado: 'all', status: 'all', campanha: 'all' })
          setPage('leads')
        }}
        className="btn-ghost mt-4 w-full justify-center py-2 text-xs"
      >
        Ver leads de {v.nome.split(' ')[0]}
      </button>
    </div>
  )
}

function AddVendedorModal({ onClose }: { onClose: () => void }) {
  const addVendedor = useData((s) => s.addVendedor)
  const notify = useUI((s) => s.notify)
  const [nome, setNome] = useState('')

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function save() {
    const n = nome.trim()
    if (!n) return notify('Informe o nome do vendedor', 'danger')
    if (addVendedor(n)) {
      notify(`Vendedor "${n}" cadastrado`)
      onClose()
    } else {
      notify('Esse vendedor já existe', 'danger')
    }
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md animate-fade-up rounded-t-3xl border border-hair bg-surface p-6 shadow-lift sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-ember/15 text-ember">
              <UserPlus size={20} />
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">Novo vendedor</h2>
              <p className="text-xs text-ink-mute">Adicione um membro à equipe comercial</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-lg border border-hair text-ink-sub hover:text-ink" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>

        <label className="mt-5 block">
          <span className="label">Nome do vendedor</span>
          <input
            className="input"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && save()}
            placeholder="Ex.: João Pedro"
            autoFocus
          />
        </label>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button onClick={onClose} className="btn-ghost">Cancelar</button>
          <button onClick={save} className="btn-ember">Cadastrar</button>
        </div>
      </div>
    </div>
  )
}

export function Equipe() {
  const leads = useData((s) => s.leads)
  const vendedoresList = useData((s) => s.vendedores)
  const vendedores = useMemo(() => porVendedor(leads, vendedoresList), [leads, vendedoresList])
  const k = useMemo(() => computeKpis(leads), [leads])
  const maxReceita = Math.max(...vendedores.map((v) => v.receita), 1)
  const comDecisao = vendedores.filter((v) => v.ganhos + v.perdidos > 0)
  const convMedia = comDecisao.length
    ? comDecisao.reduce((a, v) => a + v.conversao, 0) / comDecisao.length
    : 0
  const [addOpen, setAddOpen] = useState(false)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle title="Equipe comercial" sub="Desempenho individual dos vendedores" />
        <button onClick={() => setAddOpen(true)} className="btn-ember self-start sm:self-auto">
          <UserPlus size={16} strokeWidth={2.4} /> Cadastrar vendedor
        </button>
      </div>

      {addOpen && <AddVendedorModal onClose={() => setAddOpen(false)} />}

      {/* Resumo */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="panel flex items-center gap-3 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-ember/15 text-ember"><Wallet size={20} /></div>
          <div>
            <div className="font-display text-xl font-bold text-ink tnum">{moneyShort(k.receitaGanha)}</div>
            <div className="text-[11px] text-ink-mute">Receita da equipe</div>
          </div>
        </div>
        <div className="panel flex items-center gap-3 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-magenta/15 text-magenta"><TrendingUp size={20} /></div>
          <div>
            <div className="font-display text-xl font-bold text-ink tnum">{num(k.ativos)}</div>
            <div className="text-[11px] text-ink-mute">Negociações ativas</div>
          </div>
        </div>
        <div className="panel flex items-center gap-3 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-positive/15 text-positive"><Target size={20} /></div>
          <div>
            <div className="font-display text-xl font-bold text-ink tnum">{pct(convMedia)}</div>
            <div className="text-[11px] text-ink-mute">Conversão média</div>
          </div>
        </div>
        <div className="panel flex items-center gap-3 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan/15 text-cyan"><Flame size={20} /></div>
          <div>
            <div className="font-display text-xl font-bold text-ink tnum">{vendedores.length}</div>
            <div className="text-[11px] text-ink-mute">Vendedores ativos</div>
          </div>
        </div>
      </div>

      {/* Cards vendedores */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {vendedores.map((v, i) => (
          <VendedorCard key={v.nome} v={v} rank={i} maxReceita={maxReceita} />
        ))}
      </div>
    </div>
  )
}
