import type { BookingViewMode } from '../../types/booking'

type BookingViewModeSwitcherProps = {
  value: BookingViewMode
  onChange: (mode: BookingViewMode) => void
}

export default function BookingViewModeSwitcher({
  value,
  onChange,
}: BookingViewModeSwitcherProps) {
  const modes: { value: BookingViewMode; label: string }[] = [
    { value: 'day', label: 'Dia' },
    { value: 'week', label: 'Semana' },
    { value: 'month', label: 'Mês' },
  ]

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {modes.map((mode) => {
        const isSelected = value === mode.value

        return (
          <button
            key={mode.value}
            type="button"
            onClick={() => onChange(mode.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              isSelected
                ? 'bg-cyan-400 text-slate-950'
                : 'border border-white/12 bg-white/5 text-slate-100 hover:border-cyan-400/40 hover:bg-white/8'
            }`}
          >
            {mode.label}
          </button>
        )
      })}
    </div>
  )
}