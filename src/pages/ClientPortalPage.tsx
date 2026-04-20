import { useEffect, useMemo, useState } from 'react'

import {
  clearClientSession,
  getClientAvatarUrl,
  getClientLoginRoute,
  getClientToken,
  resolveClientDisplayName,
} from '../lib/clientAuth'
import { ClientApiError, clientApiClient } from '../services/ClientApiClient'
import type { ClientMeResponse, ClientPortalWorkspaceResponse } from '../types/client'

function formatDateTime(value: string | null) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR')
}

export default function ClientPortalPage() {
  const [me, setMe] = useState<ClientMeResponse | null>(null)
  const [workspace, setWorkspace] = useState<ClientPortalWorkspaceResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const avatarUrl = useMemo(() => getClientAvatarUrl(), [])

  useEffect(() => {
    const currentToken = getClientToken()
    if (!currentToken) {
      window.location.replace(getClientLoginRoute())
      return
    }

    const token = currentToken
    let isCancelled = false

    async function loadPortal() {
      try {
        setLoading(true)
        const [meResponse, workspaceResponse] = await Promise.all([
          clientApiClient.fetchMe(token),
          clientApiClient.fetchWorkspace(token),
        ])

        if (!isCancelled) {
          setMe(meResponse)
          setWorkspace(workspaceResponse)
          setError('')
        }
      } catch (err) {
        if (err instanceof ClientApiError && err.status === 401) {
          clearClientSession()
          window.location.replace(getClientLoginRoute())
          return
        }
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Não foi possível carregar seu portal agora.')
        }
      } finally {
        if (!isCancelled) {
          setLoading(false)
        }
      }
    }

    void loadPortal()

    return () => {
      isCancelled = true
    }
  }, [])

  function handleLogout() {
    clearClientSession()
    window.location.assign(getClientLoginRoute())
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="hero-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb hero-orb-cyan" aria-hidden="true" />
        <div className="hero-orb hero-orb-blue" aria-hidden="true" />
        <div className="hero-orb hero-orb-violet" aria-hidden="true" />

        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar do cliente" className="h-11 w-11 rounded-full object-cover" />
              ) : (
                <img src="/imagens/logo.png" alt="WV Tech Solutions" className="h-11 w-11 rounded-full object-cover" />
              )}
              <div className="min-w-0">
                <p className="truncate text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-slate-50 sm:text-[0.78rem]">WV Tech Solutions</p>
                <p className="truncate text-sm text-slate-400">{resolveClientDisplayName(me, workspace?.primary_contact_email)}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
            >
              Sair
            </button>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {loading ? (
            <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
              Carregando sua área do cliente...
            </div>
          ) : null}

          {error ? (
            <div className="rounded-[1.6rem] border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {!loading && workspace ? (
            <div className="space-y-6">
              <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_20px_70px_rgba(2,6,23,0.36)] backdrop-blur sm:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Portal do cliente</p>
                    <h1 className="mt-4 text-balance text-3xl font-semibold leading-[1.02] tracking-[-0.04em] text-white sm:text-4xl">
                      Seu espaço de acompanhamento já está ativo
                    </h1>
                    <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300 sm:text-lg">
                      Aqui você acompanha os materiais do projeto, acessa reuniões e consulta resumos e transcrições quando estiverem disponíveis.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Status</p>
                      <p className="mt-2 text-sm text-white">{workspace.workspace_status}</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Último acesso</p>
                      <p className="mt-2 text-sm text-white">{formatDateTime(me?.last_login_at ?? null)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Contato principal</p>
                    <p className="mt-3 text-sm font-semibold text-white">{workspace.primary_contact_name}</p>
                    <p className="mt-2 text-sm text-slate-300">{workspace.primary_contact_email}</p>
                    <p className="mt-1 text-sm text-slate-300">{workspace.primary_contact_phone}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Ativado em</p>
                    <p className="mt-3 text-sm text-white">{formatDateTime(workspace.activated_at)}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Reuniões visíveis</p>
                    <p className="mt-3 text-sm text-white">{workspace.meetings.length}</p>
                  </div>
                </div>

                {workspace.portal_notes ? (
                  <div className="mt-6 rounded-[1.25rem] border border-cyan-300/15 bg-cyan-400/6 p-4 text-sm leading-7 text-slate-200">
                    {workspace.portal_notes}
                  </div>
                ) : null}
              </section>

              <section className="space-y-4">
                {workspace.meetings.length === 0 ? (
                  <div className="rounded-[1.6rem] border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
                    Ainda não há reuniões visíveis neste portal.
                  </div>
                ) : null}

                {workspace.meetings.map((meeting) => (
                  <article key={meeting.id} className="rounded-[1.7rem] border border-white/10 bg-slate-950/75 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.28)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Reunião vinculada</p>
                        <h2 className="mt-3 text-xl font-semibold text-white">{meeting.meeting_label}</h2>
                        <div className="mt-4 flex flex-wrap gap-3">
                          {meeting.meet_url ? (
                            <a href={meeting.meet_url} target="_blank" rel="noreferrer" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                              Abrir Google Meet
                            </a>
                          ) : null}
                          {meeting.recording_url ? (
                            <a href={meeting.recording_url} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-300/25 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/18">
                              Abrir documento da reunião
                            </a>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-4">
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Sincronização</p>
                          <p className="mt-2 text-sm text-white">{formatDateTime(meeting.synced_from_booking_at)}</p>
                        </div>
                        <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-4">
                          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Período</p>
                          <p className="mt-2 text-sm text-white">{formatDateTime(meeting.meeting_started_at)} → {formatDateTime(meeting.meeting_ended_at)}</p>
                        </div>
                      </div>
                    </div>

                    {meeting.transcript_summary ? (
                      <div className="mt-5 rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Resumo da reunião</p>
                        <p className="mt-3 text-sm leading-7 text-slate-200">{meeting.transcript_summary}</p>
                      </div>
                    ) : null}

                    {meeting.transcript_text ? (
                      <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Transcrição</p>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">{meeting.transcript_text}</p>
                      </div>
                    ) : null}

                    {meeting.meeting_notes ? (
                      <div className="mt-4 rounded-[1.25rem] border border-cyan-300/15 bg-cyan-400/6 p-4">
                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-200">Observações</p>
                        <p className="mt-3 text-sm leading-7 text-slate-200">{meeting.meeting_notes}</p>
                      </div>
                    ) : null}
                  </article>
                ))}
              </section>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}