/* ────────────────────────────────────────────────────────────
   MARCA — edite aqui e reflete em todo o painel.

   LOGO:
   - Coloque seu arquivo em `public/logo.svg` (preferido) ou `public/logo.png`.
   - O componente <Logo/> tenta o SVG, depois o PNG e, se nenhum existir,
     mostra o monograma (a inicial do nome).
   - Para desligar o logo e usar só o monograma, defina `logo: null`.
   ──────────────────────────────────────────────────────────── */
export const BRAND = {
  name: 'Desenvor',
  short: 'DSVR', // "ticker" curto usado no cabeçalho do gráfico
  tagline: 'Painel Comercial',
  logo: '/logo.svg' as string | null, // caminho do SVG (em public/)
  logoFallback: '/logo.png' as string | null, // caminho do PNG (em public/)
}
