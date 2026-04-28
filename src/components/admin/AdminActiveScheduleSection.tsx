import { useEffect, useMemo, useState } from "react"

import type { AdminAvailabilityDayItem } from "../../types/admin"
import type { BookingViewMode, CalendarMonth } from "../../types/booking"
import {
  buildBookingMonthGrids,
  buildBookingWeekGroups,
  getBookingCalendarHeaders,
} from "../../utils/bookingCalendarView"
import AdminAvailabilityDayCard from "./AdminAvailabilityDayCard"

type SlotDraft = {
  start_time: string
  end_time: string
  timezone_name: string
  is_active: boolean
}

type AdminActiveScheduleSectionProps = {
  isFocused?: boolean
  onRequestFocus?: () => void
  onClearFocus?: () => void
  highlightDayId?: number | null
  days: AdminAvailabilityDayItem[]
  loadingDays: boolean
  submitting: boolean
  dayDrafts: Record<number, SlotDraft>
  editingSlotIds: Record<number, boolean>
  editingSlotDrafts: Record<number, SlotDraft>
  onToggleDay: (dayId: number, isActive: boolean) => Promise<void>
  onUpdateDraftForDay: (dayId: number, nextDraft: SlotDraft) => void
  onStartEditingSlot: (slotId: number, draft: SlotDraft) => void
  onStopEditingSlot: (slotId: number) => void
  onSetEditingSlotDraft: (slotId: number, nextDraft: SlotDraft) => void
  onCreateSlot: (dayId: number, payload: SlotDraft) => Promise<void>
  onUpdateSlot: (slotId: number, payload: SlotDraft) => Promise<void>
  onDeleteSlot: (slotId: number) => Promise<void>
  onResetDayDraft: (dayId: number) => void
}

function buildCalendarMonths(days: AdminAvailabilityDayItem[]): CalendarMonth[] {
  const map = new Map<string, CalendarMonth>()

  for (const day of days) {
    const [yearText, monthText] = day.date.split('-')
    const year = Number(yearText)
    const month = Number(monthText)
    const key = `${year}-${month}`

    if (!map.has(key)) {
      map.set(key, {
        year,
        month,
        month_label: day.month_label,
        days: [],
      })
    }

    map.get(key)?.days.push({
      date: day.date,
      weekday_label: day.weekday_label,
      day_label: day.day_label,
      month_label: day.month_label,
    })
  }

  return [...map.values()]
    .sort((left, right) => {
      if (left.year !== right.year) {
        return left.year - right.year
      }
      return left.month - right.month
    })
    .map((month) => ({
      ...month,
      days: [...month.days].sort((left, right) => left.date.localeCompare(right.date)),
    }))
}

function getActiveSlotCount(days: AdminAvailabilityDayItem[]) {
  return days.reduce((total, day) => total + day.slots.filter((slot) => slot.is_active).length, 0)
}

