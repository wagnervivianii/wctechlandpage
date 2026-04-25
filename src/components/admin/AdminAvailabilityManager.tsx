import { useMemo, useState } from 'react'

import type {
  AdminBookingApprovalPayload,
  AdminBookingHistoryItem,
  AdminBookingPendingReviewItem,
  AdminBookingRejectionPayload,
  AdminClientWorkspaceFileActionPayload,
  AdminClientWorkspaceFileListResponse,
  AdminClientWorkspaceLifecyclePayload,
  AdminClientWorkspaceMeetingArtifactBatchSyncResponse,
  AdminClientWorkspaceSummaryItem,
} from '../../types/admin'
import AdminActiveScheduleSection from './AdminActiveScheduleSection'
import AdminBookingHistorySection from './AdminBookingHistorySection'
import AdminClientWorkspaceSection from './AdminClientWorkspaceSection'
import AdminPendingReviewSection from './AdminPendingReviewSection'

type SlotDraft = {
  start_time: string
  end_time: string
  timezone_name: string
  is_active: boolean
}

type AdminAvailabilityDayItem = {
  id: number
  date: string
  weekday_label: string
  day_label: string
  month_label: string
  display_label: string
  is_active: boolean
  has_active_slots: boolean
  notes: string | null
  slots: {
    id: number
    start_time: string
    end_time: string
    timezone_name: string
    is_active: boolean
    label: string
  }[]
}

type AdminAvailabilityManagerProps = {
  username: string
  days: AdminAvailabilityDayItem[]
  history: AdminBookingHistoryItem[]
  pendingReviewItems: AdminBookingPendingReviewItem[]
  loadingDays: boolean
  loadingPendingReview: boolean
  submitting: boolean
  submittingReviewId: number | null
  error: string
  successMessage: string
  reviewError: string
  reviewSuccessMessage: string
  onLogout: () => void
  onCreateDay: (date: string, isActive: boolean) => Promise<void>
  onToggleDay: (dayId: number, isActive: boolean) => Promise<void>
  onCreateSlot: (dayId: number, payload: SlotDraft) => Promise<void>
  onUpdateSlot: (slotId: number, payload: SlotDraft) => Promise<void>
  onDeleteSlot: (slotId: number) => Promise<void>
  onApproveBooking: (bookingId: number, payload: AdminBookingApprovalPayload) => Promise<unknown>
  onRejectBooking: (bookingId: number, payload: AdminBookingRejectionPayload) => Promise<unknown>
  clientWorkspaces: AdminClientWorkspaceSummaryItem[]
  loadingClientWorkspaces: boolean
  clientWorkspaceError: string
  generatingWorkspaceId: number | null
  generatedInviteLinks: Record<number, string>
  syncingDriveWorkspaceId: number | null
  syncingGoogleWorkspaceId: number | null
  lastGoogleSyncByWorkspace: Record<number, AdminClientWorkspaceMeetingArtifactBatchSyncResponse>
  onGenerateWorkspaceInvite: (workspaceId: number, inviteTtlHours?: number) => Promise<void>
  onSyncWorkspaceDrive: (workspaceId: number) => Promise<void>
  onSyncPendingGoogleArtifacts: (workspaceId: number, forceResync?: boolean) => Promise<AdminClientWorkspaceMeetingArtifactBatchSyncResponse | void>
  workspaceFilesByWorkspace: Record<number, AdminClientWorkspaceFileListResponse>
  loadingWorkspaceFilesByWorkspace: Record<number, boolean>
  uploadingWorkspaceFileId: number | null
  processingWorkspaceFileActionKey: string | null
  processingWorkspaceLifecycleKey: string | null
  onLoadWorkspaceFiles: (workspaceId: number) => Promise<void>
  onUploadWorkspaceFile: (
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
  onApproveWorkspaceFile: (workspaceId: number, fileId: number, payload: AdminClientWorkspaceFileActionPayload) => Promise<unknown>
  onRejectWorkspaceFile: (workspaceId: number, fileId: number, payload: AdminClientWorkspaceFileActionPayload) => Promise<unknown>
  onArchiveWorkspaceFile: (workspaceId: number, fileId: number, payload: AdminClientWorkspaceFileActionPayload) => Promise<unknown>
  onDeleteWorkspaceFile: (workspaceId: number, fileId: number, payload: AdminClientWorkspaceFileActionPayload) => Promise<unknown>
  onSuspendWorkspace: (workspaceId: number, payload: AdminClientWorkspaceLifecyclePayload) => Promise<unknown>
  onArchiveWorkspace: (workspaceId: number, payload: AdminClientWorkspaceLifecyclePayload) => Promise<unknown>
  onReactivateWorkspace: (workspaceId: number, payload: AdminClientWorkspaceLifecyclePayload) => Promise<unknown>
}

type AdminMetricCard = {
  key: OverviewMetricKey
  label: string
  value: string
  accent: string
  hint: string
}

type AdminSectionKey = 'availability' | 'pending' | 'history' | 'clientWorkspace'
type OverviewMetricKey = 'pending' | 'days' | 'slots' | 'transcripts' | 'completed' | 'cancelled' | 'clients'

type ActiveSlotPreview = {
  slotId: number
  dayId: number
  date: string
  displayLabel: string
  timeLabel: string
}

function getWindowLimits() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0)

  const format = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return {
    minDate: format(start),
    maxDate: format(end),
  }
}

