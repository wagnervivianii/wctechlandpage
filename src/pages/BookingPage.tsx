import { useCallback, useMemo } from 'react'

import BookingHostCard from '../components/booking/BookingHostCard'
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

  const handleBookingSubmitSuccess = useCallback(() => {
    handleSlotSelection('')
  }, [handleSlotSelection])

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
    onSubmitSuccess: handleBookingSubmitSuccess,
  })

  const selectedDayLabel = useMemo(() => {
    if (!selectedDay) {
      return undefined
    }

    return `${selectedDay.weekday_label}, ${selectedDay.day_label} de ${selectedDay.month_label}`
  }, [selectedDay])

  const handleCalendarDateSelection = useCallback(
    (date: string) => {
      clearMessages()
      handleDateSelection(date)
    },
    [clearMessages, handleDateSelection],
  )

  const handleTimeSlotSelection = useCallback(
    (slotId: string) => {
      clearMessages()
      handleSlotSelection(slotId)
    },
    [clearMessages, handleSlotSelection],
  )

  const submitHandler: React.FormEventHandler<HTMLFormElement> = useCallback(
    async (event) => {
      await handleSubmit(event)
    },
    [handleSubmit],
  )

  const slotsPicker = useMemo(
    () => (
      <TimeSlotPicker
        slots={slots}
        loading={loadingSlots}
        error={slotsError}
        selectedSlotId={selectedSlotId}
        onSelectSlot={handleTimeSlotSelection}
      />
    ),
    [slots, loadingSlots, slotsError, selectedSlotId, handleTimeSlotSelection],
  )

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
              Confirmado o agendamento, você receberá o link do Meet por e-mail.
            </p>

            <BookingHostCard />
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <CalendarPanel
              months={months}
              loading={loadingCalendar}
              error={calendarError}
              selectedDate={selectedDate}
              selectedDayLabel={selectedDayLabel}
              onSelectDate={handleCalendarDateSelection}
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
              slotsPicker={slotsPicker}
            />
          </div>
        </main>
      </div>
    </div>
  )
}