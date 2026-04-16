import { useEffect, useMemo, useState } from 'react'

import { bookingApiClient } from '../services/BookingApiClient'
import type { AvailabilitySlot, CalendarDay, CalendarMonth } from '../types/booking'

function flattenCalendarDays(months: CalendarMonth[]) {
  return months.flatMap((month) => month.days)
}

export function useBookingCalendar() {
  const [months, setMonths] = useState<CalendarMonth[]>([])
  const [selectedDate, setSelectedDate] = useState('')
  const [slots, setSlots] = useState<AvailabilitySlot[]>([])
  const [selectedSlotId, setSelectedSlotId] = useState('')
  const [loadingCalendar, setLoadingCalendar] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [calendarError, setCalendarError] = useState('')
  const [slotsError, setSlotsError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadCalendar() {
      try {
        setLoadingCalendar(true)
        setCalendarError('')

        const data = await bookingApiClient.fetchCalendar()
        if (cancelled) return

        setMonths(data.months)

        const firstDay = flattenCalendarDays(data.months)[0]
        if (firstDay) {
          setSelectedDate((current) => current || firstDay.date)
        }
      } catch (error) {
        if (cancelled) return
        setCalendarError(
          error instanceof Error ? error.message : 'Não foi possível carregar a agenda agora.',
        )
      } finally {
        if (!cancelled) {
          setLoadingCalendar(false)
        }
      }
    }

    void loadCalendar()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadSlots() {
      if (!selectedDate) {
        setSlots([])
        setSelectedSlotId('')
        return
      }

      try {
        setLoadingSlots(true)
        setSlotsError('')

        const data = await bookingApiClient.fetchSlotsByDate(selectedDate)
        if (cancelled) return

        setSlots(data.slots)
        const firstSlot = data.slots[0]
        setSelectedSlotId(firstSlot ? String(firstSlot.id) : '')
      } catch (error) {
        if (cancelled) return
        setSlotsError(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os horários deste dia.',
        )
      } finally {
        if (!cancelled) {
          setLoadingSlots(false)
        }
      }
    }

    void loadSlots()
    return () => {
      cancelled = true
    }
  }, [selectedDate])

  const allDays = useMemo(() => flattenCalendarDays(months), [months])
  const selectedDay: CalendarDay | null = allDays.find((day) => day.date === selectedDate) ?? null

  function handleDateSelection(date: string) {
    setSelectedDate(date)
    setSelectedSlotId('')
  }

  function handleSlotSelection(slotId: string) {
    setSelectedSlotId(slotId)
  }

  return {
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
  }
}
