import { useMemo, useState } from 'react'

import type { AdminBookingCancellationPayload, AdminBookingDecisionResponse, AdminBookingHistoryItem } from '../../types/admin'
import {
  getHistoryEventTimeLabel,
  getMeetingStatusClasses,
  getMeetingStatusLabel,
} from '../../utils/adminHistory'

type AdminHistoryEventDetailProps = {
  history: AdminBookingHistoryItem[]
  eventId: number
  submitting?: boolean
  onCancel: (bookingId: number, payload: AdminBookingCancellationPayload) => Promise<AdminBookingDecisionResponse>
}

function isCancelable(item: AdminBookingHistoryItem) {
  return item.status === 'approved' && !['completed', 'cancelled', 'no_show'].includes(item.meeting_status)
}

export default function AdminHistoryEventDetail({
  history,
  eventId,
  submitting = false,
  onCancel,
}: AdminHistoryEventDetailProps) {
  const foundItem = history.find((entry) => entry.id === eventId)
  const [showCancelForm, setShowCancelForm] = useState(false)
  const [cancellationReason, setCancellationReason] = useState('')
  const [meetingNotes, setMeetingNotes] = useState('')
  const [feedbackError, setFeedbackError] = useState('')
  const [feedbackSuccess, setFeedbackSuccess] = useState('')

  const canCancel = useMemo(() => (foundItem ? isCancelable(foundItem) : false), [foundItem])

  if (!foundItem) {
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
            Voltar ao admin
          </a>
        </div>
      </section>
    )
  }

  const item = foundItem

  async function handleCancelSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFeedbackError('')
    setFeedbackSuccess('')
    try {
      const response = await onCancel(item.id, {
        cancellation_reason: cancellationReason.trim() || null,
        meeting_notes: meetingNotes.trim() || null,
      })
      setFeedbackSuccess(`Reunião de ${response.name} cancelada com sucesso.`)
      setShowCancelForm(false)
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : 'Não foi possível cancelar a reunião.')
    }
  }

  return (
    <section className="space-y-6">
      <section className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Evento registrado</p>
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

            {canCancel ? (
              <button
                type="button"
                onClick={() => setShowCancelForm((current) => !current)}
                className="rounded-full border border-rose-300/25 bg-rose-500/10 px-5 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20"
              >
                Cancelar reunião
              </button>
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

          {item.has_transcript ? (
            <span className="rounded-full bg-emerald-500/12 px-3 py-1 text-xs font-semibold text-emerald-200 ring-1 ring-emerald-400/25">
              Com transcrição
            </span>
          ) : null}
        </div>

        {feedbackError ? (
          <div className="mt-5 rounded-[1.2rem] border border-rose-300/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {feedbackError}
          </div>
        ) : null}

        {feedbackSuccess ? (
          <div className="mt-5 rounded-[1.2rem] border border-emerald-300/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {feedbackSuccess}
          </div>
        ) : null}

        {showCancelForm && canCancel ? (
          <form onSubmit={handleCancelSubmit} className="mt-5 space-y-4 rounded-[1.4rem] border border-rose-300/20 bg-rose-500/8 p-4 sm:p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">Cancelamento</p>
              <h4 className="mt-2 text-lg font-semibold text-white">Cancelar esta reunião agendada</h4>
              <p className="mt-2 text-sm leading-6 text-slate-200">
                O evento será desativado no Google Calendar, o link do Meet deixará de ser tratado como ativo e o cliente receberá um e-mail no padrão da WV Tech Solutions.
              </p>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-100">Motivo enviado ao cliente</span>
              <textarea
                value={cancellationReason}
                onChange={(event) => setCancellationReason(event.target.value)}
                rows={3}
                placeholder="Explique de forma breve o motivo do cancelamento."
                className="w-full rounded-[1.4rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-300/40"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-100">Observações internas</span>
              <textarea
                value={meetingNotes}
                onChange={(event) => setMeetingNotes(event.target.value)}
                rows={3}
                placeholder="Observações internas adicionais sobre este cancelamento."
                className="w-full rounded-[1.4rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-300/40"
              />
            </label>

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setShowCancelForm(false)}
                disabled={submitting}
                className="rounded-full border border-white/12 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full border border-rose-300/25 bg-rose-500/85 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:bg-rose-500/40"
              >
                {submitting ? 'Cancelando...' : 'Confirmar cancelamento'}
              </button>
            </div>
          </form>
        ) : null}
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