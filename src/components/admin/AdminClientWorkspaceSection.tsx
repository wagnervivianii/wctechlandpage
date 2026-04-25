import { useEffect, useMemo, useState } from 'react'

import AdminWorkspaceFilesPanel from './AdminWorkspaceFilesPanel'
import type {
  AdminClientWorkspaceFileActionPayload,
  AdminClientWorkspaceFileListResponse,
  AdminClientWorkspaceLifecyclePayload,
  AdminClientWorkspaceMeetingArtifactBatchSyncResponse,
  AdminClientWorkspaceMeetingArtifactItem,
  AdminClientWorkspaceMeetingItem,
  AdminClientWorkspaceSummaryItem,
} from '../../types/admin'

type AdminClientWorkspaceSectionProps = {
  items: AdminClientWorkspaceSummaryItem[]
  loading: boolean
  error: string
  isFocused?: boolean
  onRequestFocus?: () => void
  onClearFocus?: () => void
  generatingWorkspaceId?: number | null
  generatedInviteLinks?: Record<number, string>
  syncingDriveWorkspaceId?: number | null
  syncingGoogleWorkspaceId?: number | null
  lastGoogleSyncByWorkspace?: Record<number, AdminClientWorkspaceMeetingArtifactBatchSyncResponse>
  highlightWorkspaceId?: number | null
  workspaceFilesByWorkspace?: Record<number, AdminClientWorkspaceFileListResponse>
  loadingWorkspaceFilesByWorkspace?: Record<number, boolean>
  uploadingWorkspaceFileId?: number | null
  processingWorkspaceFileActionKey?: string | null
  processingWorkspaceLifecycleKey?: string | null
  onGenerateInvite?: (workspaceId: number, inviteTtlHours?: number) => Promise<void>
  onSyncWorkspaceDrive?: (workspaceId: number) => Promise<void>
  onSyncPendingGoogleArtifacts?: (workspaceId: number, forceResync?: boolean) => Promise<AdminClientWorkspaceMeetingArtifactBatchSyncResponse | void>
  onLoadWorkspaceFiles?: (workspaceId: number) => Promise<void>
  onUploadWorkspaceFile?: (
    workspaceId: number,
    payload: {
      file: File
      meetingId?: number | null
      displayName?: string
      description?: string
      fileCategory?: string
      targetBucket?: string
      visibleToClient?: boolean
    },
  ) => Promise<unknown>
  onApproveWorkspaceFile?: (workspaceId: number, fileId: number, payload: AdminClientWorkspaceFileActionPayload) => Promise<unknown>
  onRejectWorkspaceFile?: (workspaceId: number, fileId: number, payload: AdminClientWorkspaceFileActionPayload) => Promise<unknown>
  onArchiveWorkspaceFile?: (workspaceId: number, fileId: number, payload: AdminClientWorkspaceFileActionPayload) => Promise<unknown>
  onDeleteWorkspaceFile?: (workspaceId: number, fileId: number, payload: AdminClientWorkspaceFileActionPayload) => Promise<unknown>
  onSuspendWorkspace?: (workspaceId: number, payload: AdminClientWorkspaceLifecyclePayload) => Promise<unknown>
  onArchiveWorkspace?: (workspaceId: number, payload: AdminClientWorkspaceLifecyclePayload) => Promise<unknown>
  onReactivateWorkspace?: (workspaceId: number, payload: AdminClientWorkspaceLifecyclePayload) => Promise<unknown>
}

type WorkspacePanelKey = 'access' | 'drive' | 'meetings' | 'artifacts' | 'files' | 'closure'

function formatDateTime(value: string | null) {
  if (!value) return '—'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('pt-BR')
}

function getWorkspaceStatusLabel(status: string) {
  switch (status) {
    case 'activated':
      return 'Área ativada'
    case 'invited':
      return 'Convite enviado'
    case 'provisioned':
      return 'Área provisionada'
    case 'suspended':
      return 'Área suspensa'
    case 'archived':
      return 'Área arquivada'
    default:
      return status
  }
}

