import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Lead, NovoLead, StatusId, TrafegoLancamento, Perfil, Interacao } from './types'
import { VENDEDORES } from './types'
import { buildSeed, buildSeedLancamentos } from './seed'
import { supabaseConfigurado } from './supabase'
import * as db from './db'

const PERFIL_PADRAO: Perfil = {
  nome: 'Elison Melo',
  cargo: 'Gestor comercial',
  foto: null,
  empresa: 'Desenvor',
  logo: null,
}

/* ────────────────────────────────────────────────────────────
   Camada de dados. Com Supabase configurado: carrega do banco no
   login e grava cada alteração (write-through). Sem Supabase:
   seed no localStorage (comportamento antigo, para dev sem backend).
   A INTERFACE é idêntica nos dois modos — a UI não sabe a diferença.
   ──────────────────────────────────────────────────────────── */
export type Tema = 'light' | 'dark'

interface DataState {
  leads: Lead[]
  vendedores: string[]
  lancamentos: TrafegoLancamento[]
  perfil: Perfil
  tema: Tema
  /** true quando os dados já vieram do banco (ou não há backend) */
  carregado: boolean
  empresaId: string | null

  carregar: () => Promise<void>
  popularExemplo: () => Promise<void>

  setTema: (t: Tema) => void
  toggleTema: () => void
  setPerfil: (patch: Partial<Perfil>) => void
  resetPerfil: () => void
  addLead: (input: NovoLead) => string
  updateLead: (id: string, patch: Partial<Lead>, autor?: string) => void
  moveStatus: (id: string, status: StatusId, autor?: string) => void
  deleteLead: (id: string) => void
  addInteracao: (leadId: string, input: Omit<Interacao, 'id' | 'data'>) => void
  deleteInteracao: (leadId: string, interacaoId: string) => void
  addVendedor: (nome: string) => boolean
  renameVendedor: (antigo: string, novo: string) => boolean
  deleteVendedor: (nome: string, reatribuirPara?: string) => boolean
  addLancamento: (input: Omit<TrafegoLancamento, 'id'>) => boolean
  updateLancamento: (id: string, patch: Partial<TrafegoLancamento>) => boolean
  deleteLancamento: (id: string) => void
  resetData: () => void
}

/** Dispara uma escrita no Supabase e avisa se falhar (não bloqueia a UI). */
function fire(p: Promise<unknown>, label: string) {
  p.then((r) => {
    const error = r && typeof r === 'object' ? (r as { error?: unknown }).error : null
    if (error) {
      console.error('[db]', label, error)
      useUI.getState().notify(`Não foi possível salvar (${label})`, 'danger')
    }
  }).catch((e) => {
    console.error('[db]', label, e)
    useUI.getState().notify(`Não foi possível salvar (${label})`, 'danger')
  })
}

