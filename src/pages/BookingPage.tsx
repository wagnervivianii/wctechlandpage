import CalendarPanel from '../components/booking/CalendarPanel'
import BookingForm from '../components/booking/BookingForm'
import TimeSlotPicker from '../components/booking/TimeSlotPicker'
import { useBookingCalendar } from '../hooks/useBookingCalendar'
import { useBookingForm } from '../hooks/useBookingForm'

export default function BookingPage() {
  const {
    months,
    slots,
    selectedDate,
    selectedDay,
    selectedSlotId,
    loadingCalendar,
    loadingSlots,
    calendarError,
    slotsError,
    handleDateSelection,
    handleSlotSelection,
  } = useBookingCalendar()

  const {
    form,
    fieldErrors,
    loadingSubmit,
    submitError,
    successMessage,
    successPayload,
    summaryLength,
    handleNameChange,
    handleEmailChange,
    handlePhoneChange,
    handleSummaryChange,
    handleSubmit,
    clearMessages,
  } = useBookingForm({
    selectedSlotId,
    onSubmitSuccess: () => {
      handleSlotSelection('')
    },
  })

  const selectedDayLabel = selectedDay
    ? `${selectedDay.weekday_label}, ${selectedDay.day_label} de ${selectedDay.month_label}`
    : undefined

  const submitHandler: React.FormEventHandler<HTMLFormElement> = async (event) => {
    await handleSubmit(event)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="hero-shell">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-orb hero-orb-cyan" aria-hidden="true" />
        <div className="hero-orb hero-orb-blue" aria-hidden="true" />
        <div className="hero-orb hero-orb-violet" aria-hidden="true" />

        <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <a href="/" className="group flex min-w-0 items-center gap-3">
              <div className="logo-wrap shrink-0">
                <img
                  src="/imagens/logo.png"
                  alt="Logo da WV Tech Solutions"
                  className="h-11 w-11 rounded-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[0.72rem] font-semibold uppercase tracking-[0.42em] text-slate-50 sm:text-[0.78rem]">
                  WV Tech Solutions
                </p>
                <p className="hidden truncate text-sm text-slate-400 sm:block">
                  Pré-agendamento de diagnóstico
                </p>
              </div>
            </a>

            <div className="flex items-center gap-3">
              <a
                href="/"
                className="rounded-full border border-white/12 px-5 py-2.5 text-sm font-medium text-slate-100 transition hover:border-cyan-400/40 hover:bg-white/5"
              >
                Voltar ao site
              </a>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-24 lg:pt-14">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-4 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.14)] sm:text-[0.72rem]">
              <span className="h-2 w-2 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              Agenda WV Tech Solutions
            </div>

            <h1 className="mt-7 text-balance text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
              Escolha um dia disponível, selecione um horário e envie seu pré-agendamento.
            </h1>

            <p className="mt-5 text-pretty text-base leading-8 text-slate-300 sm:text-lg">
              Exibimos apenas o mês vigente e o próximo mês, com os dias e horários que você liberar na agenda da WV.
            </p>

            <div className="mx-auto mt-8 max-w-md sm:max-w-xl">
              <div className="rounded-[1.6rem] border border-white/10 bg-slate-900/75 p-4 shadow-[0_18px_60px_rgba(2,6,23,0.32)] backdrop-blur sm:p-5">
                <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:gap-5 sm:text-left">
                  <div className="h-24 w-24 shrink-0 overflow-hidden rounded-[1.4rem] border border-cyan-400/20 bg-slate-800 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                    <img
                      src="/images/wagner_agenda.webp"
                      alt="Wagner Viviani"
                      className="h-full w-full object-cover"
                      loading="lazy"
                      onError={(event) => {
                        const target = event.currentTarget

                        if (!target.dataset.fallbackStep) {
                          target.dataset.fallbackStep = '1'
                          target.src = '/images/wagner_agenda.jpg'
                          return
                        }

                        if (target.dataset.fallbackStep === '1') {
                          target.dataset.fallbackStep = '2'
                          target.src = '/imagens/wagner_agenda.webp'
                          return
                        }

                        if (target.dataset.fallbackStep === '2') {
                          target.dataset.fallbackStep = '3'
                          target.src = '/imagens/wagner_agenda.jpg'
                        }
                      }}
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-cyan-300 sm:text-[0.72rem]">
                      Quem conduzirá a conversa
                    </p>
                    <p className="mt-2 text-xl font-semibold text-white">Wagner Viviani</p>
                    <p className="mt-2 text-sm leading-7 text-slate-300">
                      Você falará diretamente com quem vai entender seu contexto, analisar o cenário atual e conduzir
                      o diagnóstico inicial da sua demanda.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <CalendarPanel
              months={months}
              loading={loadingCalendar}
              error={calendarError}
              selectedDate={selectedDate}
              selectedDayLabel={selectedDayLabel}
              onSelectDate={(date) => {
                clearMessages()
                handleDateSelection(date)
              }}
            />

            <BookingForm
              form={form}
              fieldErrors={fieldErrors}
              loadingSubmit={loadingSubmit}
              submitError={submitError}
              successMessage={successMessage}
              successPayload={successPayload}
              selectedSlotId={selectedSlotId}
              summaryLength={summaryLength}
              onNameChange={handleNameChange}
              onEmailChange={handleEmailChange}
              onPhoneChange={handlePhoneChange}
              onSummaryChange={handleSummaryChange}
              onSubmit={submitHandler}
              slotsPicker={
                <TimeSlotPicker
                  slots={slots}
                  loading={loadingSlots}
                  error={slotsError}
                  selectedSlotId={selectedSlotId}
                  onSelectSlot={(slotId) => {
                    clearMessages()
                    handleSlotSelection(slotId)
                  }}
                />
              }
            />
          </div>
        </main>
      </div>
    </div>
  )
}