function getWorkspaceStatusClasses(status: string) {
  switch (status) {
    case 'activated':
      return 'bg-emerald-500/12 text-emerald-100 ring-1 ring-emerald-300/25'
    case 'invited':
      return 'bg-cyan-400/12 text-cyan-100 ring-1 ring-cyan-300/25'
    case 'suspended':
      return 'bg-amber-500/12 text-amber-100 ring-1 ring-amber-300/25'
    case 'archived':
      return 'bg-rose-500/12 text-rose-100 ring-1 ring-rose-300/25'
    default:
      return 'bg-white/8 text-slate-300 ring-1 ring-white/10'
  }
}

function getDriveSyncLabel(status: string | null | undefined) {
  switch (status) {
    case 'ready':
      return 'Drive pronto'
    case 'pending_configuration':
      return 'Aguardando configuração'
    case 'failed':
      return 'Falha no Drive'
    default:
      return status || 'Drive pendente'
  }
}

function getArtifactTypeLabel(value: string) {
  switch (value) {
    case 'transcript':
      return 'Transcrição'
    case 'recording':
      return 'Gravação'
    case 'summary':
      return 'Resumo'
    case 'notes':
      return 'Notas'
    default:
      return value
  }
}

function getArtifactSummary(artifact: AdminClientWorkspaceMeetingArtifactItem) {
  return artifact.summary_text || artifact.text_content || artifact.drive_file_name || 'Sem resumo disponível.'
}

function getAuthProviderLabel(value: string | null | undefined) {
  switch (value) {
    case 'google':
      return 'Google'
    case 'password_google':
      return 'Senha + Google'
    case 'password':
      return 'Senha'
    default:
      return 'Ainda sem conta'
  }
}

function getMeetingMaterialCount(meeting: AdminClientWorkspaceMeetingItem) {
  return meeting.artifacts.length + (meeting.recording_url ? 1 : 0)
}

function getWorkspaceFileBadge(fileList: AdminClientWorkspaceFileListResponse | undefined) {
  if (!fileList) {
    return 'Fluxo ativo'
  }

  if (fileList.pending_review_count > 0) {
    return `${fileList.pending_review_count} pendente${fileList.pending_review_count !== 1 ? 's' : ''}`
  }

  if (fileList.items.length > 0) {
    return `${fileList.items.length} arquivo${fileList.items.length !== 1 ? 's' : ''}`
  }

  return 'Sem arquivos ainda'
}