const defaultSlotDraft: SlotDraft = {
  start_time: '09:00',
  end_time: '10:00',
  timezone_name: 'America/Sao_Paulo',
  is_active: true,
}

function getFocusTitle(section: AdminSectionKey | null) {
  switch (section) {
    case 'availability':
      return 'Dias e horários válidos'
    case 'pending':
      return 'Solicitações prontas'
    case 'history':
      return 'Histórico da agenda'
    case 'clientWorkspace':
      return 'Portal do cliente'
    default:
      return ''
  }
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

function sortByNewest<T extends { created_at?: string | null; booking_date?: string | null }>(items: T[]) {
  return [...items].sort((left, right) => {
    const leftValue = left.booking_date || left.created_at || ''
    const rightValue = right.booking_date || right.created_at || ''
    return rightValue.localeCompare(leftValue)
  })
}

export default function AdminAvailabilityManager({
  username,
  days,
  history,
  pendingReviewItems,
  loadingDays,
  loadingPendingReview,
  submitting,
  submittingReviewId,
  error,
  successMessage,
  reviewError,
  reviewSuccessMessage,
  onLogout,
  onCreateDay,
  onToggleDay,
  onCreateSlot,
  onUpdateSlot,
  onDeleteSlot,
  onApproveBooking,
  onRejectBooking,
  clientWorkspaces,
  loadingClientWorkspaces,
  clientWorkspaceError,
  generatingWorkspaceId,
  generatedInviteLinks,
  syncingDriveWorkspaceId,
  syncingGoogleWorkspaceId,
  lastGoogleSyncByWorkspace,
  onGenerateWorkspaceInvite,
  onSyncWorkspaceDrive,
  onSyncPendingGoogleArtifacts,
  workspaceFilesByWorkspace,
  loadingWorkspaceFilesByWorkspace,
  uploadingWorkspaceFileId,
  processingWorkspaceFileActionKey,
  processingWorkspaceLifecycleKey,
  onLoadWorkspaceFiles,
  onUploadWorkspaceFile,
  onApproveWorkspaceFile,
  onRejectWorkspaceFile,
  onArchiveWorkspaceFile,
  onDeleteWorkspaceFile,
  onSuspendWorkspace,
  onArchiveWorkspace,
  onReactivateWorkspace,
}: AdminAvailabilityManagerProps) {
  const { minDate, maxDate } = useMemo(() => getWindowLimits(), [])
  const [dayDate, setDayDate] = useState(minDate)
  const [slotDrafts, setSlotDrafts] = useState<Record<number, SlotDraft>>({})
  const [editingSlotIds, setEditingSlotIds] = useState<Record<number, boolean>>({})
  const [editingSlotDrafts, setEditingSlotDrafts] = useState<Record<number, SlotDraft>>({})
  const [focusedSection, setFocusedSection] = useState<AdminSectionKey | null>(null)
  const [overviewOpen, setOverviewOpen] = useState(false)
  const [scheduleControlOpen, setScheduleControlOpen] = useState(false)
  const [selectedMetric, setSelectedMetric] = useState<OverviewMetricKey | null>(null)
  const [highlightDayId, setHighlightDayId] = useState<number | null>(null)
  const [highlightWorkspaceId, setHighlightWorkspaceId] = useState<number | null>(null)

  const sortedDays = useMemo(() => [...days].sort((left, right) => left.date.localeCompare(right.date)), [days])
  const sortedPending = useMemo(
    () => [...pendingReviewItems].sort((left, right) => right.contact_confirmed_at.localeCompare(left.contact_confirmed_at)),
    [pendingReviewItems],
  )

  const activeSlotCount = useMemo(
    () => sortedDays.reduce((total, day) => total + day.slots.filter((slot) => slot.is_active).length, 0),
    [sortedDays],
  )
  const activeSlots = useMemo<ActiveSlotPreview[]>(
    () =>
      sortedDays.flatMap((day) =>
        day.slots
          .filter((slot) => slot.is_active)
          .map((slot) => ({
            slotId: slot.id,
            dayId: day.id,
            date: day.date,
            displayLabel: day.display_label,
            timeLabel: slot.label,
          })),
      ),
    [sortedDays],
  )
  const completedItems = useMemo(
    () => sortByNewest(history.filter((item) => item.meeting_status === 'completed')),
    [history],
  )
  const transcriptItems = useMemo(() => sortByNewest(history.filter((item) => item.has_transcript)), [history])
  const cancelledItems = useMemo(
    () => sortByNewest(history.filter((item) => item.status === 'cancelled_by_admin')),
    [history],
  )
  const activeClientItems = useMemo(
    () => sortByNewest(clientWorkspaces.filter((item) => item.has_client_access)),
    [clientWorkspaces],
  )

  const metrics = useMemo<AdminMetricCard[]>(
    () => [
      {
        key: 'pending',
        label: 'Pendentes',
        value: String(sortedPending.length),
        hint: 'Abrir pendências prontas',
        accent: 'border-amber-300/20 bg-amber-500/10 text-amber-100',
      },
      {
        key: 'days',
        label: 'Dias ativos',
        value: String(sortedDays.length),
        hint: 'Ver dias liberados',
        accent: 'border-cyan-300/20 bg-cyan-500/10 text-cyan-100',
      },
      {
        key: 'slots',
        label: 'Horários ativos',
        value: String(activeSlotCount),
        hint: 'Ver horários ativos',
        accent: 'border-indigo-300/20 bg-indigo-500/10 text-indigo-100',
      },
      {
        key: 'transcripts',
        label: 'Com transcrição',
        value: String(transcriptItems.length),
        hint: 'Ver reuniões com transcrição',
        accent: 'border-emerald-300/20 bg-emerald-500/10 text-emerald-100',
      },
      {
        key: 'completed',
        label: 'Concluídas',
        value: String(completedItems.length),
        hint: 'Ver reuniões concluídas',
        accent: 'border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100',
      },
      {
        key: 'cancelled',
        label: 'Canceladas',
        value: String(cancelledItems.length),
        hint: 'Ver reuniões canceladas',
        accent: 'border-rose-300/20 bg-rose-500/10 text-rose-100',
      },
      {
        key: 'clients',
        label: 'Clientes ativos',
        value: String(activeClientItems.length),
        hint: 'Ver clientes com acesso',
        accent: 'border-teal-300/20 bg-teal-500/10 text-teal-100',
      },
    ],
    [activeClientItems.length, activeSlotCount, cancelledItems.length, completedItems.length, sortedDays.length, sortedPending.length, transcriptItems.length],
  )

  function updateDraftForDay(dayId: number, nextDraft: SlotDraft) {
    setSlotDrafts((current) => ({ ...current, [dayId]: nextDraft }))
  }

  function resetDayDraft(dayId: number) {
    setSlotDrafts((current) => ({ ...current, [dayId]: defaultSlotDraft }))
  }

  function startEditingSlot(slotId: number, draft: SlotDraft) {
    setEditingSlotIds((current) => ({ ...current, [slotId]: true }))
    setEditingSlotDrafts((current) => ({ ...current, [slotId]: draft }))
  }

  function stopEditingSlot(slotId: number) {
    setEditingSlotIds((current) => ({ ...current, [slotId]: false }))
    setEditingSlotDrafts((current) => {
      const next = { ...current }
      delete next[slotId]
      return next
    })
  }

  function setEditingSlotDraft(slotId: number, nextDraft: SlotDraft) {
    setEditingSlotDrafts((current) => ({ ...current, [slotId]: nextDraft }))
  }

  const createDayHandler: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    await onCreateDay(dayDate, true)
  }

  const clearFocus = () => {
    setFocusedSection(null)
    setHighlightDayId(null)
    setHighlightWorkspaceId(null)
  }
  const focusAvailability = () => setFocusedSection('availability')
  const focusPending = () => setFocusedSection('pending')
  const focusHistory = () => setFocusedSection('history')
  const focusClientWorkspace = () => setFocusedSection('clientWorkspace')

  function handleToggleOverview() {
    setOverviewOpen((current) => {
      const next = !current
      if (!next) {
        setSelectedMetric(null)
      }
      return next
    })
  }

  function handleToggleScheduleControl() {
    setScheduleControlOpen((current) => !current)
  }

  function handleMetricClick(metricKey: OverviewMetricKey) {
    setOverviewOpen(true)
    setSelectedMetric((current) => (current === metricKey ? null : metricKey))
  }

  function openAvailabilityDetail(dayId: number) {
    setHighlightDayId(dayId)
    setFocusedSection('availability')
  }

  function openClientWorkspaceDetail(workspaceId: number) {
    setHighlightWorkspaceId(workspaceId)
    setFocusedSection('clientWorkspace')
  }

  function renderMetricContent() {
    if (selectedMetric === null) {
      return null
    }

    const shell = (title: string, description: string, content: React.ReactNode) => (
      <div className="rounded-[1.3rem] border border-white/10 bg-slate-950/60 p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Indicador selecionado</p>
            <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">{title}</h3>
            <p className="mt-2 text-sm text-slate-400">{description}</p>
          </div>
          <button
            type="button"
            onClick={() => setSelectedMetric(null)}
            className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/5"
          >
            Fechar lista
          </button>
        </div>
        {content}
      </div>
    )

    switch (selectedMetric) {
      case 'pending':
        return shell(
          'Pendências prontas para triagem',
          'Ao clicar em um item, o painel abre a seção de triagem administrativa para análise e decisão.',
          sortedPending.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {sortedPending.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={focusPending}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-left transition hover:border-amber-300/35 hover:bg-white/8"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-amber-300">{item.display_label}</p>
                  <h4 className="mt-2 text-base font-semibold text-white">{item.name}</h4>
                  <p className="mt-2 text-sm text-slate-400">{item.subject_summary}</p>
                  <p className="mt-3 text-xs font-medium text-slate-500">Confirmado em {formatDateTime(item.contact_confirmed_at)}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Nenhuma pendência disponível neste momento.
            </div>
          ),
        )
      case 'days':
        return shell(
          'Dias liberados na agenda',
          'Ao clicar em um dia, a área de gestão da agenda abre já posicionada nesse bloco para edição.',
          sortedDays.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {sortedDays.map((day) => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => openAvailabilityDetail(day.id)}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-left transition hover:border-cyan-300/35 hover:bg-white/8"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-300">{day.weekday_label}</p>
                  <h4 className="mt-2 text-base font-semibold text-white">{day.display_label}</h4>
                  <p className="mt-2 text-sm text-slate-400">{day.slots.length} horário(s) visível(is) neste dia.</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Nenhum dia ativo disponível.
            </div>
          ),
        )
      case 'slots':
        return shell(
          'Horários ativos',
          'Ao clicar em um horário, a agenda abre diretamente no dia correspondente para ajuste fino.',
          activeSlots.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {activeSlots.map((slot) => (
                <button
                  key={slot.slotId}
                  type="button"
                  onClick={() => openAvailabilityDetail(slot.dayId)}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-left transition hover:border-indigo-300/35 hover:bg-white/8"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-indigo-300">{slot.timeLabel}</p>
                  <h4 className="mt-2 text-base font-semibold text-white">{slot.displayLabel}</h4>
                  <p className="mt-2 text-sm text-slate-400">Clique para abrir o dia e ajustar esse horário.</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Nenhum horário ativo disponível.
            </div>
          ),
        )
      case 'transcripts':
        return shell(
          'Reuniões com transcrição',
          'Ao clicar em um item, você abre o detalhe do evento no histórico administrativo.',
          transcriptItems.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {transcriptItems.map((item) => (
                <a
                  key={item.id}
                  href={`/admin/historico/${item.id}`}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-left transition hover:border-emerald-300/35 hover:bg-white/8"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-emerald-300">{item.display_label}</p>
                  <h4 className="mt-2 text-base font-semibold text-white">{item.name}</h4>
                  <p className="mt-2 text-sm text-slate-400">{item.transcript_summary || 'Transcrição disponível para consulta.'}</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Nenhuma reunião com transcrição disponível.
            </div>
          ),
        )
      case 'completed':
        return shell(
          'Reuniões concluídas',
          'Ao clicar em um item, você abre o detalhe completo do evento concluído.',
          completedItems.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {completedItems.map((item) => (
                <a
                  key={item.id}
                  href={`/admin/historico/${item.id}`}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-left transition hover:border-fuchsia-300/35 hover:bg-white/8"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-fuchsia-300">{item.display_label}</p>
                  <h4 className="mt-2 text-base font-semibold text-white">{item.name}</h4>
                  <p className="mt-2 text-sm text-slate-400">{item.subject_summary}</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Nenhuma reunião concluída registrada.
            </div>
          ),
        )
      case 'cancelled':
        return shell(
          'Reuniões canceladas',
          'Ao clicar em um item, você abre o detalhe do cancelamento e dos dados vinculados.',
          cancelledItems.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {cancelledItems.map((item) => (
                <a
                  key={item.id}
                  href={`/admin/historico/${item.id}`}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-left transition hover:border-rose-300/35 hover:bg-white/8"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-rose-300">{item.display_label}</p>
                  <h4 className="mt-2 text-base font-semibold text-white">{item.name}</h4>
                  <p className="mt-2 text-sm text-slate-400">{item.cancellation_reason || 'Cancelamento administrativo registrado.'}</p>
                </a>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Nenhuma reunião cancelada registrada.
            </div>
          ),
        )
      case 'clients':
        return shell(
          'Clientes com acesso ativo',
          'Ao clicar em um item, o painel abre o portal do cliente já focado no workspace correspondente.',
          activeClientItems.length > 0 ? (
            <div className="grid gap-3 lg:grid-cols-2">
              {activeClientItems.map((item) => (
                <button
                  key={item.workspace_id}
                  type="button"
                  onClick={() => openClientWorkspaceDetail(item.workspace_id)}
                  className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-left transition hover:border-teal-300/35 hover:bg-white/8"
                >
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-teal-300">{item.primary_contact_name}</p>
                  <h4 className="mt-2 break-all text-base font-semibold text-white">{item.primary_contact_email}</h4>
                  <p className="mt-2 text-sm text-slate-400">Último acesso em {formatDateTime(item.account?.last_login_at ?? item.activated_at)}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Nenhum cliente com acesso ativo neste momento.
            </div>
          ),
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6 lg:space-y-7">
      <section className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.38)] backdrop-blur sm:p-6 lg:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Painel administrativo</p>
            <h1 className="mt-3 text-3xl font-semibold text-white lg:text-[2.15rem]">Gerenciar agenda liberada</h1>
            <p className="mt-3 text-sm text-slate-400">
              Sessão ativa como <span className="font-semibold text-slate-200">{username}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3 xl:justify-end">
            <a
              href="/agendar"
              className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
            >
              Ver agenda pública
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-white/8 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/12"
            >
              Sair
            </button>
          </div>
        </div>

        {successMessage ? (
          <div className="mt-6 rounded-[1.4rem] border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            {successMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-[1.4rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <section className="rounded-[1.5rem] border border-white/10 bg-white/5 shadow-[0_14px_40px_rgba(2,6,23,0.2)]">
            <button
              type="button"
              onClick={handleToggleOverview}
              className="flex w-full items-start justify-between gap-4 rounded-[1.5rem] p-4 text-left transition hover:bg-white/5 sm:p-5"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Visão geral</p>
                <h2 className="mt-3 text-xl font-semibold text-white">Indicadores rápidos da agenda</h2>
                <p className="mt-2 text-sm text-slate-400">
                  No mobile, os cards agora aproveitam melhor o espaço e cada indicador pode abrir sua própria lista de conteúdo.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                  {overviewOpen ? 'Aberto' : 'Fechado'}
                </span>
                <span className="text-lg text-slate-300">{overviewOpen ? '−' : '+'}</span>
              </div>
            </button>

            {overviewOpen ? (
              <div className="border-t border-white/10 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-4">
                  {metrics.map((metric) => {
                    const isActive = selectedMetric === metric.key
                    return (
                      <button
                        key={metric.key}
                        type="button"
                        onClick={() => handleMetricClick(metric.key)}
                        className={`rounded-[1.3rem] border p-4 text-left transition hover:scale-[1.01] ${metric.accent} ${isActive ? 'ring-2 ring-white/20' : ''}`}
                      >
                        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]">{metric.label}</p>
                        <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
                        <p className="mt-2 text-xs font-medium text-slate-200/80">{metric.hint}</p>
                      </button>
                    )
                  })}
                </div>

                {selectedMetric !== null ? <div className="mt-4">{renderMetricContent()}</div> : null}
              </div>
            ) : null}
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-white/5 shadow-[0_14px_40px_rgba(2,6,23,0.2)]">
            <button
              type="button"
              onClick={handleToggleScheduleControl}
              className="flex w-full items-start justify-between gap-4 rounded-[1.5rem] p-4 text-left transition hover:bg-white/5 sm:p-5"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Gestão da agenda</p>
                <h2 className="mt-3 text-xl font-semibold text-white">Liberar ou atualizar agenda</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Este controle agora fica em um card próprio, separado da visão geral do painel.
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-3">
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                  {scheduleControlOpen ? 'Aberto' : 'Fechado'}
                </span>
                <span className="text-lg text-slate-300">{scheduleControlOpen ? '−' : '+'}</span>
              </div>
            </button>

            {scheduleControlOpen ? (
              <div className="border-t border-white/10 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                <form onSubmit={createDayHandler} className="rounded-[1.4rem] border border-white/10 bg-slate-950/70 p-4 lg:p-5">
                  <label htmlFor="admin-day-date" className="mb-2 block text-sm font-medium text-slate-200">
                    Selecione o dia que deseja liberar ou atualizar
                  </label>
                  <div className="grid gap-4 md:grid-cols-[1fr_auto]">
                    <input
                      id="admin-day-date"
                      type="date"
                      min={minDate}
                      max={maxDate}
                      value={dayDate}
                      onChange={(event) => setDayDate(event.target.value)}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                    />

                    <button
                      type="submit"
                      disabled={submitting || !dayDate}
                      className="w-full rounded-full bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/50 md:w-auto"
                    >
                      {submitting ? 'Salvando...' : 'Salvar dia'}
                    </button>
                  </div>
                </form>
              </div>
            ) : null}
          </section>
        </div>
      </section>

      {focusedSection !== null ? (
        <section className="rounded-[1.5rem] border border-cyan-400/15 bg-cyan-400/6 px-4 py-4 shadow-[0_12px_32px_rgba(6,182,212,0.08)] sm:px-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300">Modo foco</p>
              <p className="mt-1 text-sm text-slate-200">
                Você está priorizando a seção <span className="font-semibold text-white">{getFocusTitle(focusedSection)}</span>.
              </p>
            </div>

            <button
              type="button"
              onClick={clearFocus}
              className="rounded-full border border-white/12 px-4 py-2.5 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/5"
            >
              Voltar ao painel completo
            </button>
          </div>
        </section>
      ) : null}

      {(focusedSection === null || focusedSection === 'availability') ? (
        <AdminActiveScheduleSection
          isFocused={focusedSection === 'availability'}
          onRequestFocus={focusAvailability}
          onClearFocus={clearFocus}
          highlightDayId={highlightDayId}
          days={days}
          loadingDays={loadingDays}
          submitting={submitting}
          dayDrafts={slotDrafts}
          editingSlotIds={editingSlotIds}
          editingSlotDrafts={editingSlotDrafts}
          onToggleDay={onToggleDay}
          onUpdateDraftForDay={updateDraftForDay}
          onStartEditingSlot={startEditingSlot}
          onStopEditingSlot={stopEditingSlot}
          onSetEditingSlotDraft={setEditingSlotDraft}
          onCreateSlot={onCreateSlot}
          onUpdateSlot={onUpdateSlot}
          onDeleteSlot={onDeleteSlot}
          onResetDayDraft={resetDayDraft}
        />
      ) : null}

      {focusedSection === null ? (
        <section className="grid gap-6 xl:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] xl:items-start">
          <div className="min-w-0">
            <AdminPendingReviewSection
              isFocused={false}
              onRequestFocus={focusPending}
              onClearFocus={clearFocus}
              items={pendingReviewItems}
              loading={loadingPendingReview}
              submittingReviewId={submittingReviewId}
              error={reviewError}
              successMessage={reviewSuccessMessage}
              onApprove={onApproveBooking}
              onReject={onRejectBooking}
            />
          </div>

          <div className="min-w-0">
            <AdminBookingHistorySection
              isFocused={false}
              onRequestFocus={focusHistory}
              onClearFocus={clearFocus}
              history={history}
            />
          </div>
        </section>
      ) : null}

      {focusedSection === 'pending' ? (
        <AdminPendingReviewSection
          isFocused
          onRequestFocus={focusPending}
          onClearFocus={clearFocus}
          items={pendingReviewItems}
          loading={loadingPendingReview}
          submittingReviewId={submittingReviewId}
          error={reviewError}
          successMessage={reviewSuccessMessage}
          onApprove={onApproveBooking}
          onReject={onRejectBooking}
        />
      ) : null}

      {focusedSection === 'history' ? (
        <AdminBookingHistorySection
          isFocused
          onRequestFocus={focusHistory}
          onClearFocus={clearFocus}
          history={history}
        />
      ) : null}

      {(focusedSection === null || focusedSection === 'clientWorkspace') ? (
        <AdminClientWorkspaceSection
          isFocused={focusedSection === 'clientWorkspace'}
          onRequestFocus={focusClientWorkspace}
          onClearFocus={clearFocus}
          items={clientWorkspaces}
          loading={loadingClientWorkspaces}
          error={clientWorkspaceError}
          generatingWorkspaceId={generatingWorkspaceId}
          generatedInviteLinks={generatedInviteLinks}
          syncingDriveWorkspaceId={syncingDriveWorkspaceId}
          syncingGoogleWorkspaceId={syncingGoogleWorkspaceId}
          lastGoogleSyncByWorkspace={lastGoogleSyncByWorkspace}
          highlightWorkspaceId={highlightWorkspaceId}
          onGenerateInvite={onGenerateWorkspaceInvite}
          onSyncWorkspaceDrive={onSyncWorkspaceDrive}
          onSyncPendingGoogleArtifacts={onSyncPendingGoogleArtifacts}
          workspaceFilesByWorkspace={workspaceFilesByWorkspace}
          loadingWorkspaceFilesByWorkspace={loadingWorkspaceFilesByWorkspace}
          uploadingWorkspaceFileId={uploadingWorkspaceFileId}
          processingWorkspaceFileActionKey={processingWorkspaceFileActionKey}
          processingWorkspaceLifecycleKey={processingWorkspaceLifecycleKey}
          onLoadWorkspaceFiles={onLoadWorkspaceFiles}
          onUploadWorkspaceFile={onUploadWorkspaceFile}
          onApproveWorkspaceFile={onApproveWorkspaceFile}
          onRejectWorkspaceFile={onRejectWorkspaceFile}
          onArchiveWorkspaceFile={onArchiveWorkspaceFile}
          onDeleteWorkspaceFile={onDeleteWorkspaceFile}
          onSuspendWorkspace={onSuspendWorkspace}
          onArchiveWorkspace={onArchiveWorkspace}
          onReactivateWorkspace={onReactivateWorkspace}
        />
      ) : null}
    </div>
  )
}
