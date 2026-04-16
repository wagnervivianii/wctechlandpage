type BookingHeaderProps = {
  selectedDayLabel?: string
}

export default function BookingHeader({ selectedDayLabel }: BookingHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">
          Disponibilidade real
        </p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Agenda dos próximos dois meses</h2>
      </div>
      {selectedDayLabel ? (
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 px-4 py-3 text-sm text-cyan-100">
          Dia escolhido: <span className="font-semibold">{selectedDayLabel}</span>
        </div>
      ) : null}
    </div>
  )
}
