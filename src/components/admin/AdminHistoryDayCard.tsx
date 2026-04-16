import type { AdminBookingHistoryItem } from '../../types/admin'
import {
  getHistoryEventTimeLabel,
  getMeetingStatusClasses,
  getMeetingStatusLabel,
} from '../../utils/adminHistory'

type AdminHistoryDayCardProps = {
  dayKey: string
  dayLabel: string
  items: AdminBookingHistoryItem[]
  isOpen: boolean
  onToggle: (dayKey: string) => void
}

export default function AdminHistoryDayCard({
  dayKey,
  dayLabel,
  items,
  isOpen,
  onToggle,
}: AdminHistoryDayCardProps) {
  const transcriptCount = items.filter((item) => item.has_transcript).length
  const completedCount = items.filter((item) => item.meeting_status === 'completed').length

  return (
    <article className="rounded-[1.6rem] border border-white/10 bg-white/5">
      <button
        type="button"
        onClick={() => onToggle(dayKey)}
        className="flex w-full items-start justify-between gap-4 rounded-[1.6rem] p-4 text-left transition hover:bg-white/5 sm:p-5"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Dia do histórico</p>
          <h3 className="mt-2 text-lg font-semibold text-white sm:text-xl">{dayLabel}</h3>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
              {items.length} evento{items.length !== 1 ? 's' : ''}
            </span>

            <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
              {completedCount} concluído{completedCount !== 1 ? 's' : ''}
            </span>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                transcriptCount > 0
                  ? 'bg-cyan-400/12 text-cyan-200 ring-1 ring-cyan-300/25'
                  : 'bg-white/8 text-slate-300 ring-1 ring-white/10'
              }`}
            >
              {transcriptCount} com transcrição
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
        <div className="border-t border-white/10 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
          <div className="space-y-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="rounded-[1.3rem] border border-white/10 bg-slate-950/60 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-300">
                      {getHistoryEventTimeLabel(item)}
                    </p>
                    <h4 className="mt-2 text-lg font-semibold text-white">{item.name}</h4>
                    <p className="mt-2 break-all text-sm text-slate-300">{item.email}</p>
                    <p className="mt-1 text-sm text-slate-400">{item.phone}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getMeetingStatusClasses(item.meeting_status)}`}
                    >
                      {getMeetingStatusLabel(item.meeting_status)}
                    </span>

                    <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
                      Solicitação: {item.status}
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-[1.15rem] border border-white/10 bg-white/5 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
                    Resumo do assunto
                  </p>
                  <p className="mt-3 text-sm leading-7 text-slate-200">{item.subject_summary}</p>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  <a
                    href={`/admin/historico/${item.id}`}
                    className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
                  >
                    Abrir detalhe do evento
                  </a>

                  {item.meet_url ? (
                    <a
                      href={item.meet_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-cyan-400/12 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/18"
                    >
                      Abrir Meet
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  )
}