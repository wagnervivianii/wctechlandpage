import { useCallback, useMemo, useState } from 'react'

import BookingDayView from '../components/booking/BookingDayView'
import BookingForm from '../components/booking/BookingForm'
import BookingHeader from '../components/booking/BookingHeader'
import BookingHostCard from '../components/booking/BookingHostCard'
import BookingMonthView from '../components/booking/BookingMonthView'
import BookingViewModeSwitcher from '../components/booking/BookingViewModeSwitcher'
import BookingWeekView from '../components/booking/BookingWeekView'
import { useBookingCalendar } from '../hooks/useBookingCalendar'
import { useBookingForm } from '../hooks/useBookingForm'
import type { BookingViewMode } from '../types/booking'

export default function BookingPage() {
  const [viewMode, setViewMode] = useState<BookingViewMode>('day')

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
    refreshCalendarAndSlots,
  } = useBookingCalendar()

  const handleBookingSubmitSuccess = useCallback(async () => {
    handleSlotSelection('')
    await refreshCalendarAndSlots()
  }, [handleSlotSelection, refreshCalendarAndSlots])

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

  const shouldShowHeaderBadge = viewMode === 'day' && Boolean(selectedDayLabel)

  const calendarView = useMemo(() => {
    if (viewMode === 'week') {
      return (
        <BookingWeekView
          months={months}
          loading={loadingCalendar}
          error={calendarError}
          selectedDate={selectedDate}
          selectedDayLabel={selectedDayLabel}
          slots={slots}
          loadingSlots={loadingSlots}
          slotsError={slotsError}
          selectedSlotId={selectedSlotId}
          onSelectDate={handleCalendarDateSelection}
          onSelectSlot={handleTimeSlotSelection}
        />
      )
    }

    if (viewMode === 'month') {
      return (
        <BookingMonthView
          months={months}
          loading={loadingCalendar}
          error={calendarError}
          selectedDate={selectedDate}
          selectedDayLabel={selectedDayLabel}
          slots={slots}
          loadingSlots={loadingSlots}
          slotsError={slotsError}
          selectedSlotId={selectedSlotId}
          onSelectDate={handleCalendarDateSelection}
          onSelectSlot={handleTimeSlotSelection}
        />
      )
    }

    return (
      <BookingDayView
        months={months}
        loading={loadingCalendar}
        error={calendarError}
        selectedDate={selectedDate}
        slots={slots}
        loadingSlots={loadingSlots}
        slotsError={slotsError}
        selectedSlotId={selectedSlotId}
        onSelectDate={handleCalendarDateSelection}
        onSelectSlot={handleTimeSlotSelection}
      />
    )
  }, [
    viewMode,
    months,
    loadingCalendar,
    calendarError,
    selectedDate,
    selectedDayLabel,
    slots,
    loadingSlots,
    slotsError,
    selectedSlotId,
    handleCalendarDateSelection,
    handleTimeSlotSelection,
  ])

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

          <div className="mt-10 grid gap-6 xl:grid-cols-[1.02fr_0.98fr] xl:items-start">
            <section className="rounded-[1.8rem] border border-white/10 bg-white/5 p-5 shadow-[0_18px_60px_rgba(2,6,23,0.34)] backdrop-blur sm:p-6">
              <BookingHeader selectedDayLabel={shouldShowHeaderBadge ? selectedDayLabel : undefined} />

              <div className="mt-5 border-t border-white/10 pt-5">
                <BookingViewModeSwitcher value={viewMode} onChange={setViewMode} />
              </div>

              {calendarView}
            </section>

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
              slotsPicker={null}
            />
          </div>
        </main>
      </div>
    </div>
  )
}