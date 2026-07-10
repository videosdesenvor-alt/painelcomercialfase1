# Painel Comercial · Desenvor

Sistema de controle comercial (CRM de vendas). Rastreia leads por estado, campanha,
estágio do funil e vendedor responsável — com dashboard, follow-up (kanban), base de
clientes e desempenho da equipe. A estrutura de dados veio da planilha de vendas
original ("Clea Distribuidora - Painel de Vendas").

Design: dark premium com laranja vermilion e glassmorphism.

## Marca & Logo

Tudo da marca fica em [`src/lib/brand.ts`](src/lib/brand.ts) — nome, tagline e
"ticker" curto. Para trocar a logo:

1. Coloque o arquivo em **`public/logo.svg`** (preferido) ou **`public/logo.png`**.
2. Pronto — o componente `<Logo/>` usa SVG → PNG → monograma (nessa ordem).
3. Para desligar a imagem e usar só o monograma, defina `logo: null` em `brand.ts`.

## Rodando

```bash
npm install
npm run dev      # http://localhost:5178
npm run build    # build de produção em dist/
```

Node 18+ recomendado.

## Módulos

| Página | O que faz |
|--------|-----------|
| **Visão Geral** | KPIs (receita, em aberto, ticket, em risco), gráfico de receita diária, funil, termômetro por estado, ranking de vendedores, atividade recente |
| **Follow-up** | Kanban com arrastar-e-soltar entre os 6 estágios do funil |
| **Clientes** | Tabela com busca, filtros (estado/vendedor/status/campanha), ordenação e CRUD |
| **Equipe** | Desempenho individual dos vendedores |

## Dados

- Os dados vivem no **navegador (localStorage)**, com uma base de ~138 leads
  gerada de forma determinística (`src/lib/seed.ts`) espelhando a distribuição da
  planilha (forte no Nordeste, Alessandra como principal responsável, campanha
  "short duplo" predominante).
- Toda a leitura/escrita passa por `src/lib/store.ts` (Zustand). Essa é a **camada
  trocável**: para virar um sistema multiusuário na nuvem, basta reimplementar as
  ações do store apontando para um backend (ex.: Supabase) sem tocar na UI.

## Estrutura

```
src/
  lib/          types, seed, store (dados+UI), analytics, utils
  components/    Sidebar, Topbar, LeadEditor, LeadDetail, Toast, MeshBanner,
                 Avatar, StatusBadge, Kit, charts/ (AreaLine, Donut, MiniSpark)
  pages/         Dashboard, FollowUp, Leads, Equipe
```

## Próximos passos sugeridos

1. **Backend na nuvem** (Supabase): auth por vendedor + tabela `leads` + realtime.
2. **Importar a planilha** de verdade (CSV/Sheets API) para popular a base.
3. **WhatsApp**: os botões já geram links `wa.me`; integrar disparo/registro.
4. **Metas e comissões** por vendedor.
5. **Deploy** (Vercel).

## Stack

React 18 · Vite · TypeScript · Tailwind CSS · Zustand · lucide-react ·
gráficos SVG feitos à mão (sem libs de chart).
