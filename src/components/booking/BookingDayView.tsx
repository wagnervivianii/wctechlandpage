import type { AvailabilitySlot, CalendarMonth } from '../../types/booking'

import TimeSlotPicker from './TimeSlotPicker'

type BookingDayViewProps = {
  months: CalendarMonth[]
  loading: boolean
  error: string
  selectedDate: string
  slots: AvailabilitySlot[]
  loadingSlots: boolean
  slotsError: string
  selectedSlotId: string
  onSelectDate: (date: string) => void
  onSelectSlot: (slotId: string) => void
}

export default function BookingDayView({
  months,
  loading,
  error,
  selectedDate,
  slots,
  loadingSlots,
  slotsError,
  selectedSlotId,
  onSelectDate,
  onSelectSlot,
}: BookingDayViewProps) {
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

  if (months.length === 0) {
    return (
      <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-slate-900/65 p-5 text-sm text-slate-300">
        Ainda não há dias disponíveis para agendamento.
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-5">
      {months.map((month) => (
        <div
          key={`${month.year}-${month.month}`}
          className="rounded-[1.4rem] border border-white/10 bg-slate-900/65 p-4 sm:p-5"
        >
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
              {month.month_label}
            </p>
            <p className="text-sm text-slate-400">
              {month.days.length} dia{month.days.length > 1 ? 's' : ''} liberado
              {month.days.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="mt-4 space-y-3">
            {month.days.map((day) => {
              const isOpen = selectedDate === day.date

              return (
                <article
                  key={day.date}
                  className="rounded-[1.25rem] border border-white/10 bg-white/5"
                >
                  <button
                    type="button"
                    onClick={() => onSelectDate(isOpen ? '' : day.date)}
                    className="flex w-full items-start justify-between gap-4 rounded-[1.25rem] p-4 text-left transition hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                        {day.weekday_label}
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-white">{day.day_label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{day.month_label}</p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-3">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-slate-300">
                        {isOpen ? 'Aberto' : 'Fechado'}
                      </span>
                      <span className="text-lg text-slate-300">{isOpen ? '−' : '+'}</span>
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-white/10 px-4 pb-4 pt-1">
                      <TimeSlotPicker
                        slots={slots}
                        loading={loadingSlots}
                        error={slotsError}
                        selectedSlotId={selectedSlotId}
                        onSelectSlot={onSelectSlot}
                      />
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}