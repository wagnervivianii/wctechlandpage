import type { CalendarDay, CalendarMonth } from '../types/booking'

export type BookingWeekCell = {
  cellKey: string
  date: string | null
  dayNumber: string
  weekdayLabel: string
  monthLabel: string
  hasAvailability: boolean
  inCurrentRange: boolean
}

export type BookingWeekGroup = {
  weekKey: string
  weekLabel: string
  cells: BookingWeekCell[]
}

export type BookingMonthCell = {
  cellKey: string
  date: string | null
  dayNumber: string
  hasAvailability: boolean
  inCurrentMonth: boolean
}

export type BookingMonthGrid = {
  monthKey: string
  monthLabel: string
  weeks: BookingMonthCell[][]
}

const weekdayHeaders = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

function safeDateFromIso(value: string) {
  return new Date(`${value}T12:00:00`)
}

function toIsoDate(value: Date) {
  const year = value.getFullYear()
  const month = `${value.getMonth() + 1}`.padStart(2, '0')
  const day = `${value.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

function startOfWeekMonday(date: Date) {
  const next = new Date(date)
  const day = next.getDay()
  const diff = day === 0 ? -6 : 1 - day
  next.setDate(next.getDate() + diff)
  return new Date(next.getFullYear(), next.getMonth(), next.getDate())
}

function endOfWeekSunday(date: Date) {
  const next = new Date(date)
  next.setDate(next.getDate() + 6)
  return new Date(next.getFullYear(), next.getMonth(), next.getDate())
}

function flattenCalendarDays(months: CalendarMonth[]) {
  return months.flatMap((month) => month.days)
}

function weekdayLabelFromDate(date: Date) {
  return date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '')
}

function monthLabelFromDate(date: Date) {
  return date.toLocaleDateString('pt-BR', { month: 'long' })
}

export function getBookingWeekDayHeaders() {
  return weekdayHeaders
}

export function buildBookingWeekGroups(months: CalendarMonth[]): BookingWeekGroup[] {
  const availableDays = flattenCalendarDays(months)
  if (availableDays.length === 0) {
    return []
  }

  const availabilityMap = new Map<string, CalendarDay>(
    availableDays.map((day) => [day.date, day]),
  )

  const sortedDates = [...availabilityMap.keys()].sort()
  const firstDate = safeDateFromIso(sortedDates[0])
  const lastDate = safeDateFromIso(sortedDates[sortedDates.length - 1])

  const gridStart = startOfWeekMonday(firstDate)
  const gridEnd = endOfWeekSunday(lastDate)

  const weeks: BookingWeekGroup[] = []
  const cursor = new Date(gridStart)

  while (cursor <= gridEnd) {
    const weekStart = new Date(cursor)
    const cells: BookingWeekCell[] = []

    for (let index = 0; index < 7; index += 1) {
      const cellDate = new Date(cursor)
      const isoDate = toIsoDate(cellDate)
      const availableDay = availabilityMap.get(isoDate)

      cells.push({
        cellKey: isoDate,
        date: isoDate,
        dayNumber: `${cellDate.getDate()}`,
        weekdayLabel: availableDay?.weekday_label ?? weekdayLabelFromDate(cellDate),
        monthLabel: availableDay?.month_label ?? monthLabelFromDate(cellDate),
        hasAvailability: Boolean(availableDay),
        inCurrentRange: cellDate >= firstDate && cellDate <= lastDate,
      })

      cursor.setDate(cursor.getDate() + 1)
    }

    const weekEnd = new Date(cursor)
    weekEnd.setDate(weekEnd.getDate() - 1)

    weeks.push({
      weekKey: toIsoDate(weekStart),
      weekLabel: `Semana de ${weekStart.toLocaleDateString('pt-BR')} a ${weekEnd.toLocaleDateString('pt-BR')}`,
      cells,
    })
  }

  return weeks.reverse()
}

export function buildBookingMonthGrids(months: CalendarMonth[]): BookingMonthGrid[] {
  const availableDays = flattenCalendarDays(months)
  const availabilityMap = new Map<string, CalendarDay>(
    availableDays.map((day) => [day.date, day]),
  )

  return months.map((month) => {
    const monthStart = new Date(month.year, month.month - 1, 1)
    const monthEnd = new Date(month.year, month.month, 0)

    const gridStart = startOfWeekMonday(monthStart)
    const gridEnd = endOfWeekSunday(monthEnd)

    const cells: BookingMonthCell[] = []
    const cursor = new Date(gridStart)

    while (cursor <= gridEnd) {
      const isoDate = toIsoDate(cursor)
      const availableDay = availabilityMap.get(isoDate)

      cells.push({
        cellKey: isoDate,
        date: isoDate,
        dayNumber: `${cursor.getDate()}`,
        hasAvailability: Boolean(availableDay),
        inCurrentMonth: cursor.getMonth() === month.month - 1,
      })

      cursor.setDate(cursor.getDate() + 1)
    }

    const weeks: BookingMonthCell[][] = []
    for (let index = 0; index < cells.length; index += 7) {
      weeks.push(cells.slice(index, index + 7))
    }

    return {
      monthKey: `${month.year}-${month.month}`,
      monthLabel: month.month_label,
      weeks,
    }
  })
}