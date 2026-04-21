import { useEffect, useMemo, useState } from 'react'

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
  isFocused?: boolean
  onRequestFocus?: () => void
  onClearFocus?: () => void
  onApprove: (bookingId: number, payload: AdminBookingApprovalPayload) => Promise<unknown>
  onReject: (bookingId: number, payload: AdminBookingRejectionPayload) => Promise<unknown>
}

export default function AdminPendingReviewSection({
  items,
  loading,
  submittingReviewId,
  error,
  successMessage,
  isFocused = false,
  onRequestFocus,
  onClearFocus,
  onApprove,
  onReject,
}: AdminPendingReviewSectionProps) {
  const [isOpen, setIsOpen] = useState(false)

  const sortedItems = useMemo(
    () => [...items].sort((left, right) => right.contact_confirmed_at.localeCompare(left.contact_confirmed_at)),
    [items],
  )

  useEffect(() => {
    if (isFocused) {
      setIsOpen(true)
    }
  }, [isFocused])

  function handleToggleSection() {
    setIsOpen((current) => {
      const next = !current
      if (next) {
        onRequestFocus?.()
      } else {
        onClearFocus?.()
      }
      return next
    })
  }

  return (
    <section className={`h-full rounded-[1.8rem] border bg-slate-900/80 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur ${isFocused ? 'border-cyan-300/30' : 'border-white/10'}`}>
      <button
        type="button"
        onClick={handleToggleSection}
        className="flex w-full items-start justify-between gap-4 rounded-[1.8rem] p-5 text-left transition hover:bg-white/5 sm:p-6"
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-amber-300">Triagem administrativa</p>
            {isFocused ? (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Em foco
              </span>
            ) : null}
          </div>
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
          <div className="mb-5 flex flex-col gap-3 rounded-[1.25rem] border border-cyan-300/15 bg-cyan-400/6 p-4 text-sm text-slate-200 sm:flex-row sm:items-center sm:justify-between">
            <p>
              Com a seção aberta, o painel entra em foco para evitar cards espremidos e manter a análise administrativa com mais clareza.
            </p>
            {isFocused ? (
              <button
                type="button"
                onClick={onClearFocus}
                className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-white transition hover:border-cyan-300/35 hover:bg-white/5"
              >
                Voltar ao painel completo
              </button>
            ) : null}
          </div>

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