function AgendaDayList({
  days,
  openDayId,
  submitting,
  dayDrafts,
  editingSlotIds,
  editingSlotDrafts,
  onToggleOpen,
  onToggleDay,
  onUpdateDraftForDay,
  onStartEditingSlot,
  onStopEditingSlot,
  onSetEditingSlotDraft,
  onCreateSlot,
  onUpdateSlot,
  onDeleteSlot,
  onResetDayDraft,
}: {
  days: AdminAvailabilityDayItem[]
  openDayId: number | null
  submitting: boolean
  dayDrafts: Record<number, SlotDraft>
  editingSlotIds: Record<number, boolean>
  editingSlotDrafts: Record<number, SlotDraft>
  onToggleOpen: (dayId: number) => void
  onToggleDay: (dayId: number, isActive: boolean) => Promise<void>
  onUpdateDraftForDay: (dayId: number, nextDraft: SlotDraft) => void
  onStartEditingSlot: (slotId: number, draft: SlotDraft) => void
  onStopEditingSlot: (slotId: number) => void
  onSetEditingSlotDraft: (slotId: number, nextDraft: SlotDraft) => void
  onCreateSlot: (dayId: number, payload: SlotDraft) => Promise<void>
  onUpdateSlot: (slotId: number, payload: SlotDraft) => Promise<void>
  onDeleteSlot: (slotId: number) => Promise<void>
  onResetDayDraft: (dayId: number) => void
}) {
  return (
    <div className="space-y-4 lg:space-y-5">
      {days.map((day) => (
        <AdminAvailabilityDayCard
          key={day.id}
          day={day}
          isOpen={openDayId === day.id}
          submitting={submitting}
          dayDraft={dayDrafts[day.id] ?? {
            start_time: '09:00',
            end_time: '10:00',
            timezone_name: 'America/Sao_Paulo',
            is_active: true,
          }}
          editingSlotIds={editingSlotIds}
          editingSlotDrafts={editingSlotDrafts}
          onToggleOpen={onToggleOpen}
          onToggleDay={onToggleDay}
          onUpdateDraftForDay={onUpdateDraftForDay}
          onStartEditingSlot={onStartEditingSlot}
          onStopEditingSlot={onStopEditingSlot}
          onSetEditingSlotDraft={onSetEditingSlotDraft}
          onCreateSlot={onCreateSlot}
          onUpdateSlot={onUpdateSlot}
          onDeleteSlot={onDeleteSlot}
          onResetDayDraft={onResetDayDraft}
        />
      ))}
    </div>
  )
}

