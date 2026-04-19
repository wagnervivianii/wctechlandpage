import { useMemo, useState } from 'react'

import type { AdminClientWorkspaceSummaryItem } from '../../types/admin'

type AdminClientWorkspaceSectionProps = {
  items: AdminClientWorkspaceSummaryItem[]
  loading: boolean
  error: string
  isFocused?: boolean
  onRequestFocus?: () => void
  onClearFocus?: () => void
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '—'
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }

  return parsed.toLocaleString('pt-BR')
}

function getWorkspaceStatusLabel(status: string) {
  switch (status) {
    case 'activated':
      return 'Área ativada'
    case 'invited':
      return 'Convite enviado'
    case 'provisioned':
      return 'Área provisionada'
    default:
      return status
  }
}

function getWorkspaceStatusClasses(status: string) {
  switch (status) {
    case 'activated':
      return 'bg-emerald-500/12 text-emerald-100 ring-1 ring-emerald-300/25'
    case 'invited':
      return 'bg-cyan-400/12 text-cyan-100 ring-1 ring-cyan-300/25'
    default:
      return 'bg-white/8 text-slate-300 ring-1 ring-white/10'
  }
}

export default function AdminClientWorkspaceSection({
  items,
  loading,
  error,
  isFocused = false,
  onRequestFocus,
  onClearFocus,
}: AdminClientWorkspaceSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openWorkspaceIds, setOpenWorkspaceIds] = useState<Record<number, boolean>>({})

  const sortedItems = useMemo(
    () => [...items].sort((left, right) => right.created_at.localeCompare(left.created_at)),
    [items],
  )

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

  function toggleWorkspace(workspaceId: number) {
    setOpenWorkspaceIds((current) => ({ ...current, [workspaceId]: !current[workspaceId] }))
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
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-300">Portal do cliente</p>
            {isFocused ? (
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-cyan-200">
                Em foco
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-white lg:text-[1.9rem]">Clientes e documentos</h2>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${items.length > 0 ? 'bg-cyan-500/12 text-cyan-100 ring-cyan-300/25' : 'bg-white/8 text-slate-300 ring-white/10'}`}>
              {items.length} workspace{items.length !== 1 ? 's' : ''}
            </span>

            <span className="rounded-full bg-white/8 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-white/10">
              {items.filter((item) => item.has_client_access).length} cliente{items.filter((item) => item.has_client_access).length !== 1 ? 's' : ''} já acessaram
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
              Aqui você acompanha quem já ativou a área do cliente, abre o detalhe do evento, acessa o link do Meet e visualiza os materiais já sincronizados da reunião.
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

          {error ? (
            <div className="mb-5 rounded-[1.4rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
              {error}
            </div>
          ) : null}

          {loading ? (
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Carregando workspaces do cliente...
            </div>
          ) : null}

          {!loading && sortedItems.length === 0 ? (
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
              Nenhum workspace provisionado até o momento. Eles passarão a aparecer aqui depois das aprovações com portal habilitado.
            </div>
          ) : null}

          {!loading && sortedItems.length > 0 ? (
            <div className="space-y-4 lg:space-y-5">
              {sortedItems.map((item) => {
                const isWorkspaceOpen = Boolean(openWorkspaceIds[item.workspace_id])
                const latestMeeting = item.latest_meeting

                return (
                  <article key={item.workspace_id} className="rounded-[1.5rem] border border-white/10 bg-slate-950/60">
                    <button
                      type="button"
                      onClick={() => toggleWorkspace(item.workspace_id)}
                      className="flex w-full flex-col gap-4 rounded-[1.5rem] p-4 text-left transition hover:bg-white/5 sm:p-5"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300">
                            {item.primary_contact_name}
                          </p>
                          <h3 className="mt-2 break-all text-xl font-semibold text-white">{item.primary_contact_email}</h3>
                          <p className="mt-2 text-sm text-slate-400">{item.primary_contact_phone}</p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getWorkspaceStatusClasses(item.workspace_status)}`}>
                            {getWorkspaceStatusLabel(item.workspace_status)}
                          </span>

                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.has_client_access ? 'bg-emerald-500/12 text-emerald-100 ring-1 ring-emerald-300/25' : 'bg-white/8 text-slate-300 ring-1 ring-white/10'}`}>
                            {item.has_client_access ? 'Cliente já acessou' : 'Aguardando primeiro acesso'}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-3">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Criado em</p>
                          <p className="mt-2 text-sm text-white">{formatDateTime(item.created_at)}</p>
                        </div>
                        <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-3">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Último convite</p>
                          <p className="mt-2 text-sm text-white">{item.latest_invite_status ?? '—'}</p>
                        </div>
                        <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-3">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Acesso do cliente</p>
                          <p className="mt-2 text-sm text-white">{item.activated_at ? formatDateTime(item.activated_at) : item.latest_invite_accepted_at ? formatDateTime(item.latest_invite_accepted_at) : 'Ainda não acessou'}</p>
                        </div>
                        <div className="rounded-[1.1rem] border border-white/10 bg-white/5 p-3">
                          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">Reuniões</p>
                          <p className="mt-2 text-sm text-white">{item.meetings_count} vinculada{item.meetings_count !== 1 ? 's' : ''}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        {latestMeeting?.meet_url ? (
                          <a
                            href={latestMeeting.meet_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="rounded-full bg-cyan-400/12 px-4 py-2 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/18"
                          >
                            Abrir Meet
                          </a>
                        ) : null}

                        {latestMeeting?.booking_request_id ? (
                          <a
                            href={`/admin/historico/${latestMeeting.booking_request_id}`}
                            onClick={(event) => event.stopPropagation()}
                            className="rounded-full border border-white/12 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
                          >
                            Abrir evento
                          </a>
                        ) : null}

                        {latestMeeting?.recording_url ? (
                          <a
                            href={latestMeeting.recording_url}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(event) => event.stopPropagation()}
                            className="rounded-full border border-emerald-300/25 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-100 transition hover:bg-emerald-500/18"
                          >
                            Abrir documento da reunião
                          </a>
                        ) : null}
                      </div>
                    </button>

                    {isWorkspaceOpen ? (
                      <div className="border-t border-white/10 px-4 pb-4 pt-4 sm:px-5 sm:pb-5">
                        <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
                          <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Portal</p>
                            <p className="mt-3 text-sm leading-7 text-slate-200">
                              {item.portal_notes || 'Ainda não há observações internas registradas para este portal.'}
                            </p>

                            <div className="mt-4 space-y-2 text-sm text-slate-300">
                              <p>Convite enviado: {formatDateTime(item.latest_invite_sent_at)}</p>
                              <p>Convite aceito: {formatDateTime(item.latest_invite_accepted_at)}</p>
                            </div>
                          </div>

                          <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
                            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">Última reunião</p>
                            <p className="mt-3 text-sm font-semibold text-white">{latestMeeting?.meeting_label ?? 'Ainda não há reunião sincronizada.'}</p>
                            <p className="mt-3 text-sm leading-7 text-slate-200">
                              {latestMeeting?.transcript_summary || latestMeeting?.meeting_notes || 'Ainda não há resumo ou observações disponíveis para esta reunião.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </article>
                )
              })}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}