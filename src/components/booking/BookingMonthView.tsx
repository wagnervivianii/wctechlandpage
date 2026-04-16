import { useMemo } from 'react'

import type { AvailabilitySlot, CalendarMonth } from '../../types/booking'
import { buildBookingMonthGrids, getBookingWeekDayHeaders } from '../../utils/bookingCalendarView'

import TimeSlotPicker from './TimeSlotPicker'

type BookingMonthViewProps = {
  months: CalendarMonth[]
  loading: boolean
  error: string
  selectedDate: string
  selectedDayLabel?: string
  slots: AvailabilitySlot[]
  loadingSlots: boolean
  slotsError: string
  selectedSlotId: string
  onSelectDate: (date: string) => void
  onSelectSlot: (slotId: string) => void
}

export default function BookingMonthView({
  months,
  loading,
  error,
  selectedDate,
  selectedDayLabel,
  slots,
  loadingSlots,
  slotsError,
  selectedSlotId,
  onSelectDate,
  onSelectSlot,
}: BookingMonthViewProps) {
  const monthGrids = useMemo(() => buildBookingMonthGrids(months), [months])
  const headers = getBookingWeekDayHeaders()

  if (loading) {
    return (
      <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-slate-900/65 p-5 text-sm text-slate-300">
        Carregando agenda disponível...
      </div>
    )
  }

  if (error) {
    return (
      <div className="mt-6 rounded-[1.4rem] border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-100">
        {error}
      </div>
    )
  }

  if (monthGrids.length === 0) {
    return (
      <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-slate-900/65 p-5 text-sm text-slate-300">
        Ainda não há dias disponíveis para agendamento.
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-5">
      {monthGrids.map((month) => (
        <article
          key={month.monthKey}
          className="rounded-[1.5rem] border border-white/10 bg-slate-900/65 p-4"
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
                  week.map((cell, dayIndex) => {
                    const isSelected = cell.date === selectedDate

                    return (
                      <button
                        key={`${month.monthKey}-${weekIndex}-${dayIndex}`}
                        type="button"
                        disabled={!cell.hasAvailability}
                        onClick={() => onSelectDate(isSelected ? '' : String(cell.date))}
                        className={`min-h-[160px] rounded-[1.2rem] border p-3 text-left transition ${
                          cell.hasAvailability
                            ? isSelected
                              ? 'border-cyan-300 bg-cyan-400/12 shadow-[0_0_0_1px_rgba(34,211,238,0.22)]'
                              : 'border-cyan-300/20 bg-cyan-400/8 hover:border-cyan-300/40 hover:bg-cyan-400/12'
                            : 'border-white/10 bg-slate-950/40'
                        } ${cell.inCurrentMonth ? '' : 'opacity-45'}`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-sm font-semibold text-white">{cell.dayNumber}</span>
                          {cell.hasAvailability ? (
                            <span className="rounded-full bg-cyan-400/12 px-2 py-1 text-[0.65rem] font-semibold text-cyan-200 ring-1 ring-cyan-300/25">
                              livre
                            </span>
                          ) : null}
                        </div>
                      </button>
                    )
                  }),
                )}
              </div>
            </div>
          </div>
        </article>
      ))}

      {selectedDate ? (
        <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Dia selecionado</p>
          <p className="mt-3 text-sm text-slate-200">
            {selectedDayLabel || selectedDate}
          </p>

          <TimeSlotPicker
            slots={slots}
            loading={loadingSlots}
            error={slotsError}
            selectedSlotId={selectedSlotId}
            onSelectSlot={onSelectSlot}
          />
        </div>
      ) : null}
    </div>
  )
}