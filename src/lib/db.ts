import { supabase } from './supabase'
import type { Lead, NovoLead, Interacao, TrafegoLancamento, Perfil, EventoHistorico } from './types'

/* ────────────────────────────────────────────────────────────────
   Camada de acesso ao Supabase.
   Traduz DB (snake_case) ↔ app (camelCase). O RLS já filtra por
   empresa, então as leituras não precisam de WHERE empresa_id; as
   escritas precisam gravar empresa_id (a policy exige que bata).
   ──────────────────────────────────────────────────────────────── */

/* ── Mappers: linha do banco → tipo do app ── */
function rowToInteracao(r: any): Interacao {
  return { id: r.id, data: r.data, autor: r.autor ?? '', canal: r.canal, direcao: r.direcao, texto: r.texto }
}

function rowToLead(r: any, interacoes: Interacao[]): Lead {
  return {
    id: r.id,
    numero: r.numero ?? '',
    cliente: r.cliente,
    telefone: r.telefone ?? '',
    cidade: r.cidade ?? '',
    estado: r.estado ?? '',
    campanha: r.campanha ?? '',
    produto: r.produto ?? '',
    status: r.status,
    valor: Number(r.valor) || 0,
    observacao: r.observacao ?? '',
    responsavel: r.responsavel ?? '',
    proximoFollowUp: r.proximo_follow_up,
    origemTrafego: r.origem_trafego ?? false,
    interacoes,
    criadoEm: r.criado_em,
    atualizadoEm: r.atualizado_em,
    historico: (r.historico ?? []) as EventoHistorico[],
  }
}

function rowToLancamento(r: any): TrafegoLancamento {
  return { id: r.id, mes: r.mes, investido: Number(r.investido) || 0, honorarios: Number(r.honorarios) || 0, observacao: r.observacao ?? undefined }
}

/* ── App → linha do banco (para insert/update) ── */
function leadToRow(l: Partial<Lead>): Record<string, unknown> {
  const row: Record<string, unknown> = {}
  if (l.numero !== undefined) row.numero = l.numero
  if (l.cliente !== undefined) row.cliente = l.cliente
  if (l.telefone !== undefined) row.telefone = l.telefone
  if (l.cidade !== undefined) row.cidade = l.cidade
  if (l.estado !== undefined) row.estado = l.estado
  if (l.campanha !== undefined) row.campanha = l.campanha
  if (l.produto !== undefined) row.produto = l.produto
  if (l.status !== undefined) row.status = l.status
  if (l.valor !== undefined) row.valor = l.valor
  if (l.observacao !== undefined) row.observacao = l.observacao
  if (l.responsavel !== undefined) row.responsavel = l.responsavel
  if (l.proximoFollowUp !== undefined) row.proximo_follow_up = l.proximoFollowUp
  if (l.origemTrafego !== undefined) row.origem_trafego = l.origemTrafego
  if (l.historico !== undefined) row.historico = l.historico
  if (l.atualizadoEm !== undefined) row.atualizado_em = l.atualizadoEm
  return row
}

export interface DadosEmpresa {
  empresaId: string
  perfil: Perfil
  vendedores: string[]
  leads: Lead[]
  lancamentos: TrafegoLancamento[]
}

/* ── Carrega tudo da empresa logada ── */
export async function carregarDados(): Promise<DadosEmpresa> {
  const [perfilRes, empresaRes, vendRes, leadsRes, interRes, lancRes] = await Promise.all([
    supabase.from('perfis').select('nome,cargo,foto,empresa_id').maybeSingle(),
    supabase.from('empresas').select('id,nome,logo').maybeSingle(),
    supabase.from('vendedores').select('nome').order('nome'),
    supabase.from('leads').select('*').order('criado_em', { ascending: false }),
    supabase.from('interacoes').select('*').order('data'),
    supabase.from('lancamentos').select('*').order('mes'),
  ])

  const err = perfilRes.error || empresaRes.error || vendRes.error || leadsRes.error || interRes.error || lancRes.error
  if (err) throw err

  // Agrupa interações por lead
  const porLead = new Map<string, Interacao[]>()
  for (const r of interRes.data ?? []) {
    const arr = porLead.get(r.lead_id) ?? []
    arr.push(rowToInteracao(r))
    porLead.set(r.lead_id, arr)
  }

  return {
    empresaId: empresaRes.data?.id ?? perfilRes.data?.empresa_id ?? '',
    perfil: {
      nome: perfilRes.data?.nome ?? '',
      cargo: perfilRes.data?.cargo ?? '',
      foto: perfilRes.data?.foto ?? null,
      empresa: empresaRes.data?.nome ?? '',
      logo: empresaRes.data?.logo ?? null,
    },
    vendedores: (vendRes.data ?? []).map((v) => v.nome),
    leads: (leadsRes.data ?? []).map((r) => rowToLead(r, porLead.get(r.id) ?? [])),
    lancamentos: (lancRes.data ?? []).map(rowToLancamento),
  }
}

/* ── Leads ── */
export async function inserirLead(empresaId: string, lead: Lead) {
  return supabase.from('leads').insert({
    id: lead.id,
    empresa_id: empresaId,
    ...leadToRow(lead),
    criado_em: lead.criadoEm,
  })
}
export async function atualizarLead(id: string, patch: Partial<Lead>) {
  return supabase.from('leads').update(leadToRow(patch)).eq('id', id)
}
export async function removerLead(id: string) {
  return supabase.from('leads').delete().eq('id', id)
}

