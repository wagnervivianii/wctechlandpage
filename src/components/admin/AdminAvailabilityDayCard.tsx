import type { AdminAvailabilityDayItem } from '../../types/admin'

type SlotDraft = {
  start_time: string
  end_time: string
  timezone_name: string
  is_active: boolean
}

type AdminAvailabilityDayCardProps = {
  day: AdminAvailabilityDayItem
  isOpen: boolean
  submitting: boolean
  dayDraft: SlotDraft
  editingSlotIds: Record<number, boolean>
  editingSlotDrafts: Record<number, SlotDraft>
  onToggleOpen: (dayId: number) => void
  onToggleDay: (dayId: number, isActive: boolean) => Promise<void>
  onUpdateDraftForDay: (dayId: number, nextDraft: SlotDraft) => void
  onStartEditingSlot: (slotId: number, draft: SlotDraft) => void
  onStopEditingSlot: (slotId: number) => void
  onSetEditingSlotDraft: (slotId: number, nextDraft: SlotDraft) => void
  onCreateSlot: (dayId: number, payload: SlotDraft) => Promise<void>
  onUpdateSlot: (slotId: number, payload: SlotDraft) => Promise<void>
  onDeleteSlot: (slotId: number) => Promise<void>
  onResetDayDraft: (dayId: number) => void
}

