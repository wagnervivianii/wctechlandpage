import { useMemo, useState } from 'react'

import type { AdminAvailabilityDayItem } from '../../types/admin'

type SlotDraft = {
  start_time: string
  end_time: string
  timezone_name: string
  is_active: boolean
}

type AdminAvailabilityManagerProps = {
  username: string
  days: AdminAvailabilityDayItem[]
  loadingDays: boolean
  submitting: boolean
  error: string
  successMessage: string
  onLogout: () => void
  onCreateDay: (date: string, isActive: boolean) => Promise<void>
  onToggleDay: (dayId: number, isActive: boolean) => Promise<void>
  onCreateSlot: (dayId: number, payload: SlotDraft) => Promise<void>
  onUpdateSlot: (slotId: number, payload: SlotDraft) => Promise<void>
  onDeleteSlot: (slotId: number) => Promise<void>
}

function getWindowLimits() {
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth(), 1)
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0)

  const format = (date: Date) => {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  return {
    minDate: format(start),
    maxDate: format(end),
  }
}

const defaultSlotDraft: SlotDraft = {
  start_time: '09:00',
  end_time: '10:00',
  timezone_name: 'America/Sao_Paulo',
  is_active: true,
}

export default function AdminAvailabilityManager({
  username,
  days,
  loadingDays,
  submitting,
  error,
  successMessage,
  onLogout,
  onCreateDay,
  onToggleDay,
  onCreateSlot,
  onUpdateSlot,
  onDeleteSlot,
}: AdminAvailabilityManagerProps) {
  const { minDate, maxDate } = useMemo(() => getWindowLimits(), [])
  const [dayDate, setDayDate] = useState(minDate)
  const [slotDrafts, setSlotDrafts] = useState<Record<number, SlotDraft>>({})
  const [editingSlotIds, setEditingSlotIds] = useState<Record<number, boolean>>({})
  const [editingSlotDrafts, setEditingSlotDrafts] = useState<Record<number, SlotDraft>>({})

  function getDraftForDay(dayId: number) {
    return slotDrafts[dayId] ?? defaultSlotDraft
  }

  function updateDraftForDay(dayId: number, nextDraft: SlotDraft) {
    setSlotDrafts((current) => ({ ...current, [dayId]: nextDraft }))
  }

  function startEditingSlot(slotId: number, draft: SlotDraft) {
    setEditingSlotIds((current) => ({ ...current, [slotId]: true }))
    setEditingSlotDrafts((current) => ({ ...current, [slotId]: draft }))
  }

  function stopEditingSlot(slotId: number) {
    setEditingSlotIds((current) => ({ ...current, [slotId]: false }))
    setEditingSlotDrafts((current) => {
      const next = { ...current }
      delete next[slotId]
      return next
    })
  }

  const createDayHandler: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault()
    await onCreateDay(dayDate, true)
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.38)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Painel administrativo</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">Gerenciar agenda liberada</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Aqui você define exatamente quais dias e horários ficarão visíveis no formulário público de
              pré-agendamento.
            </p>
            <p className="mt-3 text-sm text-slate-400">
              Sessão ativa como <span className="font-semibold text-slate-200">{username}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/agendar"
              className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
            >
              Ver agenda pública
            </a>
            <button
              type="button"
              onClick={onLogout}
              className="rounded-full bg-white/8 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-white/12"
            >
              Sair
            </button>
          </div>
        </div>

        {successMessage ? (
          <div className="mt-6 rounded-[1.4rem] border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            {successMessage}
          </div>
        ) : null}

        {error ? (
          <div className="mt-6 rounded-[1.4rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
            {error}
          </div>
        ) : null}

        <form onSubmit={createDayHandler} className="mt-6 rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="admin-day-date" className="mb-2 block text-sm font-medium text-slate-200">
                Liberar ou atualizar dia
              </label>
              <input
                id="admin-day-date"
                type="date"
                min={minDate}
                max={maxDate}
                value={dayDate}
                onChange={(event) => setDayDate(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300/40"
              />
              <p className="mt-2 text-xs text-slate-400">
                Permitimos apenas o mês atual e o próximo mês, igual à regra do backend.
              </p>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                disabled={submitting || !dayDate}
                className="w-full rounded-full bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/50 md:w-auto"
              >
                {submitting ? 'Salvando...' : 'Salvar dia'}
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        {loadingDays ? (
          <div className="rounded-[1.6rem] border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
            Carregando disponibilidade administrativa...
          </div>
        ) : null}

        {!loadingDays && days.length === 0 ? (
          <div className="rounded-[1.6rem] border border-white/10 bg-slate-900/75 p-5 text-sm text-slate-300">
            Nenhum dia foi liberado ainda. Escolha uma data acima para começar.
          </div>
        ) : null}

        {!loadingDays &&
          days.map((day) => {
            const dayDraft = getDraftForDay(day.id)

            return (
              <article
                key={day.id}
                className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur sm:p-6"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">
                      {day.weekday_label}
                    </p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{day.display_label}</h2>

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
                    </div>
                  </div>

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
                                      startEditingSlot(slot.id, {
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
                                  stopEditingSlot(slot.id)
                                }}
                              >
                                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                                  <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-200">Início</label>
                                    <input
                                      type="time"
                                      value={editingDraft.start_time}
                                      onChange={(event) =>
                                        setEditingSlotDrafts((current) => ({
                                          ...current,
                                          [slot.id]: {
                                            ...editingDraft,
                                            start_time: event.target.value,
                                          },
                                        }))
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
                                        setEditingSlotDrafts((current) => ({
                                          ...current,
                                          [slot.id]: {
                                            ...editingDraft,
                                            end_time: event.target.value,
                                          },
                                        }))
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
                                        setEditingSlotDrafts((current) => ({
                                          ...current,
                                          [slot.id]: {
                                            ...editingDraft,
                                            timezone_name: event.target.value,
                                          },
                                        }))
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
                                        setEditingSlotDrafts((current) => ({
                                          ...current,
                                          [slot.id]: {
                                            ...editingDraft,
                                            is_active: event.target.checked,
                                          },
                                        }))
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
                                    onClick={() => stopEditingSlot(slot.id)}
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
                    updateDraftForDay(day.id, defaultSlotDraft)
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
                          updateDraftForDay(day.id, {
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
                          updateDraftForDay(day.id, {
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
                          updateDraftForDay(day.id, {
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
                          updateDraftForDay(day.id, {
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
              </article>
            )
          })}
      </section>
    </div>
  )
}