function WorkspacePanelCard({ title, eyebrow, badges, isActive, onClick }: { title: string; eyebrow: string; badges: string[]; isActive: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.2rem] border p-4 text-left transition ${isActive ? 'border-cyan-300/30 bg-cyan-400/8' : 'border-white/10 bg-white/5 hover:bg-white/8'}`}
    >
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-cyan-300">{eyebrow}</p>
      <h4 className="mt-3 text-base font-semibold text-white">{title}</h4>
      <div className="mt-3 flex flex-wrap gap-2">
        {badges.map((badge) => (
          <span key={badge} className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-300 ring-1 ring-white/10">
            {badge}
          </span>
        ))}
      </div>
    </button>
  )
}

export default function AdminClientWorkspaceSection({
  items,
  loading,
  error,
  isFocused = false,
  onRequestFocus,
  onClearFocus,
  generatingWorkspaceId = null,
  generatedInviteLinks = {},
  syncingDriveWorkspaceId = null,
  syncingGoogleWorkspaceId = null,
  lastGoogleSyncByWorkspace = {},
  highlightWorkspaceId = null,
  workspaceFilesByWorkspace = {},
  loadingWorkspaceFilesByWorkspace = {},
  uploadingWorkspaceFileId = null,
  processingWorkspaceFileActionKey = null,
  processingWorkspaceLifecycleKey = null,
  onGenerateInvite,
  onSyncWorkspaceDrive,
  onSyncPendingGoogleArtifacts,
  onLoadWorkspaceFiles,
  onUploadWorkspaceFile,
  onApproveWorkspaceFile,
  onRejectWorkspaceFile,
  onArchiveWorkspaceFile,
  onDeleteWorkspaceFile,
  onSuspendWorkspace,
  onArchiveWorkspace,
  onReactivateWorkspace,
}: AdminClientWorkspaceSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openWorkspaceIds, setOpenWorkspaceIds] = useState<Record<number, boolean>>({})
  const [workspacePanels, setWorkspacePanels] = useState<Record<number, WorkspacePanelKey>>({})
  const [openMeetingIds, setOpenMeetingIds] = useState<Record<number, number | null>>({})

  const sortedItems = useMemo(() => [...items].sort((left, right) => right.created_at.localeCompare(left.created_at)), [items])

  useEffect(() => {
    if (isFocused) setIsOpen(true)
  }, [isFocused])

  useEffect(() => {
    if (highlightWorkspaceId === null) return
    setIsOpen(true)
    setOpenWorkspaceIds((current) => ({ ...current, [highlightWorkspaceId]: true }))
    setWorkspacePanels((current) => ({ ...current, [highlightWorkspaceId]: 'meetings' }))
  }, [highlightWorkspaceId])

  function handleToggleSection() {
    setIsOpen((current) => {
      const next = !current
      if (next) onRequestFocus?.()
      else onClearFocus?.()
      return next
    })
  }

  function toggleWorkspace(workspaceId: number) {
    setOpenWorkspaceIds((current) => ({ ...current, [workspaceId]: !current[workspaceId] }))
    setWorkspacePanels((current) => ({ ...current, [workspaceId]: current[workspaceId] || 'access' }))
  }

  function selectPanel(workspaceId: number, panel: WorkspacePanelKey) {
    setWorkspacePanels((current) => ({ ...current, [workspaceId]: panel }))

    if (panel === 'files') {
      void onLoadWorkspaceFiles?.(workspaceId)
    }
  }

  function toggleMeeting(workspaceId: number, meetingId: number) {
    setOpenMeetingIds((current) => ({ ...current, [workspaceId]: current[workspaceId] === meetingId ? null : meetingId }))
  }

  return (
    <section className={`h-full rounded-[1.8rem] border bg-slate-900/80 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur ${isFocused ? 'border-cyan-300/30' : 'border-white/10'}`}>
      <button type="button" onClick={handleToggleSection} className="flex w-full items-start justify-between gap-4 rounded-[1.8rem] p-5 text-left transition hover:bg-white/5 sm:p-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Portal do cliente</p>
            {isFocused ? <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">Em foco</span> : null}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white lg:text-[1.9rem]">Clientes, acessos e materiais</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${items.length > 0 ? 'bg-cyan-500/12 text-cyan-100 ring-cyan-300/25' : 'bg-white/8 text-slate-300 ring-white/10'}`}>{items.length} workspace{items.length !== 1 ? 's' : ''}</span>
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">{items.filter((item) => item.has_client_access).length} cliente{items.filter((item) => item.has_client_access).length !== 1 ? 's' : ''} já acessaram</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">{isOpen ? 'Aberto' : 'Fechado'}</span>
          <span className="text-lg text-slate-300">{isOpen ? '−' : '+'}</span>
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-white/10 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
          <div className="mb-5 flex flex-col gap-3 rounded-[1.25rem] border border-cyan-300/15 bg-cyan-400/6 p-4 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <p>Aqui você acompanha o acesso do cliente, os materiais das reuniões, as pastas do Drive e já prepara os blocos de upload e encerramento do workspace.</p>
            {isFocused ? <button type="button" onClick={onClearFocus} className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/5">Voltar ao painel completo</button> : null}
          </div>

          {error ? <div className="mb-5 rounded-[1.4rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">{error}</div> : null}
          {loading ? <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Carregando workspaces do cliente...</div> : null}
          {!loading && sortedItems.length === 0 ? <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Nenhum workspace provisionado até o momento. Eles passarão a aparecer aqui depois das aprovações com portal habilitado.</div> : null}

          {!loading && sortedItems.length > 0 ? (
            <div className="space-y-4 lg:space-y-5">
              {sortedItems.map((item) => {
                const isWorkspaceOpen = Boolean(openWorkspaceIds[item.workspace_id])
                const activePanel = workspacePanels[item.workspace_id] || 'access'
                const currentMeetingId = openMeetingIds[item.workspace_id] ?? item.latest_meeting?.id ?? null
                const account = item.account
                const transcriptCount = item.meetings.filter((meeting) => meeting.has_transcript).length
                const artifactCount = item.meetings.reduce((total, meeting) => total + meeting.artifacts.length, 0)
                const workspaceFileList = workspaceFilesByWorkspace[item.workspace_id]

                return (
                  <article key={item.workspace_id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60">
                    <button type="button" onClick={() => toggleWorkspace(item.workspace_id)} className="flex w-full flex-col gap-4 rounded-[1.5rem] p-4 text-left transition hover:bg-white/5 sm:p-5">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">{item.primary_contact_name}</p>
                          <h3 className="mt-2 break-all text-xl font-semibold text-white">{item.primary_contact_email}</h3>
                          <p className="mt-2 text-sm text-slate-400">{item.primary_contact_phone}</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getWorkspaceStatusClasses(item.workspace_status)}`}>{getWorkspaceStatusLabel(item.workspace_status)}</span>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.has_client_access ? 'bg-emerald-500/12 text-emerald-100 ring-1 ring-emerald-300/25' : 'bg-white/8 text-slate-300 ring-1 ring-white/10'}`}>{item.has_client_access ? 'Cliente já acessou' : 'Aguardando cliente'}</span>
                        </div>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-3"><p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Reuniões</p><p className="mt-2 text-sm text-white">{item.meetings_count}</p></div>
                        <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-3"><p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Com transcrição</p><p className="mt-2 text-sm text-white">{transcriptCount}</p></div>
                        <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-3"><p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Materiais</p><p className="mt-2 text-sm text-white">{artifactCount}</p></div>
                        <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-3"><p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Drive</p><p className="mt-2 text-sm text-white">{getDriveSyncLabel(item.drive.sync_status)}</p></div>
                      </div>
                    </button>

                    {isWorkspaceOpen ? (
                      <div className="border-t border-white/10 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                          <WorkspacePanelCard title="Acesso e credenciais" eyebrow="Conta" badges={[getAuthProviderLabel(account?.auth_provider), item.has_client_access ? 'Portal já acessado' : 'Aguardando cliente']} isActive={activePanel === 'access'} onClick={() => selectPanel(item.workspace_id, 'access')} />
                          <WorkspacePanelCard title="Drive e organização" eyebrow="Drive" badges={[getDriveSyncLabel(item.drive.sync_status), item.drive.root ? 'Pasta raiz pronta' : 'Sem pasta raiz']} isActive={activePanel === 'drive'} onClick={() => selectPanel(item.workspace_id, 'drive')} />
                          <WorkspacePanelCard title="Reuniões e links" eyebrow="Meet" badges={[`${item.meetings_count} reunião${item.meetings_count !== 1 ? 'ões' : ''}`, item.latest_meeting?.meet_url ? 'Último link disponível' : 'Sem link recente']} isActive={activePanel === 'meetings'} onClick={() => selectPanel(item.workspace_id, 'meetings')} />
                          <WorkspacePanelCard title="Transcrições e materiais" eyebrow="Artifacts" badges={[`${artifactCount} material${artifactCount !== 1 ? 'is' : ''}`, `${transcriptCount} com transcrição`]} isActive={activePanel === 'artifacts'} onClick={() => selectPanel(item.workspace_id, 'artifacts')} />
                          <WorkspacePanelCard title="Arquivos do cliente" eyebrow="Uploads" badges={[getWorkspaceFileBadge(workspaceFileList), 'Upload admin + revisão']} isActive={activePanel === 'files'} onClick={() => selectPanel(item.workspace_id, 'files')} />
                          <WorkspacePanelCard title="Encerramento e exclusão" eyebrow="Lifecycle" badges={['Backup por etapas', 'Exclusão controlada']} isActive={activePanel === 'closure'} onClick={() => selectPanel(item.workspace_id, 'closure')} />
                        </div>

                        <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                          {activePanel === 'access' ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Portal e vínculo</p>
                                <p className="mt-3 leading-7">{item.portal_notes || 'Ainda não há observações internas registradas para este portal.'}</p>
                                <div className="mt-4 space-y-2 text-sm text-slate-300">
                                  <p>Conta criada: {account ? formatDateTime(account.created_at) : 'Ainda não'}</p>
                                  <p>Último login: {formatDateTime(account?.last_login_at ?? null)}</p>
                                  <p>Credencial ativa: {getAuthProviderLabel(account?.auth_provider)}</p>
                                  <p>Convite aceito: {formatDateTime(item.latest_invite_accepted_at)}</p>
                                </div>
                              </div>
                              <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Ações de acesso</p>
                                <div className="mt-4 space-y-3">
                                  <button type="button" onClick={() => void onGenerateInvite?.(item.workspace_id, 168)} disabled={!onGenerateInvite || generatingWorkspaceId === item.workspace_id} className="w-full rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60">{generatingWorkspaceId === item.workspace_id ? 'Gerando novo acesso...' : 'Gerar novo link de acesso'}</button>
                                  {generatedInviteLinks[item.workspace_id] ? <div className="rounded-[1rem] border border-cyan-300/15 bg-cyan-400/6 p-3"><p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-cyan-200">Novo link gerado</p><a href={generatedInviteLinks[item.workspace_id]} target="_blank" rel="noreferrer" className="mt-2 block break-all text-sm text-cyan-100 underline underline-offset-4">{generatedInviteLinks[item.workspace_id]}</a></div> : null}
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {activePanel === 'drive' ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Estrutura do Google Drive</p>
                                <p className="mt-3 text-white">{getDriveSyncLabel(item.drive.sync_status)}</p>
                                {item.drive.synced_at ? <p className="mt-2">Última sincronização: {formatDateTime(item.drive.synced_at)}</p> : null}
                                {item.drive.sync_error ? <p className="mt-2 text-rose-200">{item.drive.sync_error}</p> : null}
                                <div className="mt-4 space-y-2">
                                  {item.drive.root?.web_view_link ? <a href={item.drive.root.web_view_link} target="_blank" rel="noreferrer" className="block text-cyan-100 underline underline-offset-4">Abrir pasta raiz do cliente</a> : null}
                                  {item.drive.meet_artifacts?.web_view_link ? <a href={item.drive.meet_artifacts.web_view_link} target="_blank" rel="noreferrer" className="block text-cyan-100 underline underline-offset-4">Abrir pasta 01_meet_artifacts</a> : null}
                                  {item.drive.client_uploads?.web_view_link ? <a href={item.drive.client_uploads.web_view_link} target="_blank" rel="noreferrer" className="block text-cyan-100 underline underline-offset-4">Abrir pasta 02_client_uploads</a> : null}
                                  {item.drive.generated_documents?.web_view_link ? <a href={item.drive.generated_documents.web_view_link} target="_blank" rel="noreferrer" className="block text-cyan-100 underline underline-offset-4">Abrir pasta 03_generated_documents</a> : null}
                                </div>
                              </div>
                              <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200">
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Ações de sincronização</p>
                                <div className="mt-4 space-y-3">
                                  <button type="button" onClick={() => void onSyncWorkspaceDrive?.(item.workspace_id)} disabled={!onSyncWorkspaceDrive || syncingDriveWorkspaceId === item.workspace_id} className="w-full rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60">{syncingDriveWorkspaceId === item.workspace_id ? 'Sincronizando Drive...' : 'Sincronizar estrutura do Drive'}</button>
                                  <button type="button" onClick={() => void onSyncPendingGoogleArtifacts?.(item.workspace_id, false)} disabled={!onSyncPendingGoogleArtifacts || syncingGoogleWorkspaceId === item.workspace_id} className="w-full rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60">{syncingGoogleWorkspaceId === item.workspace_id ? 'Consultando Google Meet...' : 'Verificar artefatos pendentes'}</button>
                                  <button type="button" onClick={() => void onSyncPendingGoogleArtifacts?.(item.workspace_id, true)} disabled={!onSyncPendingGoogleArtifacts || syncingGoogleWorkspaceId === item.workspace_id} className="w-full rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60">{syncingGoogleWorkspaceId === item.workspace_id ? 'Forçando reprocessamento...' : 'Forçar nova verificação'}</button>
                                </div>
                              </div>
                            </div>
                          ) : null}

                          {activePanel === 'meetings' ? (
                            <div className="space-y-4">
                              {item.meetings.length === 0 ? <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-300">Ainda não há reuniões vinculadas a este workspace.</div> : item.meetings.map((meeting) => {
                                const isMeetingOpen = currentMeetingId === meeting.id
                                return (
                                  <article key={meeting.id} className="rounded-[1.2rem] border border-white/10 bg-slate-950/50">
                                    <button type="button" onClick={() => toggleMeeting(item.workspace_id, meeting.id)} className="flex w-full items-start justify-between gap-4 p-4 text-left transition hover:bg-white/5">
                                      <div>
                                        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-300">Reunião vinculada</p>
                                        <h4 className="mt-2 text-base font-semibold text-white">{meeting.meeting_label}</h4>
                                        <div className="mt-3 flex flex-wrap gap-2">
                                          <span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-300 ring-1 ring-white/10">{getMeetingMaterialCount(meeting)} material{getMeetingMaterialCount(meeting) !== 1 ? 'is' : ''}</span>
                                          <span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-300 ring-1 ring-white/10">Sincronizada em {formatDateTime(meeting.synced_from_booking_at)}</span>
                                        </div>
                                      </div>
                                      <span className="text-lg text-slate-300">{isMeetingOpen ? '−' : '+'}</span>
                                    </button>
                                    {isMeetingOpen ? <div className="border-t border-white/10 p-4"><div className="flex flex-wrap gap-3">{meeting.meet_url ? <a href={meeting.meet_url} target="_blank" rel="noreferrer" className="rounded-full bg-cyan-400/12 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/18">Abrir Meet</a> : null}{meeting.recording_url ? <a href={meeting.recording_url} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-300/25 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/18">Abrir replay</a> : null}</div><div className="mt-4 grid gap-4 lg:grid-cols-2"><div className="rounded-[1.15rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-200"><p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Linha do tempo</p><p className="mt-3">{formatDateTime(meeting.meeting_started_at)} → {formatDateTime(meeting.meeting_ended_at)}</p></div><div className="rounded-[1.15rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-200"><p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Observações</p><p className="mt-3 leading-7">{meeting.meeting_notes || 'As observações administrativas desta reunião aparecerão aqui.'}</p></div></div></div> : null}
                                  </article>
                                )
                              })}
                            </div>
                          ) : null}

                          {activePanel === 'artifacts' ? (
                            <div className="space-y-4">
                              {item.meetings.map((meeting) => (
                                <article key={meeting.id} className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4">
                                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                                    <div>
                                      <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-cyan-300">Materiais da reunião</p>
                                      <h4 className="mt-2 text-base font-semibold text-white">{meeting.meeting_label}</h4>
                                    </div>
                                    <span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-300 ring-1 ring-white/10">{meeting.artifacts.length} item{meeting.artifacts.length !== 1 ? 's' : ''}</span>
                                  </div>
                                  {meeting.transcript_summary ? <div className="mt-4 rounded-[1.15rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-200"><p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Resumo</p><p className="mt-3 leading-7">{meeting.transcript_summary}</p></div> : null}
                                  {meeting.artifacts.length > 0 ? <div className="mt-4 grid gap-3 lg:grid-cols-2">{meeting.artifacts.map((artifact) => (<div key={artifact.id} className="rounded-[1.15rem] border border-white/10 bg-white/5 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">{getArtifactTypeLabel(artifact.artifact_type)}</p><p className="mt-2 text-sm font-semibold text-white">{artifact.artifact_label || 'Material vinculado'}</p></div><span className="rounded-full bg-white/8 px-3 py-1 text-[0.68rem] font-semibold text-slate-300 ring-1 ring-white/10">{artifact.artifact_status}</span></div><p className="mt-3 text-sm leading-7 text-slate-200">{getArtifactSummary(artifact)}</p>{artifact.drive_web_view_link ? <a href={artifact.drive_web_view_link} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-sm font-semibold text-cyan-100 underline underline-offset-4">Abrir material</a> : null}</div>))}</div> : <div className="mt-4 rounded-[1.15rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">Ainda não há materiais persistidos para esta reunião.</div>}
                                </article>
                              ))}
                            </div>
                          ) : null}

                          {activePanel === 'files' && onLoadWorkspaceFiles && onUploadWorkspaceFile && onApproveWorkspaceFile && onRejectWorkspaceFile && onArchiveWorkspaceFile && onDeleteWorkspaceFile ? (
                            <AdminWorkspaceFilesPanel
                              workspace={item}
                              fileList={workspaceFileList ?? null}
                              loading={Boolean(loadingWorkspaceFilesByWorkspace[item.workspace_id])}
                              uploading={uploadingWorkspaceFileId === item.workspace_id}
                              processingActionKey={processingWorkspaceFileActionKey}
                              onLoadFiles={onLoadWorkspaceFiles}
                              onUploadFile={onUploadWorkspaceFile}
                              onApproveFile={onApproveWorkspaceFile}
                              onRejectFile={onRejectWorkspaceFile}
                              onArchiveFile={onArchiveWorkspaceFile}
                              onDeleteFile={onDeleteWorkspaceFile}
                            />
                          ) : null}

                          {activePanel === 'closure' ? (
                            <div className="grid gap-4 lg:grid-cols-2">
                              <div className="rounded-[1.2rem] border border-rose-400/25 bg-rose-500/10 p-4 text-sm text-slate-200">
                                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-rose-100">Encerramento controlado</p>
                                <ul className="mt-3 space-y-3 leading-7">
                                  <li>1. Suspender bloqueia o acesso do cliente sem apagar histórico.</li>
                                  <li>2. Arquivar encerra definitivamente o workspace e preserva dados administrativos.</li>
                                  <li>3. Reativar só fica disponível para workspace suspenso.</li>
                                </ul>
                                <div className="mt-4 flex flex-wrap gap-2">
                                  <button
                                    type="button"
                                    disabled={!onSuspendWorkspace || item.workspace_status === 'suspended' || item.workspace_status === 'archived' || processingWorkspaceLifecycleKey === `suspend:${item.workspace_id}`}
                                    onClick={() => {
                                      const reason = window.prompt('Motivo para suspender este workspace:', 'Suspensão administrativa temporária.')
                                      if (reason === null) return
                                      void onSuspendWorkspace?.(item.workspace_id, { reason })
                                    }}
                                    className="rounded-full border border-amber-300/25 px-4 py-2 text-sm font-medium text-amber-100 transition hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {processingWorkspaceLifecycleKey === `suspend:${item.workspace_id}` ? 'Suspendendo...' : 'Suspender acesso'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!onArchiveWorkspace || item.workspace_status === 'archived' || processingWorkspaceLifecycleKey === `archive:${item.workspace_id}`}
                                    onClick={() => {
                                      const reason = window.prompt('Motivo para arquivar este workspace:', 'Encerramento administrativo do workspace.')
                                      if (reason === null) return
                                      if (!window.confirm('Confirmar arquivamento? O cliente perderá acesso, mas o histórico será preservado.')) return
                                      void onArchiveWorkspace?.(item.workspace_id, { reason })
                                    }}
                                    className="rounded-full border border-rose-300/25 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {processingWorkspaceLifecycleKey === `archive:${item.workspace_id}` ? 'Arquivando...' : 'Arquivar workspace'}
                                  </button>
                                  <button
                                    type="button"
                                    disabled={!onReactivateWorkspace || item.workspace_status !== 'suspended' || processingWorkspaceLifecycleKey === `reactivate:${item.workspace_id}`}
                                    onClick={() => {
                                      const reason = window.prompt('Motivo para reativar este workspace:', 'Reativação administrativa do workspace.')
                                      if (reason === null) return
                                      void onReactivateWorkspace?.(item.workspace_id, { reason })
                                    }}
                                    className="rounded-full border border-emerald-300/25 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                                  >
                                    {processingWorkspaceLifecycleKey === `reactivate:${item.workspace_id}` ? 'Reativando...' : 'Reativar workspace'}
                                  </button>
                                </div>
                              </div>
                              <div className="rounded-[1.2rem] border border-white/10 bg-slate-950/50 p-4 text-sm text-slate-200"><p className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Checklist antes de excluir</p><ul className="mt-3 space-y-3 leading-7 text-slate-300"><li>• Conferir se a reunião já foi concluída ou encerrada.</li><li>• Garantir que transcrições e documentos relevantes foram preservados.</li><li>• Confirmar a remoção do conteúdo do Google Drive e do servidor em blocos controlados.</li></ul></div>
                            </div>
                          ) : null}

                          {lastGoogleSyncByWorkspace[item.workspace_id] ? <div className="mt-4 rounded-[1rem] border border-white/10 bg-slate-950/50 p-3 text-sm text-slate-300"><p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Última verificação de artefatos</p><p className="mt-2 text-white">{lastGoogleSyncByWorkspace[item.workspace_id].synchronized_meetings_count > 0 ? `${lastGoogleSyncByWorkspace[item.workspace_id].synchronized_meetings_count} reunião(ões) sincronizada(s)` : 'Nenhum artefato novo sincronizado na última tentativa.'}</p><p className="mt-2">Sem artifacts prontos: {lastGoogleSyncByWorkspace[item.workspace_id].no_artifacts_available_count}</p><p>Falhas: {lastGoogleSyncByWorkspace[item.workspace_id].failed_meetings_count}</p></div> : null}
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