export default function AdminAvailabilityDayCard({
  day,
  isOpen,
  submitting,
  dayDraft,
  editingSlotIds,
  editingSlotDrafts,
  onToggleOpen,
  onToggleDay,
  onUpdateDraftForDay,
  onStartEditingSlot,
  onStopEditingSlot,
  onSetEditingSlotDraft,
  onCreateSlot,
  onUpdateSlot,
  onDeleteSlot,
  onResetDayDraft,
}: AdminAvailabilityDayCardProps) {
  return (
    <article className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur">
      <button
        type="button"
        onClick={() => onToggleOpen(day.id)}
        className="flex w-full items-start justify-between gap-4 rounded-[1.8rem] p-5 text-left transition hover:bg-white/5 sm:p-6"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">
            {day.weekday_label}
          </p>
          <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">{day.display_label}</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                day.is_active
                  ? 'bg-emerald-500/12 text-emerald-200 ring-1 ring-emerald-400/25'
                  : 'bg-rose-500/12 text-rose-200 ring-1 ring-rose-400/25'
              }`}
            >
              {day.is_active ? 'Dia ativo' : 'Dia inativo'}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                day.has_active_slots
                  ? 'bg-cyan-400/12 text-cyan-200 ring-1 ring-cyan-300/25'
                  : 'bg-white/8 text-slate-300 ring-1 ring-white/10'
              }`}
            >
              {day.has_active_slots ? 'Com horário ativo no público' : 'Sem horário ativo no público'}
            </span>

            <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
              {day.slots.length} horário{day.slots.length !== 1 ? 's' : ''}
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
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => onToggleDay(day.id, !day.is_active)}
              disabled={submitting}
              className={`rounded-full px-5 py-2.5 text-sm font-medium transition ${
                day.is_active
                  ? 'bg-rose-500/12 text-rose-100 hover:bg-rose-500/18'
                  : 'bg-emerald-500/12 text-emerald-100 hover:bg-emerald-500/18'
              } disabled:cursor-not-allowed disabled:opacity-60`}
            >
              {day.is_active ? 'Desativar dia' : 'Ativar dia'}
            </button>
          </div>

          <div className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">Horários</p>
              <p className="text-sm text-slate-400">
                {day.slots.length} horário{day.slots.length !== 1 ? 's' : ''}
              </p>
            </div>

            {day.slots.length === 0 ? (
              <p className="mt-4 text-sm text-slate-300">Nenhum horário cadastrado para este dia.</p>
            ) : (
              <div className="mt-4 space-y-3">
                {day.slots.map((slot) => {
                  const isEditing = Boolean(editingSlotIds[slot.id])
                  const editingDraft =
                    editingSlotDrafts[slot.id] ?? {
                      start_time: slot.start_time,
                      end_time: slot.end_time,
                      timezone_name: slot.timezone_name,
                      is_active: slot.is_active,
                    }

                  return (
                    <div
                      key={slot.id}
                      className="rounded-[1.2rem] border border-white/10 bg-slate-950/70 p-4"
                    >
                      {!isEditing ? (
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="text-lg font-semibold text-white">{slot.label}</p>
                            <p className="mt-2 text-sm text-slate-400">Timezone: {slot.timezone_name}</p>
                            <p className="mt-2 text-sm text-slate-300">
                              Status:{' '}
                              <span className={slot.is_active ? 'text-emerald-300' : 'text-rose-300'}>
                                {slot.is_active ? 'ativo' : 'inativo'}
                              </span>
                            </p>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="button"
                              onClick={() =>
                                onStartEditingSlot(slot.id, {
                                  start_time: slot.start_time,
                                  end_time: slot.end_time,
                                  timezone_name: slot.timezone_name,
                                  is_active: slot.is_active,
                                })
                              }
                              disabled={submitting}
                              className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Editar
                            </button>

                            <button
                              type="button"
                              onClick={() => onDeleteSlot(slot.id)}
                              disabled={submitting}
                              className="rounded-full bg-rose-500/12 px-4 py-2 text-sm font-medium text-rose-100 transition hover:bg-rose-500/18 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Remover
                            </button>
                          </div>
                        </div>
                      ) : (
                        <form
                          className="space-y-4"
                          onSubmit={async (event) => {
                            event.preventDefault()
                            await onUpdateSlot(slot.id, editingDraft)
                            onStopEditingSlot(slot.id)
                          }}
                        >
                          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-200">Início</label>
                              <input
                                type="time"
                                value={editingDraft.start_time}
                                onChange={(event) =>
                                  onSetEditingSlotDraft(slot.id, {
                                    ...editingDraft,
                                    start_time: event.target.value,
                                  })
                                }
                                required
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-200">Fim</label>
                              <input
                                type="time"
                                value={editingDraft.end_time}
                                onChange={(event) =>
                                  onSetEditingSlotDraft(slot.id, {
                                    ...editingDraft,
                                    end_time: event.target.value,
                                  })
                                }
                                required
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                              />
                            </div>

                            <div>
                              <label className="mb-2 block text-sm font-medium text-slate-200">Timezone</label>
                              <input
                                type="text"
                                value={editingDraft.timezone_name}
                                onChange={(event) =>
                                  onSetEditingSlotDraft(slot.id, {
                                    ...editingDraft,
                                    timezone_name: event.target.value,
                                  })
                                }
                                required
                                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                              />
                            </div>

                            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                              <input
                                type="checkbox"
                                checked={editingDraft.is_active}
                                onChange={(event) =>
                                  onSetEditingSlotDraft(slot.id, {
                                    ...editingDraft,
                                    is_active: event.target.checked,
                                  })
                                }
                                className="h-4 w-4 accent-cyan-300"
                              />
                              Horário ativo
                            </label>
                          </div>

                          <div className="flex flex-wrap gap-3">
                            <button
                              type="submit"
                              disabled={submitting}
                              className="rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/50"
                            >
                              Salvar edição
                            </button>

                            <button
                              type="button"
                              onClick={() => onStopEditingSlot(slot.id)}
                              disabled={submitting}
                              className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <form
            className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 p-4"
            onSubmit={async (event) => {
              event.preventDefault()
              await onCreateSlot(day.id, dayDraft)
              onResetDayDraft(day.id)
            }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-400">
              Adicionar horário
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Início</label>
                <input
                  type="time"
                  value={dayDraft.start_time}
                  onChange={(event) =>
                    onUpdateDraftForDay(day.id, {
                      ...dayDraft,
                      start_time: event.target.value,
                    })
                  }
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Fim</label>
                <input
                  type="time"
                  value={dayDraft.end_time}
                  onChange={(event) =>
                    onUpdateDraftForDay(day.id, {
                      ...dayDraft,
                      end_time: event.target.value,
                    })
                  }
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-200">Timezone</label>
                <input
                  type="text"
                  value={dayDraft.timezone_name}
                  onChange={(event) =>
                    onUpdateDraftForDay(day.id, {
                      ...dayDraft,
                      timezone_name: event.target.value,
                    })
                  }
                  required
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
                />
              </div>

              <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-200">
                <input
                  type="checkbox"
                  checked={dayDraft.is_active}
                  onChange={(event) =>
                    onUpdateDraftForDay(day.id, {
                      ...dayDraft,
                      is_active: event.target.checked,
                    })
                  }
                  className="h-4 w-4 accent-cyan-300"
                />
                Horário ativo
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 rounded-full bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/50"
            >
              {submitting ? 'Salvando horário...' : 'Cadastrar horário'}
            </button>
          </form>
        </div>
      ) : null}
    </article>
  )
}