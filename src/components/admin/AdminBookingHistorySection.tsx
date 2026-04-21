import { useEffect, useMemo, useState } from 'react'

import type { AdminBookingHistoryItem } from '../../types/admin'
import {
  getHistoryEventTimeLabel,
  getHistoryWeekDayHeaders,
  groupHistoryByDay,
  groupHistoryByMonth,
  groupHistoryByWeek,
  type HistoryViewMode,
} from '../../utils/adminHistory'
import AdminHistoryDayCard from './AdminHistoryDayCard'

type AdminBookingHistorySectionProps = {
  history: AdminBookingHistoryItem[]
  isFocused?: boolean
  onRequestFocus?: () => void
  onClearFocus?: () => void
}

function EventChip({ item }: { item: AdminBookingHistoryItem }) {
  const isCancelled = item.status === 'cancelled_by_admin'
  const isCompleted = item.meeting_status === 'completed'

  return (
    <a
      href={`/admin/historico/${item.id}`}
      className="block rounded-xl border border-white/10 bg-slate-950/70 px-3 py-2 text-left transition hover:border-cyan-300/30 hover:bg-white/8"
    >
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.26em] text-cyan-300">
        {getHistoryEventTimeLabel(item)}
      </p>
      <p className="mt-1 truncate text-sm font-medium text-white">{item.name}</p>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {isCancelled ? (
          <span className="rounded-full bg-rose-500/12 px-2 py-1 text-[0.62rem] font-semibold text-rose-100 ring-1 ring-rose-300/25">
            Cancelada
          </span>
        ) : null}

        {isCompleted ? (
          <span className="rounded-full bg-emerald-500/12 px-2 py-1 text-[0.62rem] font-semibold text-emerald-100 ring-1 ring-emerald-300/25">
            Concluída
          </span>
        ) : null}

        {isCancelled ? (
          <span className={`rounded-full px-2 py-1 text-[0.62rem] font-semibold ${item.google_calendar_cancelled ? 'bg-rose-500/12 text-rose-100 ring-1 ring-rose-300/25' : 'bg-white/8 text-slate-300 ring-1 ring-white/10'}`}>
            {item.google_calendar_cancelled ? 'Google ok' : 'Google pendente'}
          </span>
        ) : null}
      </div>
    </a>
  )
}