/* ── Interações ── */
export async function inserirInteracao(empresaId: string, leadId: string, i: Interacao) {
  return supabase.from('interacoes').insert({
    id: i.id, empresa_id: empresaId, lead_id: leadId,
    data: i.data, autor: i.autor, canal: i.canal, direcao: i.direcao, texto: i.texto,
  })
}
export async function removerInteracao(id: string) {
  return supabase.from('interacoes').delete().eq('id', id)
}

/* ── Vendedores (identificados por nome no app) ── */
export async function inserirVendedor(empresaId: string, nome: string) {
  return supabase.from('vendedores').insert({ empresa_id: empresaId, nome })
}
export async function renomearVendedorDb(empresaId: string, antigo: string, novo: string) {
  await supabase.from('vendedores').update({ nome: novo }).eq('empresa_id', empresaId).eq('nome', antigo)
  // Arrasta os leads (responsavel é o nome)
  return supabase.from('leads').update({ responsavel: novo }).eq('empresa_id', empresaId).eq('responsavel', antigo)
}
export async function removerVendedorDb(empresaId: string, nome: string, reatribuirPara?: string) {
  if (reatribuirPara) {
    await supabase.from('leads').update({ responsavel: reatribuirPara }).eq('empresa_id', empresaId).eq('responsavel', nome)
  }
  return supabase.from('vendedores').delete().eq('empresa_id', empresaId).eq('nome', nome)
}

/* ── Lançamentos de tráfego ── */
export async function inserirLancamento(empresaId: string, l: TrafegoLancamento) {
  return supabase.from('lancamentos').insert({
    id: l.id, empresa_id: empresaId, mes: l.mes, investido: l.investido, honorarios: l.honorarios, observacao: l.observacao ?? null,
  })
}
export async function atualizarLancamento(id: string, patch: Partial<TrafegoLancamento>) {
  const row: Record<string, unknown> = {}
  if (patch.mes !== undefined) row.mes = patch.mes
  if (patch.investido !== undefined) row.investido = patch.investido
  if (patch.honorarios !== undefined) row.honorarios = patch.honorarios
  if (patch.observacao !== undefined) row.observacao = patch.observacao ?? null
  return supabase.from('lancamentos').update(row).eq('id', id)
}
export async function removerLancamento(id: string) {
  return supabase.from('lancamentos').delete().eq('id', id)
}

/* ── Perfil (perfis) + empresa (empresas) ── */
export async function salvarPerfil(empresaId: string, patch: Partial<Perfil>) {
  const perfilRow: Record<string, unknown> = {}
  if (patch.nome !== undefined) perfilRow.nome = patch.nome
  if (patch.cargo !== undefined) perfilRow.cargo = patch.cargo
  if (patch.foto !== undefined) perfilRow.foto = patch.foto
  const empresaRow: Record<string, unknown> = {}
  if (patch.empresa !== undefined) empresaRow.nome = patch.empresa
  if (patch.logo !== undefined) empresaRow.logo = patch.logo

  const { data: sessao } = await supabase.auth.getUser()
  const uid = sessao.user?.id
  if (Object.keys(perfilRow).length && uid) await supabase.from('perfis').update(perfilRow).eq('id', uid)
  if (Object.keys(empresaRow).length) await supabase.from('empresas').update(empresaRow).eq('id', empresaId)
}

/* ── Popular com dados de exemplo (demo) ── */
export async function inserirEmLote(
  empresaId: string,
  vendedores: string[],
  leads: Lead[],
  lancamentos: TrafegoLancamento[],
) {
  await supabase.from('vendedores').insert(vendedores.map((nome) => ({ empresa_id: empresaId, nome })))
  // Leads em blocos (evita payload gigante)
  const leadRows = leads.map((l) => ({ id: l.id, empresa_id: empresaId, ...leadToRow(l), criado_em: l.criadoEm }))
  for (let i = 0; i < leadRows.length; i += 200) {
    await supabase.from('leads').insert(leadRows.slice(i, i + 200))
  }
  const interRows = leads.flatMap((l) =>
    (l.interacoes ?? []).map((it) => ({
      id: it.id, empresa_id: empresaId, lead_id: l.id,
      data: it.data, autor: it.autor, canal: it.canal, direcao: it.direcao, texto: it.texto,
    })),
  )
  for (let i = 0; i < interRows.length; i += 200) {
    await supabase.from('interacoes').insert(interRows.slice(i, i + 200))
  }
  if (lancamentos.length) {
    await supabase.from('lancamentos').insert(
      lancamentos.map((l) => ({ id: l.id, empresa_id: empresaId, mes: l.mes, investido: l.investido, honorarios: l.honorarios })),
    )
  }
}

/** Novo lead com id/uuid e timestamps prontos (usado pelo store). */
export function novoLead(input: NovoLead): Lead {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  return {
    ...input,
    id,
    criadoEm: now,
    atualizadoEm: now,
    interacoes: [],
    historico: [{ data: now, de: null, para: input.status, por: input.responsavel, nota: 'Lead criado' }],
  }
}
