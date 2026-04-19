import { useMemo, useState } from 'react'

import type {
  AdminBookingApprovalPayload,
  AdminBookingHistoryItem,
  AdminBookingPendingReviewItem,
  AdminBookingRejectionPayload,
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
}

type AdminMetricCard = {
  label: string
  value: string
  accent: string
}

type AdminSectionKey = 'availability' | 'pending' | 'history' | 'clientWorkspace'

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
}: AdminAvailabilityManagerProps) {
  const { minDate, maxDate } = useMemo(() => getWindowLimits(), [])
  const [dayDate, setDayDate] = useState(minDate)
  const [slotDrafts, setSlotDrafts] = useState<Record<number, SlotDraft>>({})
  const [editingSlotIds, setEditingSlotIds] = useState<Record<number, boolean>>({})
  const [editingSlotDrafts, setEditingSlotDrafts] = useState<Record<number, SlotDraft>>({})
  const [focusedSection, setFocusedSection] = useState<AdminSectionKey | null>(null)

  const activeSlotCount = useMemo(
    () => days.reduce((total, day) => total + day.slots.filter((slot) => slot.is_active).length, 0),
    [days],
  )
  const completedCount = useMemo(
    () => history.filter((item) => item.meeting_status === 'completed').length,
    [history],
  )
  const transcriptCount = useMemo(() => history.filter((item) => item.has_transcript).length, [history])
  const cancelledCount = useMemo(
    () => history.filter((item) => item.status === 'cancelled_by_admin').length,
    [history],
  )
  const activeClientCount = useMemo(
    () => clientWorkspaces.filter((item) => item.has_client_access).length,
    [clientWorkspaces],
  )

  const metrics = useMemo<AdminMetricCard[]>(
    () => [
      {
        label: 'Pendentes',
        value: String(pendingReviewItems.length),
        accent: 'border-amber-300/20 bg-amber-500/10 text-amber-100',
      },
      {
        label: 'Dias ativos',
        value: String(days.length),
        accent: 'border-cyan-300/20 bg-cyan-500/10 text-cyan-100',
      },
      {
        label: 'Horários ativos',
        value: String(activeSlotCount),
        accent: 'border-indigo-300/20 bg-indigo-500/10 text-indigo-100',
      },
      {
        label: 'Com transcrição',
        value: String(transcriptCount),
        accent: 'border-emerald-300/20 bg-emerald-500/10 text-emerald-100',
      },
      {
        label: 'Concluídas',
        value: String(completedCount),
        accent: 'border-fuchsia-300/20 bg-fuchsia-500/10 text-fuchsia-100',
      },
      {
        label: 'Canceladas',
        value: String(cancelledCount),
        accent: 'border-rose-300/20 bg-rose-500/10 text-rose-100',
      },
      {
        label: 'Clientes ativos',
        value: String(activeClientCount),
        accent: 'border-teal-300/20 bg-teal-500/10 text-teal-100',
      },
    ],
    [activeClientCount, activeSlotCount, cancelledCount, completedCount, days.length, pendingReviewItems.length, transcriptCount],
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

  const clearFocus = () => setFocusedSection(null)
  const focusAvailability = () => setFocusedSection('availability')
  const focusPending = () => setFocusedSection('pending')
  const focusHistory = () => setFocusedSection('history')
  const focusClientWorkspace = () => setFocusedSection('clientWorkspace')

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

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] xl:items-start">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
            {metrics.map((metric) => (
              <article key={metric.label} className={`rounded-[1.3rem] border p-4 ${metric.accent}`}>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em]">{metric.label}</p>
                <p className="mt-3 text-3xl font-semibold text-white">{metric.value}</p>
              </article>
            ))}
          </div>

          <form onSubmit={createDayHandler} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 lg:p-5">
            <label htmlFor="admin-day-date" className="mb-2 block text-sm font-medium text-slate-200">
              Liberar ou atualizar dia
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
        />
      ) : null}
    </div>
  )
}