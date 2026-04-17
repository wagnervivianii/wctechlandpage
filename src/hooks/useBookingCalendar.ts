import { useCallback, useEffect, useMemo, useState } from 'react'

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

  const loadCalendar = useCallback(async () => {
    setLoadingCalendar(true)
    setCalendarError('')

    try {
      const data = await bookingApiClient.fetchCalendar()
      const nextMonths = data.months
      const availableDays = flattenCalendarDays(nextMonths)

      setMonths(nextMonths)

      setSelectedDate((current) => {
        if (!availableDays.length) {
          return ''
        }

        if (current && availableDays.some((day) => day.date === current)) {
          return current
        }

        return availableDays[0]?.date ?? ''
      })
    } catch (error) {
      setCalendarError(
        error instanceof Error ? error.message : 'Não foi possível carregar a agenda agora.',
      )
    } finally {
      setLoadingCalendar(false)
    }
  }, [])

  const loadSlotsByDate = useCallback(async (date: string) => {
    if (!date) {
      setSlots([])
      setSelectedSlotId('')
      return
    }

    setLoadingSlots(true)
    setSlotsError('')

    try {
      const data = await bookingApiClient.fetchSlotsByDate(date)
      setSlots(data.slots)
      setSelectedSlotId((current) => {
        if (current && data.slots.some((slot) => String(slot.id) === current)) {
          return current
        }

        return data.slots[0] ? String(data.slots[0].id) : ''
      })
    } catch (error) {
      setSlotsError(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os horários deste dia.',
      )
      setSlots([])
      setSelectedSlotId('')
    } finally {
      setLoadingSlots(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function run() {
      try {
        setLoadingCalendar(true)
        setCalendarError('')

        const data = await bookingApiClient.fetchCalendar()
        if (cancelled) return

        const nextMonths = data.months
        const availableDays = flattenCalendarDays(nextMonths)

        setMonths(nextMonths)
        setSelectedDate((current) => {
          if (!availableDays.length) {
            return ''
          }

          if (current && availableDays.some((day) => day.date === current)) {
            return current
          }

          return availableDays[0]?.date ?? ''
        })
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

    void run()

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function run() {
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
        setSelectedSlotId((current) => {
          if (current && data.slots.some((slot) => String(slot.id) === current)) {
            return current
          }

          return data.slots[0] ? String(data.slots[0].id) : ''
        })
      } catch (error) {
        if (cancelled) return
        setSlotsError(
          error instanceof Error
            ? error.message
            : 'Não foi possível carregar os horários deste dia.',
        )
        setSlots([])
        setSelectedSlotId('')
      } finally {
        if (!cancelled) {
          setLoadingSlots(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [selectedDate])

  const refreshCalendarAndSlots = useCallback(async () => {
    setCalendarError('')
    setSlotsError('')

    const data = await bookingApiClient.fetchCalendar()
    const nextMonths = data.months
    const availableDays = flattenCalendarDays(nextMonths)

    setMonths(nextMonths)

    const nextSelectedDate =
      selectedDate && availableDays.some((day) => day.date === selectedDate)
        ? selectedDate
        : availableDays[0]?.date ?? ''

    setSelectedDate(nextSelectedDate)

    if (!nextSelectedDate) {
      setSlots([])
      setSelectedSlotId('')
      return
    }

    await loadSlotsByDate(nextSelectedDate)
  }, [loadSlotsByDate, selectedDate])

  const allDays = useMemo(() => flattenCalendarDays(months), [months])
  const selectedDay: CalendarDay | null = allDays.find((day) => day.date === selectedDate) ?? null

  const handleDateSelection = useCallback((date: string) => {
    setSelectedDate(date)
    setSelectedSlotId('')
  }, [])

  const handleSlotSelection = useCallback((slotId: string) => {
    setSelectedSlotId(slotId)
  }, [])

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
    refreshCalendarAndSlots,
    reloadCalendar: loadCalendar,
    reloadSlotsByDate: loadSlotsByDate,
  }
}