function WeekView({ history }: { history: AdminBookingHistoryItem[] }) {
  const weeks = useMemo(() => groupHistoryByWeek(history), [history])
  const headers = getHistoryWeekDayHeaders()

  if (weeks.length === 0) {
    return (
      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        Ainda não há reuniões registradas na agenda.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {weeks.map((week) => (
        <article
          key={week.weekKey}
          className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Semana</p>
            <h3 className="mt-2 text-lg font-semibold text-white">{week.weekLabel}</h3>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[720px]">
              <div className="grid grid-cols-7 gap-3">
                {headers.map((header) => (
                  <div
                    key={header}
                    className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"
                  >
                    {header}
                  </div>
                ))}

                {headers.map((_, index) => {
                  const dayGroup = week.days[index]
                  const items = dayGroup?.items ?? []

                  return (
                    <div
                      key={`${week.weekKey}-${index}`}
                      className={`min-h-[180px] rounded-[1.2rem] border p-3 ${
                        items.length > 0
                          ? 'border-cyan-300/20 bg-cyan-400/8'
                          : 'border-white/10 bg-slate-950/40'
                      }`}
                    >
                      <div className="mb-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                          {dayGroup ? dayGroup.dayLabel : 'Sem evento'}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {items.length > 0 ? (
                          items.map((item) => <EventChip key={item.id} item={item} />)
                        ) : (
                          <p className="text-sm text-slate-500">Nenhum evento</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function MonthView({ history }: { history: AdminBookingHistoryItem[] }) {
  const months = useMemo(() => groupHistoryByMonth(history), [history])
  const headers = getHistoryWeekDayHeaders()

  if (months.length === 0) {
    return (
      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
        Ainda não há reuniões registradas na agenda.
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {months.map((month) => (
        <article
          key={month.monthKey}
          className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Mês</p>
            <h3 className="mt-2 text-lg font-semibold capitalize text-white">{month.monthLabel}</h3>
          </div>

          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              <div className="grid grid-cols-7 gap-3">
                {headers.map((header) => (
                  <div
                    key={`${month.monthKey}-${header}`}
                    className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2 text-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-400"
                  >
                    {header}
                  </div>
                ))}

                {month.weeks.flatMap((week, weekIndex) =>
                  week.map((cell, dayIndex) => (
                    <div
                      key={`${month.monthKey}-${weekIndex}-${dayIndex}`}
                      className={`min-h-[160px] rounded-[1.2rem] border p-3 ${
                        cell.items.length > 0
                          ? 'border-cyan-300/20 bg-cyan-400/8'
                          : 'border-white/10 bg-slate-950/40'
                      } ${cell.inCurrentMonth ? '' : 'opacity-45'}`}
                    >
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-white">{cell.dayNumber}</span>
                        {cell.items.length > 0 ? (
                          <span className="rounded-full bg-cyan-400/12 px-2 py-1 text-[0.65rem] font-semibold text-cyan-200 ring-1 ring-cyan-300/25">
                            {cell.items.length}
                          </span>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        {cell.items.slice(0, 3).map((item) => (
                          <EventChip key={item.id} item={item} />
                        ))}

                        {cell.items.length > 3 ? (
                          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                            + {cell.items.length - 3} evento(s)
                          </p>
                        ) : null}
                      </div>
                    </div>
                  )),
                )}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

export default function AdminBookingHistorySection({
  history,
  isFocused = false,
  onRequestFocus,
  onClearFocus,
}: AdminBookingHistorySectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [viewMode, setViewMode] = useState<HistoryViewMode>('day')
  const [openDayKey, setOpenDayKey] = useState<string | null>(null)

  const dayGroups = useMemo(() => groupHistoryByDay(history), [history])
  const transcriptCount = history.filter((item) => item.has_transcript).length
  const completedCount = history.filter((item) => item.meeting_status === 'completed').length
  const cancelledCount = history.filter((item) => item.status === 'cancelled_by_admin').length

  useEffect(() => {
    if (isFocused) {
      setIsOpen(true)
    }
  }, [isFocused])

  function toggleMaster() {
    setIsOpen((current) => {
      const next = !current
      if (next) {
        onRequestFocus?.()
      } else {
        setOpenDayKey(null)
        onClearFocus?.()
      }
      return next
    })
  }

  function toggleDay(dayKey: string) {
    setOpenDayKey((current) => (current === dayKey ? null : dayKey))
  }

  return (
    <section className={`rounded-[1.8rem] border bg-slate-900/80 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur ${isFocused ? 'border-cyan-300/30' : 'border-white/10'}`}>      <button
        type="button"
        onClick={toggleMaster}
        className="flex w-full items-start justify-between gap-4 rounded-[1.8rem] p-5 text-left transition hover:bg-white/5 sm:p-6"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Histórico</p>
            {isFocused ? (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Em foco
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white">Reuniões registradas na agenda</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
              {history.length} registro{history.length !== 1 ? 's' : ''}
            </span>

            <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
              {completedCount} concluído{completedCount !== 1 ? 's' : ''}
            </span>

            <span className="rounded-full bg-rose-500/12 px-3 py-1 text-xs font-semibold text-rose-200 ring-1 ring-rose-400/25">
              {cancelledCount} cancelada{cancelledCount !== 1 ? 's' : ''}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                transcriptCount > 0
                  ? 'bg-cyan-400/12 text-cyan-200 ring-1 ring-cyan-300/25'
                  : 'bg-white/8 text-slate-300 ring-1 ring-white/10'
              }`}
            >
              {transcriptCount} com transcrição
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
              Com a seção aberta, o painel entra em foco para evitar cards espremidos e manter a leitura da agenda com mais clareza.
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

          <div className="mb-5 flex flex-wrap gap-2">
            {(['day', 'week', 'month'] as HistoryViewMode[]).map((mode) => {
              const isSelected = viewMode === mode
              const label = mode === 'day' ? 'Dia' : mode === 'week' ? 'Semana' : 'Mês'

              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => {
                    setViewMode(mode)
                    setOpenDayKey(null)
                  }}
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

          {viewMode === 'day' ? (
            dayGroups.length === 0 ? (
              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                Ainda não há reuniões registradas na agenda.
              </div>
            ) : (
              <div className="space-y-4">
                {dayGroups.map((group) => (
                  <AdminHistoryDayCard
                    key={group.dayKey}
                    dayKey={group.dayKey}
                    dayLabel={group.dayLabel}
                    items={group.items}
                    isOpen={openDayKey === group.dayKey}
                    onToggle={toggleDay}
                  />
                ))}
              </div>
            )
          ) : null}

          {viewMode === 'week' ? <WeekView history={history} /> : null}
          {viewMode === 'month' ? <MonthView history={history} /> : null}
        </div>
      ) : null}
    </section>
  )
}