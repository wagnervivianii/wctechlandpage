import { useEffect, useMemo, useState } from 'react'

import {
  getClientLoginRoute,
  getClientPortalRoute,
  setClientAvatarUrl,
  setClientLastEmail,
  setClientToken,
} from '../lib/clientAuth'
import { clientApiClient } from '../services/ClientApiClient'

type StepStatus = 'loading' | 'success' | 'error'

export default function ClientGoogleCallbackPage() {
  const params = useMemo(() => new URLSearchParams(window.location.search), [])
  const code = params.get('code')?.trim() ?? ''
  const state = params.get('state')?.trim() ?? ''
  const oauthError = params.get('error')?.trim() ?? ''

  const [status, setStatus] = useState<StepStatus>('loading')
  const [message, setMessage] = useState('Validando seu acesso com Google...')

  useEffect(() => {
    let cancelled = false

    async function completeGoogleAuth() {
      if (oauthError) {
        if (!cancelled) {
          setStatus('error')
          setMessage('O acesso com Google foi cancelado ou não pôde ser concluído.')
        }
        return
      }

      if (!code || !state) {
        if (!cancelled) {
          setStatus('error')
          setMessage('O retorno do Google está incompleto. Tente iniciar novamente.')
        }
        return
      }

      try {
        const redirectUri = `${window.location.origin}${window.location.pathname}`
        const response = await clientApiClient.exchangeGoogle(code, state, redirectUri)
        setClientToken(response.access_token)
        setClientLastEmail(response.email)
        setClientAvatarUrl(response.avatar_url)

        if (!cancelled) {
          setStatus('success')
          setMessage('Entrada com Google concluída. Redirecionando...')
          window.location.assign(getClientPortalRoute())
        }
      } catch (err) {
        if (!cancelled) {
          setStatus('error')
          setMessage(err instanceof Error ? err.message : 'Não foi possível concluir o acesso com Google.')
        }
      }
    }

    void completeGoogleAuth()

    return () => {
      cancelled = true
    }
  }, [code, oauthError, state])

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
      <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.36)] backdrop-blur">
        <h1 className="text-2xl font-semibold text-white">Entrar com Google</h1>
        <p className="mt-2 text-sm text-slate-400">Estamos finalizando a autenticação da sua área do cliente.</p>

        <div className={`mt-6 rounded-[1.2rem] p-4 text-sm ${status === 'error' ? 'border border-rose-400/30 bg-rose-500/10 text-rose-100' : status === 'success' ? 'border border-emerald-400/30 bg-emerald-500/10 text-emerald-100' : 'border border-white/10 bg-white/5 text-slate-200'}`}>
          {message}
        </div>

        {status === 'error' ? (
          <div className="mt-5 text-sm text-slate-300">
            <a href={getClientLoginRoute()} className="underline-offset-4 hover:underline">Voltar ao login</a>
          </div>
        ) : null}
      </div>
    </div>
  )
}