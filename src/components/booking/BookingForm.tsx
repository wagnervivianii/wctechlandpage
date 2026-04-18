import type {
  BookingFieldErrors,
  BookingRequestPayload,
  BookingRequestResponse,
} from '../../types/booking'

function formatBookingDate(value: string) {
  const [year, month, day] = value.split('-')
  if (!year || !month || !day) {
    return ''
  }

  return `${day}/${month}/${year}`
}

function formatBookingTime(value: string) {
  if (!value) {
    return ''
  }

  return value.slice(0, 5)
}

function buildRecordedSlotLabel(successPayload: BookingRequestResponse | null) {
  if (!successPayload?.slot) {
    return ''
  }

  const dateLabel = formatBookingDate(successPayload.slot.date)
  const startLabel = formatBookingTime(successPayload.slot.start_time)
  const endLabel = formatBookingTime(successPayload.slot.end_time)

  if (dateLabel && startLabel && endLabel) {
    return `${dateLabel} • ${startLabel} às ${endLabel}`
  }

  return successPayload.slot.label
}

type BookingFormProps = {
  form: BookingRequestPayload
  fieldErrors: BookingFieldErrors
  loadingSubmit: boolean
  submitError: string
  successMessage: string
  successPayload: BookingRequestResponse | null
  selectedSlotId: string
  selectedDayLabel?: string
  selectedSlotLabel?: string
  summaryLength: number
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onPhoneChange: (value: string) => void
  onSummaryChange: (value: string) => void
  onSubmit: React.FormEventHandler<HTMLFormElement>
  slotsPicker: React.ReactNode
}

export default function BookingForm({
  form,
  fieldErrors,
  loadingSubmit,
  submitError,
  successMessage,
  successPayload,
  selectedSlotId,
  selectedDayLabel,
  selectedSlotLabel,
  summaryLength,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onSummaryChange,
  onSubmit,
  slotsPicker,
}: BookingFormProps) {
  const bookingSummaryLabel =
    selectedDayLabel && selectedSlotLabel
      ? `${selectedDayLabel} às ${selectedSlotLabel}`
      : selectedDayLabel || selectedSlotLabel

  const recordedSlotLabel = buildRecordedSlotLabel(successPayload)

  return (
    <section className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.38)] backdrop-blur sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">
        Pré-agendamento
      </p>
      <h2 className="mt-3 text-2xl font-semibold text-white">
        {successMessage ? 'Tudo certo por aqui' : 'Envie seus dados'}
      </h2>

      {bookingSummaryLabel && !successMessage ? (
        <div className="mt-5 rounded-[1.35rem] border border-cyan-400/20 bg-cyan-400/8 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-cyan-300">
            Reunião escolhida
          </p>
          <p className="mt-2 text-sm font-medium leading-7 text-cyan-50">{bookingSummaryLabel}</p>
        </div>
      ) : null}

      {slotsPicker}

      {successMessage ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-[1.4rem] border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <p className="font-semibold">{successMessage}</p>
            {recordedSlotLabel ? (
              <p className="mt-2 text-emerald-50/90">
                Horário registrado: <span className="font-semibold">{recordedSlotLabel}</span>
              </p>
            ) : null}
          </div>

          <div className="rounded-[1.4rem] border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            <p className="font-semibold">
              Para evitar duplicidade na agenda, um novo pedido só poderá ser realizado após a
              ocorrência desta reunião e a liberação de um novo agendamento pela nossa equipe.
            </p>
          </div>
        </div>
      ) : null}

      {submitError ? (
        <div className="mt-6 rounded-[1.4rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {submitError}
        </div>
      ) : null}

      {!successMessage ? (
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="booking-name" className="mb-2 block text-sm font-medium text-slate-200">
              Nome
            </label>
            <input
              id="booking-name"
              type="text"
              value={form.name}
              onChange={(event) => onNameChange(event.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
              placeholder="SEU NOME COMPLETO"
            />
            {fieldErrors.name ? <p className="mt-2 text-xs text-rose-300">{fieldErrors.name}</p> : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="booking-email" className="mb-2 block text-sm font-medium text-slate-200">
                E-mail
              </label>
              <input
                id="booking-email"
                type="email"
                value={form.email}
                onChange={(event) => onEmailChange(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
                placeholder="voce@empresa.com"
              />
              {fieldErrors.email ? <p className="mt-2 text-xs text-rose-300">{fieldErrors.email}</p> : null}
            </div>

            <div>
              <label htmlFor="booking-phone" className="mb-2 block text-sm font-medium text-slate-200">
                Telefone
              </label>
              <input
                id="booking-phone"
                type="tel"
                value={form.phone}
                onChange={(event) => onPhoneChange(event.target.value)}
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
                placeholder="(11) 99999-9999"
              />
              {fieldErrors.phone ? <p className="mt-2 text-xs text-rose-300">{fieldErrors.phone}</p> : null}
            </div>
          </div>

          <div>
            <label htmlFor="booking-summary" className="mb-2 block text-sm font-medium text-slate-200">
              Resumo do assunto
            </label>
            <textarea
              id="booking-summary"
              value={form.subject_summary}
              onChange={(event) => onSummaryChange(event.target.value)}
              required
              rows={6}
              className="w-full rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-7 text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300/40"
              placeholder="Explique com mais contexto o cenário atual, o problema, o impacto no negócio e o que você espera resolver com a reunião."
              maxLength={500}
            />
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs text-slate-400">Mínimo de 50 e máximo de 500 caracteres.</p>
              <p className={`text-xs ${summaryLength > 460 ? 'text-cyan-300' : 'text-slate-400'}`}>
                {summaryLength}/500
              </p>
            </div>
            {fieldErrors.subject_summary ? (
              <p className="mt-2 text-xs text-rose-300">{fieldErrors.subject_summary}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={loadingSubmit || !selectedSlotId}
            className="w-full rounded-full bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/50"
          >
            {loadingSubmit ? 'Enviando pré-agendamento...' : 'Enviar pré-agendamento'}
          </button>
        </form>
      ) : null}
    </section>
  )
}