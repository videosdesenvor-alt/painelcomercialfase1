import { useMemo, useState, useEffect } from 'react'
import { Trophy, Wallet, Target, Flame, TrendingUp, UserPlus, X, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { useData, useUI } from '../lib/store'
import { porVendedor, computeKpis, type VendedorAgg } from '../lib/analytics'
import { money, moneyShort, num, pct, cn, vendedorColor } from '../lib/utils'
import { Avatar } from '../components/Avatar'
import { PageTitle, CardHead } from '../components/Kit'

function StatPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-xl border border-hair bg-overlay px-3 py-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-ink-mute">{label}</div>
      {/* sem cor explícita usa o token — cor fixa some no tema claro */}
      <div className="mt-0.5 font-display text-lg font-bold text-ink tnum" style={color ? { color } : undefined}>
        {value}
      </div>
    </div>
  )
}

function VendedorCard({
  v,
  rank,
  maxReceita,
  onEdit,
  onDelete,
}: {
  v: VendedorAgg
  rank: number
  maxReceita: number
  onEdit: () => void
  onDelete: () => void
}) {
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
      <div className="mt-4 flex h-2 overflow-hidden rounded-full bg-overlay-2">
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
        <StatPill label="Conversão" value={pct(v.conversao)} color={v.conversao >= 50 ? '#34D399' : undefined} />
        <StatPill label="Em aberto" value={moneyShort(v.emAberto)} />
        <StatPill label="Ticket" value={v.ganhos ? moneyShort(Math.round(v.receita / v.ganhos)) : '—'} />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <button
          onClick={() => {
            setFiltro({ vendedor: v.nome, search: '', estado: 'all', status: 'all', campanha: 'all' })
            setPage('leads')
          }}
          className="btn-ghost min-w-0 flex-1 justify-center py-2 text-xs"
        >
          <span className="truncate">Ver leads de {v.nome.split(' ')[0]}</span>
        </button>
        <button
          onClick={onEdit}
          className="btn-ghost shrink-0 !px-2.5 py-2"
          title={`Editar ${v.nome}`}
          aria-label={`Editar ${v.nome}`}
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={onDelete}
          className="btn-ghost shrink-0 !px-2.5 py-2 hover:!border-danger/40 hover:!text-danger"
          title={`Remover ${v.nome}`}
          aria-label={`Remover ${v.nome}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

/** Casca comum dos modais da Equipe (overlay + Esc + cabeçalho). */
function ModalShell({
  icon,
  tone = 'ember',
  titulo,
  sub,
  onClose,
  children,
}: {
  icon: React.ReactNode
  tone?: 'ember' | 'danger'
  titulo: string
  sub: string
  onClose: () => void
  children: React.ReactNode
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md animate-fade-up rounded-t-3xl border border-hair bg-surface p-6 shadow-lift sm:rounded-3xl">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'grid h-11 w-11 shrink-0 place-items-center rounded-xl',
                tone === 'danger' ? 'bg-danger/15 text-danger' : 'bg-ember/15 text-ember',
              )}
            >
              {icon}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-ink">{titulo}</h2>
              <p className="text-xs text-ink-mute">{sub}</p>
            </div>
          </div>
          <button onClick={onClose} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-hair text-ink-sub hover:text-ink" aria-label="Fechar">
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

/** Cadastra um vendedor novo ou renomeia um existente. */
function VendedorModal({ editando, onClose }: { editando: string | null; onClose: () => void }) {
  const addVendedor = useData((s) => s.addVendedor)
  const renameVendedor = useData((s) => s.renameVendedor)
  const { notify, filtros, setFiltro } = useUI()
  const [nome, setNome] = useState(editando ?? '')

  function save() {
    const n = nome.trim()
    if (!n) return notify('Informe o nome do vendedor', 'danger')

    if (editando) {
      if (!renameVendedor(editando, n)) return notify('Já existe um vendedor com esse nome', 'danger')
      // O filtro guarda o nome antigo — sem isso a lista de leads fica vazia.
      if (filtros.vendedor === editando) setFiltro({ vendedor: n })
      notify(n === editando ? 'Nada mudou' : `"${editando}" agora é "${n}"`)
    } else {
      if (!addVendedor(n)) return notify('Esse vendedor já existe', 'danger')
      notify(`Vendedor "${n}" cadastrado`)
    }
    onClose()
  }

  return (
    <ModalShell
      icon={editando ? <Pencil size={19} /> : <UserPlus size={20} />}
      titulo={editando ? 'Editar vendedor' : 'Novo vendedor'}
      sub={editando ? 'O nome muda em todos os leads dele' : 'Adicione um membro à equipe comercial'}
      onClose={onClose}
    >
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
        <button onClick={save} className="btn-ember">{editando ? 'Salvar' : 'Cadastrar'}</button>
      </div>
    </ModalShell>
  )
}

/** Remove um vendedor. Se ele tem leads, exige para quem reatribuir. */
function RemoverVendedorModal({ nome, onClose }: { nome: string; onClose: () => void }) {
  const leads = useData((s) => s.leads)
  const vendedores = useData((s) => s.vendedores)
  const deleteVendedor = useData((s) => s.deleteVendedor)
  const { notify, filtros, clearFiltros } = useUI()

  const qtd = useMemo(() => leads.filter((l) => l.responsavel === nome).length, [leads, nome])
  const outros = useMemo(() => vendedores.filter((v) => v !== nome), [vendedores, nome])
  const [destino, setDestino] = useState(outros[0] ?? '')
  const bloqueado = qtd > 0 && outros.length === 0

  function confirmar() {
    if (bloqueado) return
    if (!deleteVendedor(nome, qtd > 0 ? destino : undefined)) {
      return notify('Não foi possível remover o vendedor', 'danger')
    }
    if (filtros.vendedor === nome) clearFiltros()
    notify(qtd > 0 ? `"${nome}" removido · ${qtd} leads para ${destino}` : `"${nome}" removido`)
    onClose()
  }

  return (
    <ModalShell
      icon={<Trash2 size={19} />}
      tone="danger"
      titulo={`Remover ${nome}?`}
      sub="O vendedor sai da equipe e dos filtros"
      onClose={onClose}
    >
      {bloqueado ? (
        <div className="mt-5 flex gap-3 rounded-xl border border-danger/30 bg-danger/10 p-3.5">
          <AlertTriangle size={17} className="mt-0.5 shrink-0 text-danger" />
          <p className="text-xs text-ink-sub">
            {nome} tem <strong className="text-ink">{num(qtd)} leads</strong> e é o único vendedor da
            equipe. Cadastre outro vendedor antes de remover, senão os leads ficariam sem dono.
          </p>
        </div>
      ) : qtd > 0 ? (
        <>
          <div className="mt-5 flex gap-3 rounded-xl border border-hair bg-overlay p-3.5">
            <AlertTriangle size={17} className="mt-0.5 shrink-0 text-ember" />
            <p className="text-xs text-ink-sub">
              {nome} tem <strong className="text-ink">{num(qtd)} leads</strong> sob responsabilidade.
              Escolha quem assume — nenhum lead é apagado.
            </p>
          </div>
          <label className="mt-4 block">
            <span className="label">Reatribuir os leads para</span>
            <select className="input" value={destino} onChange={(e) => setDestino(e.target.value)} autoFocus>
              {outros.map((v) => (
                <option key={v} value={v}>{v}</option>
              ))}
            </select>
          </label>
        </>
      ) : (
        <p className="mt-5 text-sm text-ink-sub">
          {nome} não tem nenhum lead sob responsabilidade. Pode remover sem impacto.
        </p>
      )}

      <div className="mt-6 flex items-center justify-end gap-3">
        <button onClick={onClose} className="btn-ghost">Cancelar</button>
        {!bloqueado && (
          <button
            onClick={confirmar}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-all duration-200 hover:brightness-110"
          >
            <Trash2 size={15} /> Remover
          </button>
        )}
      </div>
    </ModalShell>
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
  // null = fechado; '' = cadastrando; 'Nome' = editando
  const [editorNome, setEditorNome] = useState<string | null>(null)
  const [removendo, setRemovendo] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <PageTitle title="Equipe comercial" sub="Desempenho individual dos vendedores" />
        <button onClick={() => setEditorNome('')} className="btn-ember self-start sm:self-auto">
          <UserPlus size={16} strokeWidth={2.4} /> Cadastrar vendedor
        </button>
      </div>

      {editorNome !== null && (
        <VendedorModal editando={editorNome || null} onClose={() => setEditorNome(null)} />
      )}
      {removendo && <RemoverVendedorModal nome={removendo} onClose={() => setRemovendo(null)} />}

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
          <VendedorCard
            key={v.nome}
            v={v}
            rank={i}
            maxReceita={maxReceita}
            onEdit={() => setEditorNome(v.nome)}
            onDelete={() => setRemovendo(v.nome)}
          />
        ))}
      </div>
    </div>
  )
}
