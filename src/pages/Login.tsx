import { useState } from 'react'
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react'
import { Logo } from '../components/Logo'
import { entrar } from '../lib/auth'
import { cn } from '../lib/utils'

/** Traduz as mensagens de erro mais comuns do Supabase. */
function traduzErro(msg: string): string {
  const m = msg.toLowerCase()
  // Falha de rede (offline, bloqueador de anúncios, VPN, conexão instável):
  // o supabase-js devolve "Failed to fetch" cru, que não diz nada ao usuário.
  if (m.includes('failed to fetch') || m.includes('networkerror') || m.includes('load failed'))
    return 'Não conseguimos falar com o servidor. Verifique sua internet (ou algum bloqueador/VPN) e tente de novo.'
  if (m.includes('timeout') || m.includes('timed out'))
    return 'A conexão demorou demais. Tente novamente.'
  if (m.includes('invalid login')) return 'E-mail ou senha incorretos.'
  if (m.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar (veja sua caixa de entrada).'
  if (m.includes('unable to validate email')) return 'E-mail inválido.'
  return msg
}

/** Campo "glass" — borda sutil, blur, e destaque ember ao focar. */
function GlassField({
  icon: Icon,
  right,
  className,
  ...props
}: { icon: typeof Mail; right?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="group rounded-2xl border border-hair bg-overlay backdrop-blur-sm transition-colors focus-within:border-ember/55 focus-within:bg-ember/[0.05]">
      <div className="relative flex items-center">
        <Icon
          size={16}
          className="pointer-events-none absolute left-4 text-ink-mute transition-colors group-focus-within:text-ember"
        />
        <input
          {...props}
          className={cn(
            // rounded-2xl no próprio input: sem isso o autofill do Chrome pinta
            // um retângulo de cantos retos que "vaza" nas pontas da borda.
            'w-full rounded-2xl bg-transparent py-3.5 pl-11 pr-4 text-sm text-ink placeholder:text-ink-mute focus:outline-none',
            className,
          )}
        />
        {right}
      </div>
    </div>
  )
}

export function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [carregando, setCarregando] = useState(false)

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro(null)
    setCarregando(true)
    try {
      const { error } = await entrar(email, senha)
      if (error) setErro(traduzErro(error.message))
      // Sucesso: o onAuthStateChange no App troca para o painel sozinho.
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      {/* Fundo ambiente da marca */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute right-[-8%] top-[-10%] h-[420px] w-[520px] rounded-full bg-ember/[0.12] blur-[120px] animate-aurora" />
        <div className="absolute bottom-[-12%] left-[-6%] h-[380px] w-[420px] rounded-full bg-ember-soft/[0.08] blur-[130px]" />
      </div>

      <div className="w-full max-w-sm">
        {/* Marca */}
        <div className="mb-7 flex flex-col items-center text-center">
          <div className="animate-fade-up">
            <Logo size={52} />
          </div>
          <h1
            className="mt-4 animate-fade-up font-display text-3xl font-bold tracking-tight text-ink"
            style={{ animationDelay: '60ms' }}
          >
            Bem-vindo de volta
          </h1>
          <p className="mt-1.5 animate-fade-up text-sm text-ink-mute" style={{ animationDelay: '120ms' }}>
            Entre para acessar seu painel comercial
          </p>
        </div>

        <form
          onSubmit={enviar}
          className="animate-fade-up space-y-3.5 rounded-3xl border border-hair-strong bg-surface/60 p-6 backdrop-blur-xl"
          style={{ animationDelay: '160ms' }}
        >
          <GlassField icon={Mail} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" autoComplete="email" />
          <GlassField
            icon={Lock}
            type={verSenha ? 'text' : 'password'}
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Senha"
            autoComplete="current-password"
            className="pr-12"
            right={
              <button
                type="button"
                onClick={() => setVerSenha((v) => !v)}
                className="absolute right-3 text-ink-mute transition-colors hover:text-ink"
                aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
              >
                {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            }
          />

          {erro && (
            <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">{erro}</p>
          )}

          <button type="submit" disabled={carregando} className="btn-ember w-full justify-center !py-3.5 disabled:opacity-60">
            {carregando ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <>
                Entrar <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <p className="mt-5 animate-fade-up text-center text-sm text-ink-mute" style={{ animationDelay: '220ms' }}>
          Não tem uma conta? <span className="font-semibold text-ember">Peça à equipe Desenvor</span>
        </p>
      </div>
    </div>
  )
}