export const useData = create<DataState>()(
  persist(
    (set, get) => ({
      leads: supabaseConfigurado ? [] : buildSeed(),
      vendedores: supabaseConfigurado ? [] : [...VENDEDORES],
      lancamentos: supabaseConfigurado ? [] : buildSeedLancamentos(),
      perfil: PERFIL_PADRAO,
      tema: 'dark',
      carregado: !supabaseConfigurado,
      empresaId: null,

      carregar: async () => {
        if (!supabaseConfigurado) return
        set({ carregado: false })
        try {
          const d = await db.carregarDados()
          set({
            empresaId: d.empresaId,
            perfil: d.perfil,
            vendedores: d.vendedores,
            leads: d.leads,
            lancamentos: d.lancamentos,
            carregado: true,
          })
        } catch (e) {
          console.error('[carregar]', e)
          useUI.getState().notify('Erro ao carregar seus dados', 'danger')
          set({ carregado: true })
        }
      },

      popularExemplo: async () => {
        const eid = get().empresaId
        if (!eid) return
        if (get().leads.length > 0) {
          useUI.getState().notify('Sua base já tem dados', 'info')
          return
        }
        // Seed com ids em UUID (a coluna id do banco é uuid)
        const leads = buildSeed().map((l) => ({
          ...l,
          id: crypto.randomUUID(),
          interacoes: (l.interacoes ?? []).map((it) => ({ ...it, id: crypto.randomUUID() })),
        }))
        const vendedores = [...VENDEDORES]
        const lancamentos = buildSeedLancamentos().map((l) => ({ ...l, id: crypto.randomUUID() }))
        try {
          await db.inserirEmLote(eid, vendedores, leads, lancamentos)
          set({ vendedores, leads, lancamentos })
          useUI.getState().notify('Dados de exemplo carregados')
        } catch (e) {
          console.error('[popularExemplo]', e)
          useUI.getState().notify('Falha ao carregar dados de exemplo', 'danger')
        }
      },

      setTema: (tema) => set({ tema }),
      toggleTema: () => set((s) => ({ tema: s.tema === 'dark' ? 'light' : 'dark' })),

      setPerfil: (patch) => {
        set((s) => ({ perfil: { ...s.perfil, ...patch } }))
        const eid = get().empresaId
        if (eid) fire(db.salvarPerfil(eid, patch), 'perfil')
      },
      resetPerfil: () => {
        set({ perfil: PERFIL_PADRAO })
        const eid = get().empresaId
        if (eid) fire(db.salvarPerfil(eid, PERFIL_PADRAO), 'perfil')
      },

      addLead: (input) => {
        const lead = db.novoLead(input)
        set((s) => ({ leads: [lead, ...s.leads] }))
        const eid = get().empresaId
        if (eid) fire(db.inserirLead(eid, lead), 'venda')
        return lead.id
      },

      updateLead: (id, patch, autor = 'Você') => {
        const l0 = get().leads.find((l) => l.id === id)
        if (!l0) return
        const now = new Date().toISOString()
        const statusChanged = patch.status && patch.status !== l0.status
        const historico = statusChanged
          ? [...l0.historico, { data: now, de: l0.status, para: patch.status!, por: autor }]
          : l0.historico
        const patchFull: Partial<Lead> = { ...patch, atualizadoEm: now, historico }
        set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patchFull } : l)) }))
        const eid = get().empresaId
        if (eid) fire(db.atualizarLead(id, patchFull), 'venda')
      },

      moveStatus: (id, status, autor = 'Você') => {
        const l0 = get().leads.find((l) => l.id === id)
        if (!l0 || l0.status === status) return
        const now = new Date().toISOString()
        const historico = [...l0.historico, { data: now, de: l0.status, para: status, por: autor }]
        const patchFull: Partial<Lead> = { status, atualizadoEm: now, historico }
        set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patchFull } : l)) }))
        const eid = get().empresaId
        if (eid) fire(db.atualizarLead(id, patchFull), 'estágio')
      },

      deleteLead: (id) => {
        set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }))
        const eid = get().empresaId
        if (eid) fire(db.removerLead(id), 'exclusão')
      },

      addInteracao: (leadId, input) => {
        const now = new Date().toISOString()
        const nova: Interacao = { ...input, id: crypto.randomUUID(), data: now }
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === leadId ? { ...l, interacoes: [...(l.interacoes ?? []), nova], atualizadoEm: now } : l,
          ),
        }))
        const eid = get().empresaId
        if (eid) {
          fire(db.inserirInteracao(eid, leadId, nova), 'contato')
          fire(db.atualizarLead(leadId, { atualizadoEm: now }), 'contato')
        }
      },

      deleteInteracao: (leadId, interacaoId) => {
        set((s) => ({
          leads: s.leads.map((l) =>
            l.id === leadId ? { ...l, interacoes: (l.interacoes ?? []).filter((i) => i.id !== interacaoId) } : l,
          ),
        }))
        const eid = get().empresaId
        if (eid) fire(db.removerInteracao(interacaoId), 'contato')
      },

      addVendedor: (nome) => {
        const n = nome.trim()
        if (!n) return false
        if (get().vendedores.some((v) => v.toLowerCase() === n.toLowerCase())) return false
        set((s) => ({ vendedores: [...s.vendedores, n] }))
        const eid = get().empresaId
        if (eid) fire(db.inserirVendedor(eid, n), 'vendedor')
        return true
      },

      renameVendedor: (antigo, novo) => {
        const n = novo.trim()
        const s = get()
        if (!n || !s.vendedores.includes(antigo)) return false
        if (n === antigo) return true
        if (s.vendedores.some((v) => v.toLowerCase() === n.toLowerCase())) return false
        set((st) => ({
          vendedores: st.vendedores.map((v) => (v === antigo ? n : v)),
          leads: st.leads.map((l) =>
            l.responsavel === antigo || l.historico.some((h) => h.por === antigo)
              ? {
                  ...l,
                  responsavel: l.responsavel === antigo ? n : l.responsavel,
                  historico: l.historico.map((h) => (h.por === antigo ? { ...h, por: n } : h)),
                }
              : l,
          ),
        }))
        const eid = get().empresaId
        if (eid) fire(db.renomearVendedorDb(eid, antigo, n), 'vendedor')
        return true
      },

      deleteVendedor: (nome, reatribuirPara) => {
        const s = get()
        if (!s.vendedores.includes(nome)) return false
        const temLeads = s.leads.some((l) => l.responsavel === nome)
        if (temLeads && (!reatribuirPara || reatribuirPara === nome)) return false
        set((st) => ({
          vendedores: st.vendedores.filter((v) => v !== nome),
          leads: reatribuirPara
            ? st.leads.map((l) => (l.responsavel === nome ? { ...l, responsavel: reatribuirPara } : l))
            : st.leads,
        }))
        const eid = get().empresaId
        if (eid) fire(db.removerVendedorDb(eid, nome, reatribuirPara), 'vendedor')
        return true
      },

      addLancamento: (input) => {
        if (get().lancamentos.some((l) => l.mes === input.mes)) return false
        const lanc: TrafegoLancamento = { ...input, id: crypto.randomUUID() }
        set((s) => ({ lancamentos: [...s.lancamentos, lanc].sort((a, b) => a.mes.localeCompare(b.mes)) }))
        const eid = get().empresaId
        if (eid) fire(db.inserirLancamento(eid, lanc), 'lançamento')
        return true
      },
      updateLancamento: (id, patch) => {
        const s = get()
        if (patch.mes && s.lancamentos.some((l) => l.id !== id && l.mes === patch.mes)) return false
        set((st) => ({
          lancamentos: st.lancamentos.map((l) => (l.id === id ? { ...l, ...patch } : l)).sort((a, b) => a.mes.localeCompare(b.mes)),
        }))
        const eid = get().empresaId
        if (eid) fire(db.atualizarLancamento(id, patch), 'lançamento')
        return true
      },
      deleteLancamento: (id) => {
        set((s) => ({ lancamentos: s.lancamentos.filter((l) => l.id !== id) }))
        const eid = get().empresaId
        if (eid) fire(db.removerLancamento(id), 'lançamento')
      },

      resetData: () => set({ leads: buildSeed(), lancamentos: buildSeedLancamentos() }),
    }),
    {
      name: 'clea-painel-v2',
      // Com backend, só o tema fica no navegador; os dados vêm do Supabase.
      partialize: supabaseConfigurado ? (s) => ({ tema: s.tema }) as Partial<DataState> : undefined,
    },
  ),
)

