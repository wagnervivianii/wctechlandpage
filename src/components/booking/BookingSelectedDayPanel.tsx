import type { AvailabilitySlot } from '../../types/booking'

import TimeSlotPicker from './TimeSlotPicker'

type BookingSelectedDayPanelProps = {
  selectedDayLabel?: string
  selectedDate: string
  slots: AvailabilitySlot[]
  loadingSlots: boolean
  slotsError: string
  selectedSlotId: string
  onSelectSlot: (slotId: string) => void
  onChangeDay: () => void
}

export default function BookingSelectedDayPanel({
  selectedDayLabel,
  selectedDate,
  slots,
  loadingSlots,
  slotsError,
  selectedSlotId,
  onSelectSlot,
  onChangeDay,
}: BookingSelectedDayPanelProps) {
  return (
    <section className="rounded-[1.5rem] border border-cyan-400/20 bg-cyan-400/8 p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
            Dia selecionado
          </p>
          <h3 className="mt-3 text-xl font-semibold text-white sm:text-2xl">
            {selectedDayLabel || selectedDate}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-cyan-100/80">
            Agora escolha um horário disponível para continuar.
          </p>
        </div>

        <div className="flex shrink-0">
          <button
            type="button"
            onClick={onChangeDay}
            className="rounded-full border border-white/12 bg-white/5 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/8"
          >
            Trocar dia
          </button>
        </div>
      </div>

      <div className="mt-5 rounded-[1.35rem] border border-white/10 bg-white/5 p-3 sm:p-4">
        <TimeSlotPicker
          slots={slots}
          loading={loadingSlots}
          error={slotsError}
          selectedSlotId={selectedSlotId}
          onSelectSlot={onSelectSlot}
        />
      </div>
    </section>
  )
}