import { useState } from 'react'

import { getClientLoginRoute, setClientLastEmail } from '../lib/clientAuth'
import { clientApiClient } from '../services/ClientApiClient'

function getInitialEmail() {
  const params = new URLSearchParams(window.location.search)
  return params.get('email')?.trim() ?? ''
}

export default function ClientForgotPasswordPage() {
  const [email, setEmail] = useState(getInitialEmail)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setLoading(true)
      setError('')
      setMessage('')
      const response = await clientApiClient.forgotPassword(email)
      setClientLastEmail(email)
      setMessage(response.message)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível solicitar o link agora.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="hero-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb hero-orb-cyan" aria-hidden="true" />
        <main className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10 sm:px-6 lg:px-8">
          <form onSubmit={handleSubmit} className="mx-auto w-full rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.36)] backdrop-blur sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Área do cliente</p>
            <h1 className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-white">Recuperar senha</h1>
            <p className="mt-4 text-base leading-8 text-slate-300">
              Informe o mesmo e-mail usado no convite. Se houver uma conta compatível, enviaremos um link de redefinição.
            </p>

            {message ? (
              <div className="mt-6 rounded-[1.2rem] border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="mt-6 rounded-[1.2rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
                {error}
              </div>
            ) : null}

            <label className="mt-6 block">
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

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? 'Enviando...' : 'Enviar link de redefinição'}
            </button>

            <div className="mt-5 text-sm text-slate-300">
              <a href={getClientLoginRoute()} className="underline-offset-4 hover:underline">Voltar ao login</a>
            </div>
          </form>
        </main>
      </div>
    </div>
  )
}