/* ────────────────────────────────────────────────────────────
   Estado de UI (não persistido)
   ──────────────────────────────────────────────────────────── */
export type Page = 'dashboard' | 'followup' | 'leads' | 'equipe' | 'trafego' | 'perfil'

export interface Filtros {
  search: string
  estado: string
  vendedor: string
  status: StatusId | 'all'
  campanha: string
}

const FILTROS_INIT: Filtros = {
  search: '',
  estado: 'all',
  vendedor: 'all',
  status: 'all',
  campanha: 'all',
}

interface UIState {
  page: Page
  setPage: (p: Page) => void

  editorOpen: boolean
  editingId: string | null
  openEditor: (id?: string | null) => void
  closeEditor: () => void

  detailId: string | null
  openDetail: (id: string) => void
  closeDetail: () => void

  filtros: Filtros
  setFiltro: (patch: Partial<Filtros>) => void
  clearFiltros: () => void

  toast: { id: number; msg: string; tone: 'ok' | 'info' | 'danger' } | null
  notify: (msg: string, tone?: 'ok' | 'info' | 'danger') => void
}

export const useUI = create<UIState>((set) => ({
  page: 'dashboard',
  setPage: (page) => set({ page }),

  editorOpen: false,
  editingId: null,
  openEditor: (id = null) => set({ editorOpen: true, editingId: id }),
  closeEditor: () => set({ editorOpen: false, editingId: null }),

  detailId: null,
  openDetail: (id) => set({ detailId: id }),
  closeDetail: () => set({ detailId: null }),

  filtros: FILTROS_INIT,
  setFiltro: (patch) => set((s) => ({ filtros: { ...s.filtros, ...patch } })),
  clearFiltros: () => set({ filtros: FILTROS_INIT }),

  toast: null,
  notify: (msg, tone = 'ok') => set({ toast: { id: Date.now(), msg, tone } }),
}))
