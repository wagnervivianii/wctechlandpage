import { useMemo, useState } from 'react'

import type {
  AdminBookingApprovalPayload,
  AdminBookingPendingReviewItem,
  AdminBookingRejectionPayload,
} from '../../types/admin'
import AdminPendingReviewCard from './AdminPendingReviewCard'

type AdminPendingReviewSectionProps = {
  items: AdminBookingPendingReviewItem[]
  loading: boolean
  submittingReviewId: number | null
  error: string
  successMessage: string
  onApprove: (bookingId: number, payload: AdminBookingApprovalPayload) => Promise<unknown>
  onReject: (bookingId: number, payload: AdminBookingRejectionPayload) => Promise<unknown>
}

export default function AdminPendingReviewSection({
  items,
  loading,
  submittingReviewId,
  error,
  successMessage,
  onApprove,
  onReject,
}: AdminPendingReviewSectionProps) {
  const [isOpen, setIsOpen] = useState(true)

  const sortedItems = useMemo(
    () => [...items].sort((left, right) => right.contact_confirmed_at.localeCompare(left.contact_confirmed_at)),
    [items],
  )

  return (
    <section className="h-full rounded-[1.8rem] border border-white/10 bg-slate-900/80 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-4 rounded-[1.8rem] p-5 text-left transition hover:bg-white/5 sm:p-6"
      >
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-300">Triagem administrativa</p>
          <h2 className="mt-3 text-2xl font-semibold text-white lg:text-[1.9rem]">Solicitações prontas</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                items.length > 0
                  ? 'bg-amber-500/12 text-amber-100 ring-amber-300/25'
                  : 'bg-white/8 text-slate-300 ring-white/10'
              }`}
            >
              {items.length} pendente{items.length !== 1 ? 's' : ''}
            </span>

            <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
              mais recentes primeiro
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
          {successMessage ? (
            <div className="mb-5 rounded-[1.4rem] border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
              {successMessage}
            </div>
          ) : null}

          {error ? (
            <div className="mb-5 rounded-[1.4rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Carregando solicitações prontas para revisão...
            </div>
          ) : null}

          {!loading && sortedItems.length === 0 ? (
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Nenhuma solicitação aguardando análise administrativa neste momento.
            </div>
          ) : null}

          {!loading && sortedItems.length > 0 ? (
            <div className="space-y-4 lg:space-y-5">
              {sortedItems.map((item) => (
                <AdminPendingReviewCard
                  key={item.id}
                  item={item}
                  submitting={submittingReviewId === item.id}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}