import type { AdminBookingHistoryItem } from '../../types/admin'
import {
  getHistoryEventTimeLabel,
  getMeetingStatusClasses,
  getMeetingStatusLabel,
} from '../../utils/adminHistory'

type AdminHistoryEventDetailProps = {
  history: AdminBookingHistoryItem[]
  eventId: number
}

export default function AdminHistoryEventDetail({
  history,
  eventId,
}: AdminHistoryEventDetailProps) {
  const item = history.find((entry) => entry.id === eventId)

  if (!item) {
    return (
      <section className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Evento</p>
        <h1 className="mt-3 text-3xl font-semibold text-white">Evento não encontrado</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">
          Não foi possível localizar este registro no histórico carregado.
        </p>

        <div className="mt-6">
          <a
            href="/admin"
            className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
          >
            Voltar para o admin
          </a>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-6">
      <section className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Evento do histórico</p>
            <h1 className="mt-3 text-3xl font-semibold text-white">{item.name}</h1>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              {item.display_label} • {getHistoryEventTimeLabel(item)}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="/admin"
              className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
            >
              Voltar ao admin
            </a>

            {item.meet_url ? (
              <a
                href={item.meet_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-full bg-cyan-400/12 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/18"
              >
                Abrir Meet
              </a>
            ) : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${getMeetingStatusClasses(item.meeting_status)}`}
          >
            {getMeetingStatusLabel(item.meeting_status)}
          </span>

          <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
            Solicitação: {item.status}
          </span>

          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              item.has_transcript
                ? 'bg-emerald-500/12 text-emerald-200 ring-1 ring-emerald-400/25'
                : 'bg-white/8 text-slate-300 ring-1 ring-white/10'
            }`}
          >
            {item.has_transcript ? 'Com transcrição' : 'Sem transcrição ainda'}
          </span>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Contato</p>
          <div className="mt-4 space-y-4 text-sm text-slate-200">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Nome</p>
              <p className="mt-2">{item.name}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Email</p>
              <p className="mt-2 break-all">{item.email}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Telefone</p>
              <p className="mt-2">{item.phone}</p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Criado em</p>
              <p className="mt-2">{new Date(item.created_at).toLocaleString('pt-BR')}</p>
            </div>
          </div>
        </article>

        <article className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur sm:p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Conteúdo</p>

          <div className="mt-5 rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Resumo do assunto</p>
            <p className="mt-3 text-sm leading-7 text-slate-200">{item.subject_summary}</p>
          </div>

          <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Observações internas</p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {item.meeting_notes || 'Ainda não há observações internas registradas para este evento.'}
            </p>
          </div>

          <div className="mt-4 rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">Resumo da transcrição</p>
            <p className="mt-3 text-sm leading-7 text-slate-200">
              {item.transcript_summary || 'Ainda não há resumo de transcrição vinculado a este evento.'}
            </p>
          </div>
        </article>
      </section>
    </section>
  )
}