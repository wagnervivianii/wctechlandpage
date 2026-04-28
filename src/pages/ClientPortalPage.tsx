import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  clearClientSession,
  getClientAvatarUrl,
  getClientLoginRoute,
  getClientToken,
  resolveClientDisplayName,
} from '../lib/clientAuth'
import ClientPortalFilesSection from '../components/client/ClientPortalFilesSection'
import { ClientApiError, clientApiClient } from '../services/ClientApiClient'
import type {
  ClientMeResponse,
  ClientPortalMeetingArtifactItem,
  ClientPortalWorkspaceFileItem,
  ClientPortalWorkspaceFileUploadResponse,
  ClientPortalWorkspaceResponse,
} from '../types/client'

type ClientPortalSectionKey = 'overview' | 'meetings' | 'artifacts' | 'files'

function formatDateTime(value: string | null) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR')
}

function getWorkspaceStatusLabel(value: string) {
  switch (value) {
    case 'activated':
      return 'Área ativa'
    case 'invited':
      return 'Convite enviado'
    case 'provisioned':
      return 'Área provisionada'
    case 'suspended':
      return 'Acesso suspenso'
    case 'archived':
      return 'Área arquivada'
    default:
      return value
  }
}

function isClientAccessBlockedError(error: unknown) {
  return error instanceof ClientApiError && error.status === 403
}

function isClientSessionExpiredError(error: unknown) {
  return error instanceof ClientApiError && error.status === 401
}

function getClientBlockedMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message
  }

  return 'Seu acesso à área do cliente está indisponível no momento. Fale com a WV Tech Solutions para mais informações.'
}

function getArtifactTypeLabel(value: string) {
  switch (value) {
    case 'recording':
      return 'Gravação'
    case 'transcript':
      return 'Transcrição'
    case 'summary':
      return 'Resumo'
    case 'notes':
      return 'Notas'
    default:
      return value
  }
}

function getArtifactPreview(artifact: ClientPortalMeetingArtifactItem) {
  return artifact.summary_text || artifact.text_content || artifact.drive_file_name || 'Arquivo disponível para consulta.'
}

function PortalSectionCard({
  eyebrow,
  title,
  badges,
  isOpen,
  onToggle,
  children,
}: {
  eyebrow: string
  title: string
  badges: string[]
  isOpen: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <section className="rounded-[1.8rem] border border-white/10 bg-slate-950/75 shadow-[0_18px_60px_rgba(2,6,23,0.28)] backdrop-blur">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-4 rounded-[1.8rem] p-5 text-left transition hover:bg-white/5 sm:p-6"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">{eyebrow}</p>
          <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">{title}</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((badge) => (
              <span key={badge} className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            {isOpen ? 'Aberto' : 'Fechado'}
          </span>
          <span className="text-lg text-slate-300">{isOpen ? '−' : '+'}</span>
        </div>
      </button>

      {isOpen ? <div className="border-t border-white/10 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">{children}</div> : null}
    </section>
  )
}

