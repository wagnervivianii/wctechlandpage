import { useMemo } from 'react'

import type { AvailabilitySlot, CalendarMonth } from '../../types/booking'
import { buildBookingWeekGroups, getBookingCalendarHeaders } from '../../utils/bookingCalendarView'

import BookingSelectedDayPanel from './BookingSelectedDayPanel'

type BookingWeekViewProps = {
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

export default function BookingWeekView({
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
}: BookingWeekViewProps) {
  const weeks = useMemo(() => buildBookingWeekGroups(months), [months])
  const headers = getBookingCalendarHeaders()

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

  if (selectedDate) {
    return (
      <div className="mt-6">
        <BookingSelectedDayPanel
          selectedDayLabel={selectedDayLabel}
          selectedDate={selectedDate}
          slots={slots}
          loadingSlots={loadingSlots}
          slotsError={slotsError}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
          onChangeDay={() => onSelectDate('')}
        />
      </div>
    )
  }

  if (weeks.length === 0) {
    return (
      <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-slate-900/65 p-5 text-sm text-slate-300">
        Ainda não há dias disponíveis para agendamento.
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-5">
      {weeks.map((week) => (
        <section
          key={week.weekKey}
          className="rounded-[1.4rem] border border-white/10 bg-slate-900/65 p-3 sm:p-4 lg:p-5"
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
              Semana
            </p>
            <h3 className="mt-2 text-base font-semibold text-white sm:text-lg">
              {week.weekLabel}
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 lg:gap-3">
            {headers.map((header) => (
              <div
                key={`${week.weekKey}-${header}`}
                className="rounded-xl border border-white/10 bg-slate-950/50 px-1.5 py-2 text-center text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:px-2 sm:text-[0.7rem]"
              >
                {header}
              </div>
            ))}

            {week.cells.map((cell) => (
              <button
                key={cell.cellKey}
                type="button"
                disabled={!cell.hasAvailability}
                onClick={() => onSelectDate(cell.date)}
                className={`aspect-[0.88] rounded-[1rem] border p-2 text-left transition sm:aspect-square sm:p-3 ${
                  cell.hasAvailability
                    ? 'border-emerald-300/35 bg-emerald-500/12 hover:border-emerald-300/55 hover:bg-emerald-500/18'
                    : 'border-white/10 bg-slate-950/40'
                } ${cell.inCurrentRange ? '' : 'opacity-35'} disabled:cursor-default`}
              >
                <div className="flex h-full flex-col justify-between">
                  <div>
                    <p className="text-sm font-semibold text-white sm:text-lg">{cell.dayNumber}</p>
                    <p className="mt-1 hidden text-xs text-slate-400 sm:block">
                      {cell.monthLabel}
                    </p>
                  </div>

                  {cell.hasAvailability ? (
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,0.85)]" />
                  ) : (
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-white/10" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}