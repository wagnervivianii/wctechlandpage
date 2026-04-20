import { useMemo, useState } from 'react'

import {
  getClientForgotPasswordRoute,
  getClientGoogleCallbackRoute,
  getClientLastEmail,
  getClientPortalRoute,
  setClientLastEmail,
  setClientToken,
} from '../lib/clientAuth'
import { clientApiClient } from '../services/ClientApiClient'

function getInitialEmail() {
  const params = new URLSearchParams(window.location.search)
  const emailFromQuery = params.get('email')?.trim()
  return emailFromQuery || getClientLastEmail()
}

export default function ClientLoginPage() {
  const [email, setEmail] = useState(getInitialEmail)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const googleRedirectUri = useMemo(
    () => `${window.location.origin}${getClientGoogleCallbackRoute()}`,
    [],
  )

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')
      const response = await clientApiClient.login(email, password)
      setClientToken(response.access_token)
      setClientLastEmail(response.email)
      window.location.assign(getClientPortalRoute())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar agora.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleLogin() {
    try {
      setLoading(true)
      setError('')
      const response = await clientApiClient.startGoogle(googleRedirectUri)
      window.location.assign(response.authorization_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível iniciar o acesso com Google.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="hero-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb hero-orb-cyan" aria-hidden="true" />
        <div className="hero-orb hero-orb-blue" aria-hidden="true" />
        <div className="hero-orb hero-orb-violet" aria-hidden="true" />

        <main className="mx-auto flex min-h-screen max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <section className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.36)] backdrop-blur sm:p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.14)] sm:text-[0.72rem]">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                Área do cliente
              </div>

              <h1 className="mt-6 text-balance text-3xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-4xl">
                Acesse seu espaço de acompanhamento
              </h1>

              <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
                Entre para acompanhar reuniões, links de acesso, gravações e materiais compartilhados durante o projeto.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Primeiro acesso</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    Use o link enviado no e-mail de aprovação para ativar sua área do cliente e definir sua senha.
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Acesso com Google</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    Se preferir, você também pode entrar com sua conta Google vinculada ao mesmo e-mail do convite.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.36)] backdrop-blur sm:p-8">
              <div className="flex items-center gap-3">
                <img src="/imagens/logo.png" alt="WV Tech Solutions" className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">WV Tech Solutions</p>
                  <p className="mt-1 text-sm text-slate-400">Login do cliente</p>
                </div>
              </div>

              {error ? (
                <div className="mt-6 rounded-[1.2rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">E-mail</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                    autoComplete="email"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
                    placeholder="voce@empresa.com"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Senha</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    autoComplete="current-password"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
                    placeholder="Sua senha"
                  />
                </label>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Entrando...' : 'Entrar'}
                </button>

                <button
                  type="button"
                  onClick={() => void handleGoogleLogin()}
                  disabled={loading}
                  className="w-full rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Entrar com Google
                </button>
              </div>

              <div className="mt-5 flex flex-col gap-2 text-sm text-slate-300">
                <a href={getClientForgotPasswordRoute(email)} className="underline-offset-4 hover:underline">
                  Esqueci minha senha
                </a>
                <a href="/" className="underline-offset-4 hover:underline">
                  Voltar ao site
                </a>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  )
}