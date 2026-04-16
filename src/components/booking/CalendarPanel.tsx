import { memo } from 'react'

import type { CalendarMonth } from '../../types/booking'

import BookingHeader from './BookingHeader'

type CalendarPanelProps = {
  months: CalendarMonth[]
  loading: boolean
  error: string
  selectedDate: string
  selectedDayLabel?: string
  onSelectDate: (date: string) => void
}

function CalendarPanelComponent({
  months,
  loading,
  error,
  selectedDate,
  selectedDayLabel,
  onSelectDate,
}: CalendarPanelProps) {
  return (
    <section className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.34)] backdrop-blur sm:p-6">
      <BookingHeader selectedDayLabel={selectedDayLabel} />

      {loading ? (
        <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-slate-900/65 p-5 text-sm text-slate-300">
          Carregando agenda disponível...
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-[1.4rem] border border-rose-400/30 bg-rose-500/10 p-5 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {!loading && !error ? (
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

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {month.days.map((day) => {
                  const isSelected = day.date === selectedDate

                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => onSelectDate(day.date)}
                      className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
                        isSelected
                          ? 'border-cyan-300 bg-cyan-400/12 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.22)]'
                          : 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/30 hover:bg-white/8'
                      }`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                        {day.weekday_label}
                      </p>
                      <p className="mt-2 text-3xl font-semibold text-white">{day.day_label}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{day.month_label}</p>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}

const CalendarPanel = memo(CalendarPanelComponent)

export default CalendarPanel