export default function AdminActiveScheduleSection({
  isFocused = false,
  onRequestFocus,
  onClearFocus,
  highlightDayId = null,
  days,
  loadingDays,
  submitting,
  dayDrafts,
  editingSlotIds,
  editingSlotDrafts,
  onToggleDay,
  onUpdateDraftForDay,
  onStartEditingSlot,
  onStopEditingSlot,
  onSetEditingSlotDraft,
  onCreateSlot,
  onUpdateSlot,
  onDeleteSlot,
  onResetDayDraft,
}: AdminActiveScheduleSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<BookingViewMode>('day')
  const [openDayId, setOpenDayId] = useState<number | null>(null)
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>('')

  const sortedDays = useMemo(() => [...days].sort((left, right) => left.date.localeCompare(right.date)), [days])
  const activeSlotCount = useMemo(() => getActiveSlotCount(sortedDays), [sortedDays])
  const months = useMemo(() => buildCalendarMonths(sortedDays), [sortedDays])
  const weekGroups = useMemo(() => buildBookingWeekGroups(months), [months])
  const monthGrids = useMemo(() => buildBookingMonthGrids(months), [months])
  const headers = getBookingCalendarHeaders()
  const dayByDate = useMemo(() => new Map(sortedDays.map((day) => [day.date, day])), [sortedDays])
  const selectedCalendarDay = selectedCalendarDate ? dayByDate.get(selectedCalendarDate) ?? null : null

  useEffect(() => {
    if (!isFocused) {
      return undefined
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsOpen(true)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [isFocused])

  useEffect(() => {
    if (highlightDayId === null) {
      return undefined
    }

    const frameId = window.requestAnimationFrame(() => {
      setIsOpen(true)
      setViewMode('day')
      setSelectedCalendarDate('')
      setOpenDayId(highlightDayId)
    })

    return () => window.cancelAnimationFrame(frameId)
  }, [highlightDayId])

  function handleToggleDayOpen(dayId: number) {
    setOpenDayId((current) => (current === dayId ? null : dayId))
  }

  function handleViewModeChange(nextMode: BookingViewMode) {
    setViewMode(nextMode)
    setSelectedCalendarDate('')
  }

  function renderSelectedCalendarDay() {
    if (!selectedCalendarDay) {
      return null
    }

    return (
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Detalhe do dia</p>
            <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">{selectedCalendarDay.display_label}</h3>
          </div>

          <button
            type="button"
            onClick={() => setSelectedCalendarDate('')}
            className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
          >
            Voltar ao calendário
          </button>
        </div>

        <AdminAvailabilityDayCard
          day={selectedCalendarDay}
          isOpen
          submitting={submitting}
          dayDraft={dayDrafts[selectedCalendarDay.id] ?? {
            start_time: '09:00',
            end_time: '10:00',
            timezone_name: 'America/Sao_Paulo',
            is_active: true,
          }}
          editingSlotIds={editingSlotIds}
          editingSlotDrafts={editingSlotDrafts}
          onToggleOpen={(dayId) => {
            if (selectedCalendarDay.id === dayId) {
              setSelectedCalendarDate('')
            }
          }}
          onToggleDay={onToggleDay}
          onUpdateDraftForDay={onUpdateDraftForDay}
          onStartEditingSlot={onStartEditingSlot}
          onStopEditingSlot={onStopEditingSlot}
          onSetEditingSlotDraft={onSetEditingSlotDraft}
          onCreateSlot={onCreateSlot}
          onUpdateSlot={onUpdateSlot}
          onDeleteSlot={onDeleteSlot}
          onResetDayDraft={onResetDayDraft}
        />
      </div>
    )
  }

  function renderDesktopCalendar() {
    if (viewMode === 'day') {
      return (
        <AgendaDayList
          days={sortedDays}
          openDayId={openDayId}
          submitting={submitting}
          dayDrafts={dayDrafts}
          editingSlotIds={editingSlotIds}
          editingSlotDrafts={editingSlotDrafts}
          onToggleOpen={handleToggleDayOpen}
          onToggleDay={onToggleDay}
          onUpdateDraftForDay={onUpdateDraftForDay}
          onStartEditingSlot={onStartEditingSlot}
          onStopEditingSlot={onStopEditingSlot}
          onSetEditingSlotDraft={onSetEditingSlotDraft}
          onCreateSlot={onCreateSlot}
          onUpdateSlot={onUpdateSlot}
          onDeleteSlot={onDeleteSlot}
          onResetDayDraft={onResetDayDraft}
        />
      )
    }

    if (viewMode === 'week') {
      return (
        <div className="space-y-5">
          {selectedCalendarDay ? renderSelectedCalendarDay() : null}

          {!selectedCalendarDay && weekGroups.length === 0 ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
              Nenhum dia disponível para visualizar por semana.
            </div>
          ) : null}

          {!selectedCalendarDay
            ? weekGroups.map((week) => (
                <section key={week.weekKey} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4 lg:p-5">
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">Semana</p>
                    <h3 className="mt-2 text-lg font-semibold text-white">{week.weekLabel}</h3>
                  </div>

                  <div className="grid grid-cols-7 gap-2 lg:gap-3">
                    {headers.map((header) => (
                      <div
                        key={`${week.weekKey}-${header}`}
                        className="rounded-xl border border-white/10 bg-slate-950/55 px-2 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:text-[0.72rem]"
                      >
                        {header}
                      </div>
                    ))}

                    {week.cells.map((cell) => {
                      const day = dayByDate.get(cell.date)
                      const slotCount = day?.slots.length ?? 0
                      const activeCount = day?.slots.filter((slot) => slot.is_active).length ?? 0

                      return (
                        <button
                          key={cell.cellKey}
                          type="button"
                          disabled={!day}
                          onClick={() => setSelectedCalendarDate(cell.date)}
                          className={`min-h-[124px] rounded-[1rem] border p-2 text-left transition lg:min-h-[144px] lg:p-3 ${
                            day
                              ? day.is_active
                                ? 'border-emerald-300/30 bg-emerald-500/10 hover:border-emerald-300/55 hover:bg-emerald-500/16'
                                : 'border-white/12 bg-white/5 hover:border-cyan-300/30 hover:bg-white/8'
                              : 'border-white/8 bg-slate-950/35'
                          } ${cell.inCurrentRange ? '' : 'opacity-35'} disabled:cursor-default`}
                        >
                          <div className="flex h-full flex-col justify-between gap-3">
                            <div>
                              <p className="text-base font-semibold text-white lg:text-lg">{cell.dayNumber}</p>
                              <p className="mt-1 text-[0.72rem] uppercase tracking-[0.16em] text-slate-400">{cell.weekdayLabel}</p>
                            </div>

                            {day ? (
                              <div className="space-y-2">
                                <span className="inline-flex rounded-full bg-white/8 px-2.5 py-1 text-[0.68rem] font-semibold text-slate-200 ring-1 ring-white/10">
                                  {slotCount} horário{slotCount !== 1 ? 's' : ''}
                                </span>
                                <div>
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-semibold ${
                                      activeCount > 0
                                        ? 'bg-emerald-500/12 text-emerald-200 ring-1 ring-emerald-400/25'
                                        : 'bg-white/8 text-slate-300 ring-1 ring-white/10'
                                    }`}
                                  >
                                    {activeCount > 0 ? `${activeCount} ativo${activeCount !== 1 ? 's' : ''}` : 'Sem slot ativo'}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white/10" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>
              ))
            : null}
        </div>
      )
    }

    return (
      <div className="space-y-5">
        {selectedCalendarDay ? renderSelectedCalendarDay() : null}

        {!selectedCalendarDay && monthGrids.length === 0 ? (
          <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
            Nenhum dia disponível para visualizar por mês.
          </div>
        ) : null}

        {!selectedCalendarDay
          ? monthGrids.map((month) => (
              <section key={month.monthKey} className="rounded-[1.5rem] border border-white/10 bg-slate-950/45 p-4 lg:p-5">
                <div className="mb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">Mês</p>
                  <h3 className="mt-2 text-lg font-semibold capitalize text-white">{month.monthLabel}</h3>
                </div>

                <div className="grid grid-cols-7 gap-2 lg:gap-3">
                  {headers.map((header) => (
                    <div
                      key={`${month.monthKey}-${header}`}
                      className="rounded-xl border border-white/10 bg-slate-950/55 px-2 py-2 text-center text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-slate-400 lg:text-[0.72rem]"
                    >
                      {header}
                    </div>
                  ))}

                  {month.cells.map((cell) => {
                    const day = dayByDate.get(cell.date)
                    const activeCount = day?.slots.filter((slot) => slot.is_active).length ?? 0

                    return (
                      <button
                        key={cell.cellKey}
                        type="button"
                        disabled={!day}
                        onClick={() => setSelectedCalendarDate(cell.date)}
                        className={`aspect-square rounded-[0.95rem] border p-2 text-left transition lg:p-2.5 ${
                          day
                            ? day.is_active
                              ? 'border-cyan-300/30 bg-cyan-400/10 hover:border-cyan-300/50 hover:bg-cyan-400/14'
                              : 'border-white/12 bg-white/5 hover:border-cyan-300/30 hover:bg-white/8'
                            : 'border-white/8 bg-slate-950/35'
                        } ${cell.inCurrentMonth ? '' : 'opacity-35'} disabled:cursor-default`}
                      >
                        <div className="flex h-full flex-col justify-between">
                          <p className="text-sm font-semibold text-white lg:text-base">{cell.dayNumber}</p>

                          {day ? (
                            <span
                              className={`inline-flex self-start rounded-full px-2 py-1 text-[0.62rem] font-semibold ${
                                activeCount > 0
                                  ? 'bg-cyan-400/12 text-cyan-200 ring-1 ring-cyan-300/25'
                                  : 'bg-white/8 text-slate-300 ring-1 ring-white/10'
                              }`}
                            >
                              {activeCount > 0 ? activeCount : '•'}
                            </span>
                          ) : (
                            <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white/10" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </section>
            ))
          : null}
      </div>
    )
  }

  function handleToggleSection() {
    setIsOpen((current) => {
      const next = !current
      if (next) {
        onRequestFocus?.()
      } else {
        onClearFocus?.()
      }
      return next
    })
  }

  return (
    <section className={`rounded-[1.8rem] border bg-slate-900/80 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur ${isFocused ? 'border-cyan-300/30' : 'border-white/10'}`}>
      <button
        type="button"
        onClick={handleToggleSection}
        className="flex w-full items-start justify-between gap-4 rounded-[1.8rem] p-5 text-left transition hover:bg-white/5 sm:p-6"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Agenda ativa</p>
            {isFocused ? (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Em foco
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white lg:text-[2rem]">Dias e horários válidos</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-cyan-400/12 px-3 py-1 text-xs font-semibold text-cyan-200 ring-1 ring-cyan-300/25">
              {days.length} dia{days.length !== 1 ? 's' : ''}
            </span>
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
              {activeSlotCount} horário{activeSlotCount !== 1 ? 's' : ''} ativo{activeSlotCount !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-3">
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
            {isOpen ? 'Aberto' : 'Fechado'}
          </span>
          <span className="text-lg text-slate-300">{isOpen ? '−' : '+'}</span>
        </div>
      </button>

      {isOpen ? (
        <div className="border-t border-white/10 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
          <div className="mb-5 flex flex-col gap-3 rounded-[1.25rem] border border-cyan-300/15 bg-cyan-400/6 p-4 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Ao expandir a agenda ativa, o painel prioriza esta seção para dar mais espaço aos dias, horários e controles administrativos.
            </p>
            {isFocused ? (
              <button
                type="button"
                onClick={onClearFocus}
                className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/5"
              >
                Voltar ao painel completo
              </button>
            ) : null}
          </div>
          {loadingDays ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
              Carregando disponibilidade administrativa...
            </div>
          ) : null}

          {!loadingDays && sortedDays.length === 0 ? (
            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/50 p-5 text-sm text-slate-300">
              Nenhum dia ativo disponível no momento.
            </div>
          ) : null}

          {!loadingDays && sortedDays.length > 0 ? (
            <>
              <div className="hidden items-center justify-between gap-4 md:flex">
                <div className="flex flex-wrap gap-2">
                  {(['day', 'week', 'month'] as BookingViewMode[]).map((mode) => {
                    const isSelected = viewMode === mode
                    const label = mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'

                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => handleViewModeChange(mode)}
                        className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                          isSelected
                            ? 'bg-cyan-400 text-slate-950'
                            : 'border border-white/12 bg-white/5 text-slate-100 hover:border-cyan-400/40 hover:bg-white/8'
                        }`}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>

                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                  Desktop e iPad
                </span>
              </div>

              <div className="mt-5 md:hidden">
                <AgendaDayList
                  days={sortedDays}
                  openDayId={openDayId}
                  submitting={submitting}
                  dayDrafts={dayDrafts}
                  editingSlotIds={editingSlotIds}
                  editingSlotDrafts={editingSlotDrafts}
                  onToggleOpen={handleToggleDayOpen}
                  onToggleDay={onToggleDay}
                  onUpdateDraftForDay={onUpdateDraftForDay}
                  onStartEditingSlot={onStartEditingSlot}
                  onStopEditingSlot={onStopEditingSlot}
                  onSetEditingSlotDraft={onSetEditingSlotDraft}
                  onCreateSlot={onCreateSlot}
                  onUpdateSlot={onUpdateSlot}
                  onDeleteSlot={onDeleteSlot}
                  onResetDayDraft={onResetDayDraft}
                />
              </div>

              <div className="mt-5 hidden md:block">{renderDesktopCalendar()}</div>
            </>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}