import { useMemo, useState } from 'react'

import type { AdminAvailabilityDayItem, AdminBookingHistoryItem } from '../../types/admin'
import AdminAvailabilityDayCard from './AdminAvailabilityDayCard'
import AdminBookingHistorySection from './AdminBookingHistorySection'

type SlotDraft = {
  start_time: string
  end_time: string
  timezone_name: string
  is_active: boolean
}

type AdminAvailabilityManagerProps = {
  username: string
  days: AdminAvailabilityDayItem[]
  history: AdminBookingHistoryItem[]
  loadingDays: boolean
  submitting: boolean
  error: string
  successMessage: string
  onLogout: () => void
  onCreateDay: (date: string, isActive: boolean) => Promise<void>
  onToggleDay: (dayId: number, isActive: boolean) => Promise<void>
  onCreateSlot: (dayId: number, payload: SlotDraft) => Promise<void>
  onUpdateSlot: (slotId: number, payload: SlotDraft) => Promise<void>
  onDeleteSlot: (slotId: number) => Promise<void>
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

export default function AdminAvailabilityManager({
  username,
  days,
  history,
  loadingDays,
  submitting,
  error,
  successMessage,
  onLogout,
  onCreateDay,
  onToggleDay,
  onCreateSlot,
  onUpdateSlot,
  onDeleteSlot,
}: AdminAvailabilityManagerProps) {
  const { minDate, maxDate } = useMemo(() => getWindowLimits(), [])
  const [dayDate, setDayDate] = useState(minDate)
  const [openDayId, setOpenDayId] = useState<number | null>(null)
  const [slotDrafts, setSlotDrafts] = useState<Record<number, SlotDraft>>({})
  const [editingSlotIds, setEditingSlotIds] = useState<Record<number, boolean>>({})
  const [editingSlotDrafts, setEditingSlotDrafts] = useState<Record<number, SlotDraft>>({})

  function getDraftForDay(dayId: number) {
    return slotDrafts[dayId] ?? defaultSlotDraft
  }

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

  function toggleOpen(dayId: number) {
    setOpenDayId((current) => (current === dayId ? null : dayId))
  }

  const createDayHandler: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    await onCreateDay(dayDate, true)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.38)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Painel administrativo</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Gerenciar agenda liberada</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              A agenda ativa mostra apenas o que ainda pode acontecer. O histórico guarda apenas reuniões que
              realmente passaram pelo fluxo e já prepara a base para Meet, observações e transcrição.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Sessão ativa como <span className="font-semibold text-slate-200">{username}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
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

        <form onSubmit={createDayHandler} className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="admin-day-date" className="mb-2 block text-sm font-medium text-slate-200">
                Liberar ou atualizar dia
              </label>
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
              <p className="mt-2 text-xs text-slate-400">
                Dias e horários passados saem automaticamente da agenda ativa. O histórico guarda somente o que teve
                solicitação real.
              </p>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting || !dayDate}
                className="w-full rounded-full bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/50 md:w-auto"
              >
                {submitting ? 'Salvando...' : 'Salvar dia'}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Agenda ativa</p>
          <h2 className="mt-2 text-xl font-semibold text-white">Dias e horários ainda válidos</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">
            Aqui ficam apenas os dias futuros e os horários que ainda não passaram.
          </p>
        </div>

        {loadingDays ? (
          <div className="rounded-[1.6rem] border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
            Carregando disponibilidade administrativa...
          </div>
        ) : null}

        {!loadingDays && days.length === 0 ? (
          <div className="rounded-[1.6rem] border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
            Nenhum dia ativo disponível no momento. Você pode criar um novo dia acima.
          </div>
        ) : null}

        {!loadingDays &&
          days.map((day) => (
            <AdminAvailabilityDayCard
              key={day.id}
              day={day}
              isOpen={openDayId === day.id}
              submitting={submitting}
              dayDraft={getDraftForDay(day.id)}
              editingSlotIds={editingSlotIds}
              editingSlotDrafts={editingSlotDrafts}
              onToggleOpen={toggleOpen}
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
          ))}
      </section>

      <AdminBookingHistorySection history={history} />
    </div>
  )
}