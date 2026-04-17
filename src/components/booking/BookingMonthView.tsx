import { useMemo } from 'react'

import type { AvailabilitySlot, CalendarMonth } from '../../types/booking'
import { buildBookingMonthGrids, getBookingCalendarHeaders } from '../../utils/bookingCalendarView'

import BookingSelectedDayPanel from './BookingSelectedDayPanel'

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
        <section
          key={month.monthKey}
          className="rounded-[1.4rem] border border-white/10 bg-slate-900/65 p-3 sm:p-4 lg:p-5"
        >
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
              Mês
            </p>
            <h3 className="mt-2 text-base font-semibold capitalize text-white sm:text-lg">
              {month.monthLabel}
            </h3>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2 lg:gap-3">
            {headers.map((header) => (
              <div
                key={`${month.monthKey}-${header}`}
                className="rounded-xl border border-white/10 bg-slate-950/50 px-1 py-2 text-center text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-slate-400 sm:px-2 sm:text-[0.7rem]"
              >
                {header}
              </div>
            ))}

            {month.cells.map((cell) => (
              <button
                key={cell.cellKey}
                type="button"
                disabled={!cell.hasAvailability}
                onClick={() => onSelectDate(cell.date)}
                className={`aspect-square rounded-[0.95rem] border p-1.5 text-left transition sm:p-2.5 ${
                  cell.hasAvailability
                    ? 'border-cyan-300/20 bg-cyan-400/8 hover:border-cyan-300/40 hover:bg-cyan-400/12'
                    : 'border-white/10 bg-slate-950/40'
                } ${cell.inCurrentMonth ? '' : 'opacity-35'} disabled:cursor-default`}
              >
                <div className="flex h-full flex-col justify-between">
                  <p className="text-sm font-semibold text-white sm:text-base">{cell.dayNumber}</p>

                  {cell.hasAvailability ? (
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
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