import { Search, Plus, Bell, Command } from 'lucide-react'
import { useUI } from '../lib/store'
import { Avatar } from './Avatar'
import { Logo } from './Logo'

const HOJE = new Date().toLocaleDateString('pt-BR', {
  weekday: 'long',
  day: '2-digit',
  month: 'long',
})

export function Topbar() {
  const { openEditor, setPage, setFiltro, filtros } = useUI()

  return (
    <header className="sticky top-0 z-20 border-b border-hair bg-base/70 backdrop-blur-xl">
      <div className="flex h-[68px] items-center gap-3 px-4 sm:px-6">
        {/* Marca mobile */}
        <div className="flex items-center gap-2 lg:hidden">
          <Logo size={36} rounded="rounded-lg" />
        </div>

        {/* Saudação */}
        <div className="hidden min-w-0 md:block">
          <div className="truncate font-display text-[15px] font-bold text-ink">
            Olá, Elison <span className="text-ember">·</span> vamos vender hoje
          </div>
          <div className="text-xs capitalize text-ink-mute">{HOJE}</div>
        </div>

        {/* Busca */}
        <div className="relative ml-auto w-full max-w-md">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
          <input
            value={filtros.search}
            onChange={(e) => {
              setFiltro({ search: e.target.value })
              setPage('leads')
            }}
            placeholder="Buscar cliente, cidade, telefone…"
            className="input pl-10 pr-16"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded-md border border-hair px-1.5 py-0.5 text-[10px] text-ink-mute sm:flex">
            <Command size={10} /> K
          </span>
        </div>

        {/* Ações */}
        <button
          className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-hair bg-white/[0.02] text-ink-sub transition-colors hover:text-ink"
          aria-label="Notificações"
        >
          <Bell size={18} />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-ember shadow-[0_0_8px_2px_rgba(255,76,36,0.8)]" />
        </button>

        <button onClick={() => openEditor(null)} className="btn-ember shrink-0 whitespace-nowrap">
          <Plus size={17} strokeWidth={2.5} />
          <span className="hidden sm:inline">Novo lead</span>
        </button>

        <div className="hidden items-center gap-2.5 rounded-xl border border-hair bg-white/[0.02] py-1.5 pl-1.5 pr-3 sm:flex">
          <Avatar name="Elison Melo" size="sm" />
          <div className="leading-tight">
            <div className="text-xs font-semibold text-ink">Elison Melo</div>
            <div className="text-[10px] text-ink-mute">Gestor comercial</div>
          </div>
        </div>
      </div>
    </header>
  )
}
