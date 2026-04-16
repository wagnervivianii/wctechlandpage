import type { BookingFieldErrors, BookingRequestPayload, BookingRequestResponse } from '../../types/booking'

type BookingFormProps = {
  form: BookingRequestPayload
  fieldErrors: BookingFieldErrors
  loadingSubmit: boolean
  submitError: string
  successMessage: string
  successPayload: BookingRequestResponse | null
  selectedSlotId: string
  hasClientErrors: boolean
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
  hasClientErrors,
  summaryLength,
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onSummaryChange,
  onSubmit,
  slotsPicker,
}: BookingFormProps) {
  return (
    <section className="rounded-[1.8rem] border border-white/10 bg-slate-900/80 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.38)] backdrop-blur sm:p-6">
      <p className="text-xs font-semibold uppercase tracking-[0.34em] text-slate-400">Pré-agendamento</p>
      <h2 className="mt-3 text-2xl font-semibold text-white">Escolha um horário e envie seus dados</h2>
      <p className="mt-3 text-sm leading-7 text-slate-300">
        Depois do envio, o próximo passo será a confirmação por e-mail antes da análise final da solicitação.
      </p>

      {slotsPicker}

      {successMessage ? (
        <div className="mt-6 rounded-[1.4rem] border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
          <p className="font-semibold">{successMessage}</p>
          {successPayload?.slot ? (
            <p className="mt-2 text-emerald-50/90">
              Horário registrado: <span className="font-semibold">{successPayload.slot.label}</span>
            </p>
          ) : null}
        </div>
      ) : null}

      {submitError ? (
        <div className="mt-6 rounded-[1.4rem] border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-100">
          {submitError}
        </div>
      ) : null}

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
          <p className="mt-2 text-xs text-slate-400">Aceitamos letras, acentos, espaços e hífen. O nome será salvo em maiúsculas.</p>
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
            <p className="mt-2 text-xs text-slate-400">A validação real do e-mail acontecerá na etapa de confirmação por link.</p>
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
            <p className="mt-2 text-xs text-slate-400">Informe o número com DDD. A máscara é aplicada automaticamente.</p>
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
            placeholder="Explique brevemente o contexto, a dor atual e o que você gostaria de resolver."
            maxLength={500}
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-xs text-slate-400">Descreva o contexto em até 500 caracteres, apenas com texto e pontuação básica.</p>
            <p className={`text-xs ${summaryLength > 460 ? 'text-cyan-300' : 'text-slate-400'}`}>{summaryLength}/500</p>
          </div>
          {fieldErrors.subject_summary ? <p className="mt-2 text-xs text-rose-300">{fieldErrors.subject_summary}</p> : null}
        </div>

        <button
          type="submit"
          disabled={loadingSubmit || !selectedSlotId}
          className="w-full rounded-full bg-cyan-400 px-6 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-cyan-400/50"
        >
          {loadingSubmit ? 'Enviando pré-agendamento...' : 'Enviar pré-agendamento'}
        </button>
      </form>
    </section>
  )
}
