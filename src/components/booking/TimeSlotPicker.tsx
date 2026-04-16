import type { AvailabilitySlot } from '../../types/booking'

type TimeSlotPickerProps = {
  slots: AvailabilitySlot[]
  loading: boolean
  error: string
  selectedSlotId: string
  onSelectSlot: (slotId: string) => void
}

export default function TimeSlotPicker({
  slots,
  loading,
  error,
  selectedSlotId,
  onSelectSlot,
}: TimeSlotPickerProps) {
  return (
    <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">Horários do dia</p>

      {loading ? <p className="mt-3 text-sm text-slate-300">Carregando horários...</p> : null}

      {error ? (
        <div className="mt-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      {!loading && !error && slots.length === 0 ? (
        <p className="mt-3 text-sm text-slate-300">Nenhum horário disponível para este dia.</p>
      ) : null}

      {!loading && !error && slots.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {slots.map((slot) => {
            const isSelected = String(slot.id) === selectedSlotId

            return (
              <button
                key={slot.id}
                type="button"
                onClick={() => onSelectSlot(String(slot.id))}
                className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
                  isSelected
                    ? 'border-cyan-300 bg-cyan-400/12 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.22)]'
                    : 'border-white/10 bg-slate-950/70 text-slate-200 hover:border-cyan-300/30 hover:bg-white/8'
                }`}
              >
                <p className="text-sm font-semibold uppercase tracking-[0.26em] text-cyan-300">
                  {slot.start_time} → {slot.end_time}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{slot.label}</p>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
