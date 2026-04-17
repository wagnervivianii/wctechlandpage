import { useMemo, useState } from 'react'

import type {
  AdminBookingApprovalPayload,
  AdminBookingPendingReviewItem,
  AdminBookingRejectionPayload,
} from '../../types/admin'

type ReviewMode = 'approve' | 'reject' | null

type AdminPendingReviewCardProps = {
  item: AdminBookingPendingReviewItem
  submitting: boolean
  onApprove: (bookingId: number, payload: AdminBookingApprovalPayload) => Promise<unknown>
  onReject: (bookingId: number, payload: AdminBookingRejectionPayload) => Promise<unknown>
}

function formatDateTime(value: string | null) {
  if (!value) {
    return 'Não informado'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date)
}

function getScheduleLabel(item: AdminBookingPendingReviewItem) {
  if (!item.booking_date) {
    return item.display_label
  }

  const base = new Date(`${item.booking_date}T12:00:00`)
  const formattedDate = Number.isNaN(base.getTime())
    ? item.booking_date
    : new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
      }).format(base)

  if (item.start_time && item.end_time) {
    return `${formattedDate} • ${item.start_time.slice(0, 5)} às ${item.end_time.slice(0, 5)}`
  }

  return formattedDate
}

export default function AdminPendingReviewCard({
  item,
  submitting,
  onApprove,
  onReject,
}: AdminPendingReviewCardProps) {
  const [reviewMode, setReviewMode] = useState<ReviewMode>(null)
  const [meetUrl, setMeetUrl] = useState('')
  const [meetEventId, setMeetEventId] = useState('')
  const [meetingNotes, setMeetingNotes] = useState('')
  const [createClientWorkspace, setCreateClientWorkspace] = useState(true)
  const [createWorkspaceInvite, setCreateWorkspaceInvite] = useState(true)
  const [inviteTtlHours, setInviteTtlHours] = useState('168')
  const [portalNotes, setPortalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [rejectionNotes, setRejectionNotes] = useState('')

  const scheduleLabel = useMemo(() => getScheduleLabel(item), [item])

  async function handleApproveSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onApprove(item.id, {
      meet_url: meetUrl.trim() || null,
      meet_event_id: meetEventId.trim() || null,
      meeting_notes: meetingNotes.trim() || null,
      create_client_workspace: createClientWorkspace,
      create_workspace_invite: createClientWorkspace ? createWorkspaceInvite : false,
      invite_ttl_hours: Number(inviteTtlHours) || 168,
      portal_notes: portalNotes.trim() || null,
    })

    setReviewMode(null)
  }

  async function handleRejectSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    await onReject(item.id, {
      rejection_reason: rejectionReason.trim(),
      meeting_notes: rejectionNotes.trim() || null,
    })

    setReviewMode(null)
    setRejectionReason('')
    setRejectionNotes('')
  }

  return (
    <article className="rounded-[1.6rem] border border-white/10 bg-slate-950/55 p-4 shadow-[0_10px_30px_rgba(2,6,23,0.22)] sm:p-5 lg:p-6">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px] xl:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-400/12 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-amber-200 ring-1 ring-amber-300/20">
              aguardando análise
            </span>
            <span className="rounded-full bg-white/8 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-slate-300 ring-1 ring-white/10">
              #{item.id}
            </span>
          </div>

          <h3 className="mt-4 text-lg font-semibold text-white sm:text-xl">{item.name}</h3>
          <p className="mt-2 text-sm font-medium text-cyan-200">{scheduleLabel}</p>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Email</dt>
              <dd className="mt-1 break-all text-sm text-slate-100">{item.email}</dd>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Telefone</dt>
              <dd className="mt-1 text-sm text-slate-100">{item.phone}</dd>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-3 sm:col-span-2">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Assunto</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-100">{item.subject_summary}</dd>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Criado em</dt>
              <dd className="mt-1 text-sm text-slate-100">{formatDateTime(item.created_at)}</dd>
            </div>

            <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-3">
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-emerald-200">
                Email confirmado em
              </dt>
              <dd className="mt-1 text-sm text-emerald-50">{formatDateTime(item.contact_confirmed_at)}</dd>
            </div>
          </dl>
        </div>

        <aside className="flex w-full flex-col gap-3 xl:sticky xl:top-24">
          <div className="rounded-[1.35rem] border border-white/10 bg-white/5 p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-slate-400">Ações</p>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Em notebook, esta coluna concentra a decisão principal. No mobile, ela continua aparecendo logo abaixo do resumo do pedido.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setReviewMode((current) => (current === 'approve' ? null : 'approve'))}
            disabled={submitting}
            className="rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-400/50"
          >
            {submitting && reviewMode === 'approve' ? 'Aprovando...' : 'Aprovar'}
          </button>

          <button
            type="button"
            onClick={() => setReviewMode((current) => (current === 'reject' ? null : 'reject'))}
            disabled={submitting}
            className="rounded-full border border-rose-300/25 bg-rose-500/10 px-5 py-3 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20 disabled:cursor-not-allowed disabled:border-rose-300/10 disabled:bg-rose-500/5"
          >
            {submitting && reviewMode === 'reject' ? 'Rejeitando...' : 'Rejeitar'}
          </button>
        </aside>
      </div>

      {reviewMode === 'approve' ? (
        <form onSubmit={handleApproveSubmit} className="mt-5 space-y-4 rounded-[1.4rem] border border-emerald-300/20 bg-emerald-500/8 p-4 sm:p-5 lg:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200">Aprovação</p>
            <h4 className="mt-2 text-lg font-semibold text-white">Preparar reunião e portal do cliente</h4>
            <p className="mt-2 text-sm leading-6 text-slate-200">
              Você pode aprovar agora e já deixar a base pronta para o link do Meet, observações internas e acesso ao portal do cliente.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-100">Link do Google Meet</span>
              <input
                type="url"
                value={meetUrl}
                onChange={(event) => setMeetUrl(event.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/40"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-100">ID do evento</span>
              <input
                type="text"
                value={meetEventId}
                onChange={(event) => setMeetEventId(event.target.value)}
                placeholder="evt_123"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/40"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="mb-2 block text-sm font-medium text-slate-100">Observações internas</span>
              <textarea
                value={meetingNotes}
                onChange={(event) => setMeetingNotes(event.target.value)}
                rows={4}
                placeholder="Observações internas para a preparação da reunião."
                className="w-full rounded-[1.4rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/40"
              />
            </label>
          </div>

          <div className="rounded-[1.3rem] border border-white/10 bg-slate-950/50 p-4">
            <div className="flex flex-col gap-3">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={createClientWorkspace}
                  onChange={(event) => setCreateClientWorkspace(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-emerald-300"
                />
                <span className="block text-sm font-medium text-white">Provisionar portal do cliente</span>
              </label>

              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={createWorkspaceInvite}
                  onChange={(event) => setCreateWorkspaceInvite(event.target.checked)}
                  disabled={!createClientWorkspace}
                  className="mt-1 h-4 w-4 rounded border-white/20 bg-slate-950 text-emerald-300 disabled:opacity-50"
                />
                <span className="block text-sm font-medium text-white">Gerar convite inicial</span>
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-100">Validade do convite (horas)</span>
                <input
                  type="number"
                  min={1}
                  max={720}
                  value={inviteTtlHours}
                  onChange={(event) => setInviteTtlHours(event.target.value)}
                  disabled={!createClientWorkspace || !createWorkspaceInvite}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/40 disabled:opacity-50"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-medium text-slate-100">Notas do portal</span>
                <input
                  type="text"
                  value={portalNotes}
                  onChange={(event) => setPortalNotes(event.target.value)}
                  disabled={!createClientWorkspace}
                  placeholder="Base do cliente criada após aprovação."
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-300/40 disabled:opacity-50"
                />
              </label>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setReviewMode(null)}
              disabled={submitting}
              className="rounded-full border border-white/12 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-emerald-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-400/50"
            >
              {submitting ? 'Aprovando...' : 'Confirmar aprovação'}
            </button>
          </div>
        </form>
      ) : null}

      {reviewMode === 'reject' ? (
        <form onSubmit={handleRejectSubmit} className="mt-5 space-y-4 rounded-[1.4rem] border border-rose-300/20 bg-rose-500/8 p-4 sm:p-5 lg:p-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">Rejeição</p>
            <h4 className="mt-2 text-lg font-semibold text-white">Registrar motivo da recusa</h4>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-100">Motivo da rejeição</span>
            <textarea
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={4}
              minLength={5}
              required
              placeholder="Explique com clareza por que este pedido não será aprovado."
              className="w-full rounded-[1.4rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-300/40"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-100">Observações internas</span>
            <textarea
              value={rejectionNotes}
              onChange={(event) => setRejectionNotes(event.target.value)}
              rows={3}
              placeholder="Observações internas complementares."
              className="w-full rounded-[1.4rem] border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none transition focus:border-rose-300/40"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setReviewMode(null)}
              disabled={submitting}
              className="rounded-full border border-white/12 px-5 py-3 text-sm font-medium text-slate-100 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || rejectionReason.trim().length < 5}
              className="rounded-full border border-rose-300/25 bg-rose-500/85 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:border-rose-300/10 disabled:bg-rose-500/40"
            >
              {submitting ? 'Rejeitando...' : 'Confirmar rejeição'}
            </button>
          </div>
        </form>
      ) : null}
    </article>
  )
}