export default function ClientPortalPage() {
  const [me, setMe] = useState<ClientMeResponse | null>(null)
  const [workspace, setWorkspace] = useState<ClientPortalWorkspaceResponse | null>(null)
  const [workspaceFiles, setWorkspaceFiles] = useState<ClientPortalWorkspaceFileItem[]>([])
  const [lastUpload, setLastUpload] = useState<ClientPortalWorkspaceFileUploadResponse | null>(null)
  const [clientToken, setClientToken] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadingFiles, setLoadingFiles] = useState(false)
  const [error, setError] = useState('')
  const [filesError, setFilesError] = useState('')
  const [hasLoadedWorkspaceFiles, setHasLoadedWorkspaceFiles] = useState(false)
  const [openSection, setOpenSection] = useState<ClientPortalSectionKey | null>(null)
  const [openMeetingId, setOpenMeetingId] = useState<number | null>(null)
  const avatarUrl = useMemo(() => getClientAvatarUrl(), [])

  useEffect(() => {
    const currentToken = getClientToken()
    if (!currentToken) {
      window.location.replace(getClientLoginRoute())
      return
    }

    const token = currentToken
    setClientToken(token)
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
          setOpenMeetingId(workspaceResponse.meetings[0]?.id ?? null)
          setError('')
          setFilesError('')
          setHasLoadedWorkspaceFiles(false)
        }
      } catch (err) {
        if (isClientSessionExpiredError(err)) {
          clearClientSession()
          window.location.replace(getClientLoginRoute())
          return
        }

        if (isClientAccessBlockedError(err)) {
          clearClientSession()
          if (!isCancelled) {
            setMe(null)
            setWorkspace(null)
            setWorkspaceFiles([])
            setError(getClientBlockedMessage(err))
          }
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

  const meetings = useMemo(() => workspace?.meetings ?? [], [workspace?.meetings])
  const totalArtifacts = useMemo(
    () => meetings.reduce((total, meeting) => total + meeting.artifacts.length, 0),
    [meetings],
  )
  const transcriptMeetings = useMemo(
    () => meetings.filter((meeting) => Boolean(meeting.transcript_summary || meeting.transcript_text)).length,
    [meetings],
  )
  const recordingMeetings = useMemo(
    () => meetings.filter((meeting) => Boolean(meeting.recording_url || meeting.artifacts.some((artifact) => artifact.artifact_type === 'recording'))).length,
    [meetings],
  )

  const approvedFilesCount = workspaceFiles.length

  const refreshWorkspaceFiles = useCallback(async () => {
    if (!clientToken) {
      return
    }

    try {
      setLoadingFiles(true)
      setFilesError('')
      const response = await clientApiClient.fetchWorkspaceFiles(clientToken)
      setWorkspaceFiles(response.items)
      setHasLoadedWorkspaceFiles(true)
    } catch (err) {
      if (isClientSessionExpiredError(err)) {
        clearClientSession()
        window.location.replace(getClientLoginRoute())
        return
      }

      if (isClientAccessBlockedError(err)) {
        clearClientSession()
        setMe(null)
        setWorkspace(null)
        setWorkspaceFiles([])
        setError(getClientBlockedMessage(err))
        return
      }

      setFilesError(err instanceof Error ? err.message : 'Não foi possível carregar os arquivos do seu workspace.')
    } finally {
      setLoadingFiles(false)
    }
  }, [clientToken])

  function handleWorkspaceFileUploaded(response: ClientPortalWorkspaceFileUploadResponse) {
    setLastUpload(response)
  }

  function handleLogout() {
    clearClientSession()
    window.location.assign(getClientLoginRoute())
  }

  function toggleSection(section: ClientPortalSectionKey) {
    setOpenSection((current) => (current === section ? null : section))
  }

  function toggleMeeting(meetingId: number) {
    setOpenMeetingId((current) => (current === meetingId ? null : meetingId))
  }

  useEffect(() => {
    if (openSection !== 'files' || hasLoadedWorkspaceFiles || loadingFiles || !clientToken) {
      return
    }

    void refreshWorkspaceFiles()
  }, [clientToken, hasLoadedWorkspaceFiles, loadingFiles, openSection, refreshWorkspaceFiles])

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
              <p>{error}</p>
              {!workspace && !loading ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mt-4 rounded-full border border-rose-200/30 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-50 transition hover:bg-rose-400/10"
                >
                  Voltar ao login
                </button>
              ) : null}
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
                      Aqui você acompanha as reuniões, acessa materiais e consulta o andamento do projeto em nichos separados.
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-[1.1rem] border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Status</p>
                      <p className="mt-2 text-sm text-white">{getWorkspaceStatusLabel(workspace.workspace_status)}</p>
                    </div>
                    <div className="rounded-[1.1rem] border border-white/10 bg-slate-950/50 p-4">
                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Último acesso</p>
                      <p className="mt-2 text-sm text-white">{formatDateTime(me?.last_login_at ?? null)}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-4">
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Contato principal</p>
                    <p className="mt-3 text-sm font-semibold text-white">{workspace.primary_contact_name}</p>
                    <p className="mt-2 text-sm text-slate-300">{workspace.primary_contact_email}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Reuniões</p>
                    <p className="mt-3 text-sm text-white">{meetings.length}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Com transcrição</p>
                    <p className="mt-3 text-sm text-white">{transcriptMeetings}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-slate-950/50 p-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Materiais</p>
                    <p className="mt-3 text-sm text-white">{totalArtifacts}</p>
                  </div>
                </div>

                {workspace.portal_notes ? (
                  <div className="mt-6 rounded-[1.25rem] border border-cyan-300/15 bg-cyan-400/6 p-4 text-sm leading-7 text-slate-200">
                    {workspace.portal_notes}
                  </div>
                ) : null}
              </section>

              <PortalSectionCard
                eyebrow="Conta e contato"
                title="Resumo do acesso"
                badges={[`Status: ${getWorkspaceStatusLabel(workspace.workspace_status)}`, `Ativado em ${formatDateTime(workspace.activated_at)}`]}
                isOpen={openSection === 'overview'}
                onToggle={() => toggleSection('overview')}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Cliente</p>
                    <p className="mt-3 text-sm font-semibold text-white">{workspace.primary_contact_name}</p>
                    <p className="mt-2 text-sm text-slate-300">{workspace.primary_contact_email}</p>
                    <p className="mt-1 text-sm text-slate-300">{workspace.primary_contact_phone}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Autenticação</p>
                    <p className="mt-3 text-sm text-white">{me?.auth_provider === 'password_google' ? 'Senha + Google' : me?.auth_provider === 'google' ? 'Google' : 'Senha'}</p>
                    <p className="mt-2 text-sm text-slate-300">Google vinculado: {me?.google_linked ? 'Sim' : 'Não'}</p>
                    <p className="mt-1 text-sm text-slate-300">Senha definida: {me?.has_password ? 'Sim' : 'Não'}</p>
                  </div>
                  <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Linha do tempo</p>
                    <p className="mt-3 text-sm text-white">Criado em {formatDateTime(workspace.created_at)}</p>
                    <p className="mt-2 text-sm text-slate-300">Último acesso em {formatDateTime(me?.last_login_at ?? null)}</p>
                  </div>
                </div>
              </PortalSectionCard>

              <PortalSectionCard
                eyebrow="Reuniões"
                title="Reuniões e links rápidos"
                badges={[`${meetings.length} reunião${meetings.length !== 1 ? 'ões' : ''}`, `${recordingMeetings} com replay ou documento`]}
                isOpen={openSection === 'meetings'}
                onToggle={() => toggleSection('meetings')}
              >
                {meetings.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    Ainda não há reuniões visíveis neste portal.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {meetings.map((meeting) => {
                      const isOpen = openMeetingId === meeting.id
                      return (
                        <article key={meeting.id} className="rounded-[1.4rem] border border-white/10 bg-white/5">
                          <button
                            type="button"
                            onClick={() => toggleMeeting(meeting.id)}
                            className="flex w-full items-start justify-between gap-4 rounded-[1.4rem] p-4 text-left transition hover:bg-white/5"
                          >
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">Reunião vinculada</p>
                              <h3 className="mt-2 text-lg font-semibold text-white">{meeting.meeting_label}</h3>
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
                                  Sincronizada em {formatDateTime(meeting.synced_from_booking_at)}
                                </span>
                                <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
                                  {meeting.artifacts.length} material{meeting.artifacts.length !== 1 ? 'is' : ''}
                                </span>
                              </div>
                            </div>
                            <span className="text-lg text-slate-300">{isOpen ? '−' : '+'}</span>
                          </button>

                          {isOpen ? (
                            <div className="border-t border-white/10 p-4">
                              <div className="flex flex-wrap gap-3">
                                {meeting.meet_url ? (
                                  <a href={meeting.meet_url} target="_blank" rel="noreferrer" className="rounded-full bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200">
                                    Entrar no Google Meet
                                  </a>
                                ) : null}
                                {meeting.recording_url ? (
                                  <a href={meeting.recording_url} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-300/25 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/18">
                                    Assistir ou abrir replay
                                  </a>
                                ) : null}
                              </div>

                              <div className="mt-4 grid gap-4 md:grid-cols-2">
                                <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Período registrado</p>
                                  <p className="mt-3">{formatDateTime(meeting.meeting_started_at)} → {formatDateTime(meeting.meeting_ended_at)}</p>
                                </div>
                                <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Observações</p>
                                  <p className="mt-3 leading-7">{meeting.meeting_notes || 'As observações finais desta reunião aparecerão aqui quando forem liberadas.'}</p>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </article>
                      )
                    })}
                  </div>
                )}
              </PortalSectionCard>

              <PortalSectionCard
                eyebrow="Materiais"
                title="Transcrições, gravações e documentos"
                badges={[`${transcriptMeetings} reunião${transcriptMeetings !== 1 ? 'ões' : ''} com transcrição`, `${totalArtifacts} material${totalArtifacts !== 1 ? 'is' : ''} disponível`]}
                isOpen={openSection === 'artifacts'}
                onToggle={() => toggleSection('artifacts')}
              >
                {meetings.length === 0 ? (
                  <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                    Ainda não há materiais vinculados ao seu portal.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {meetings.map((meeting) => (
                      <article key={meeting.id} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">Base da reunião</p>
                            <h3 className="mt-2 text-lg font-semibold text-white">{meeting.meeting_label}</h3>
                          </div>
                          <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
                            {meeting.artifacts.length} item{meeting.artifacts.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        {meeting.transcript_summary ? (
                          <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4">
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Resumo da reunião</p>
                            <p className="mt-3 text-sm leading-7 text-slate-200">{meeting.transcript_summary}</p>
                          </div>
                        ) : null}

                        {meeting.transcript_text ? (
                          <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4">
                            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Transcrição liberada</p>
                            <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-200">{meeting.transcript_text}</p>
                          </div>
                        ) : null}

                        {meeting.artifacts.length > 0 ? (
                          <div className="mt-4 grid gap-3 lg:grid-cols-2">
                            {meeting.artifacts.map((artifact) => (
                              <div key={artifact.id} className="rounded-[1.15rem] border border-white/10 bg-slate-950/50 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">{getArtifactTypeLabel(artifact.artifact_type)}</p>
                                    <p className="mt-2 text-sm font-semibold text-white">{artifact.artifact_label || 'Material vinculado'}</p>
                                  </div>
                                  <span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-300 ring-1 ring-white/10">
                                    {artifact.artifact_status}
                                  </span>
                                </div>

                                <p className="mt-3 text-sm leading-7 text-slate-200">{getArtifactPreview(artifact)}</p>
                                <p className="mt-3 text-xs uppercase tracking-[0.18em] text-slate-500">Capturado em {formatDateTime(artifact.captured_at)}</p>

                                {artifact.drive_web_view_link ? (
                                  <a href={artifact.drive_web_view_link} target="_blank" rel="noreferrer" className="mt-3 inline-flex rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-400/18">
                                    Abrir material
                                  </a>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="mt-4 rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">
                            Os materiais desta reunião ainda não foram liberados no seu portal.
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}
              </PortalSectionCard>

              <PortalSectionCard
                eyebrow="Arquivos do cliente"
                title="Envios e aprovações"
                badges={[`${approvedFilesCount} arquivo${approvedFilesCount !== 1 ? 's' : ''} liberado${approvedFilesCount !== 1 ? 's' : ''}`, lastUpload ? 'Último envio registrado' : 'Fluxo ativo para novos anexos']}
                isOpen={openSection === 'files'}
                onToggle={() => toggleSection('files')}
              >
                <ClientPortalFilesSection
                  token={clientToken}
                  workspace={workspace}
                  files={workspaceFiles}
                  loading={loadingFiles}
                  error={filesError}
                  onUnauthorized={handleLogout}
                  onUploadSuccess={handleWorkspaceFileUploaded}
                  onRefresh={refreshWorkspaceFiles}
                  lastUpload={lastUpload}
                />
              </PortalSectionCard>
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
