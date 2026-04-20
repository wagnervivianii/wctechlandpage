import { useEffect, useMemo, useState } from 'react'

import {
  getClientGoogleCallbackRoute,
  getClientPortalRoute,
  setClientLastEmail,
  setClientToken,
} from '../lib/clientAuth'
import { clientApiClient } from '../services/ClientApiClient'
import type { ClientInvitePreviewResponse } from '../types/client'

type ClientActivationPageProps = {
  inviteToken: string
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '—'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString('pt-BR')
}

export default function ClientActivationPage({ inviteToken }: ClientActivationPageProps) {
  const [preview, setPreview] = useState<ClientInvitePreviewResponse | null>(null)
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [previewLoading, setPreviewLoading] = useState(true)
  const [error, setError] = useState('')

  const googleRedirectUri = useMemo(
    () => `${window.location.origin}${getClientGoogleCallbackRoute()}`,
    [],
  )

  useEffect(() => {
    let isCancelled = false

    async function loadPreview() {
      try {
        setPreviewLoading(true)
        const response = await clientApiClient.fetchInvitePreview(inviteToken)
        if (!isCancelled) {
          setPreview(response)
          setClientLastEmail(response.invite_email)
        }
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Não foi possível validar este convite agora.')
        }
      } finally {
        if (!isCancelled) {
          setPreviewLoading(false)
        }
      }
    }

    void loadPreview()

    return () => {
      isCancelled = true
    }
  }, [inviteToken])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError('As senhas informadas não coincidem.')
      return
    }

    try {
      setLoading(true)
      setError('')
      const response = await clientApiClient.completeFirstAccess(inviteToken, password)
      setClientToken(response.access_token)
      setClientLastEmail(response.email)
      window.location.assign(getClientPortalRoute())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível concluir o primeiro acesso.')
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogleActivation() {
    try {
      setLoading(true)
      setError('')
      const response = await clientApiClient.startGoogle(googleRedirectUri, inviteToken)
      window.location.assign(response.authorization_url)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível iniciar a ativação com Google.')
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
          <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_0.95fr]">
            <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.36)] backdrop-blur sm:p-8 lg:p-10">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.14)] sm:text-[0.72rem]">
                <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                Ativação do portal
              </div>

              <h1 className="mt-6 text-balance text-3xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-4xl">
                Ative sua área do cliente
              </h1>

              <p className="mt-4 text-base leading-8 text-slate-300 sm:text-lg">
                Este é o espaço onde você acompanhará reuniões, materiais, gravações e transcrições do projeto junto à WV Tech Solutions.
              </p>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Senha</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    Defina uma senha agora para acessar seu ambiente sempre que precisar.
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-white/10 bg-slate-950/50 p-4">
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Google</p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">
                    Você também pode ativar seu acesso usando a mesma conta Google do e-mail convidado.
                  </p>
                </div>
              </div>

              {previewLoading ? (
                <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  Validando seu convite...
                </div>
              ) : preview ? (
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Convite</p>
                    <p className="mt-3 text-sm text-white">{preview.invite_email}</p>
                    <p className="mt-2 text-sm text-slate-300">Contato principal: {preview.contact_name}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Validade</p>
                    <p className="mt-3 text-sm text-white">{formatDateTime(preview.expires_at)}</p>
                    <p className="mt-2 text-sm text-slate-300">Status do convite: {preview.invite_status}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-slate-950/75 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.36)] backdrop-blur sm:p-8">
              <div className="flex items-center gap-3">
                <img src="/imagens/logo.png" alt="WV Tech Solutions" className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">WV Tech Solutions</p>
                  <p className="mt-1 text-sm text-slate-400">Primeiro acesso do cliente</p>
                </div>
              </div>

              {error ? (
                <div className="mt-6 rounded-[1.2rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Nova senha</span>
                  <input
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
                    placeholder="Mínimo de 8 caracteres"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-200">Confirmar senha</span>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
                    placeholder="Repita a nova senha"
                  />
                </label>
              </div>

              <div className="mt-6 space-y-3">
                <button
                  type="submit"
                  disabled={loading || !preview?.can_activate}
                  className="w-full rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Ativando...' : 'Definir senha e entrar'}
                </button>

                <button
                  type="button"
                  onClick={() => void handleGoogleActivation()}
                  disabled={loading || !preview?.can_activate}
                  className="w-full rounded-full border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/35 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  Ativar com Google
                </button>
              </div>

              <div className="mt-5 text-sm text-slate-300">
                Já ativou este acesso? <a href="/cliente/login" className="underline-offset-4 hover:underline">Entrar no portal</a>
              </div>
            </form>
          </section>
        </main>
      </div>
    </div>
  )
}