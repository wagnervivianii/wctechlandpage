import type { CalendarDay, CalendarMonth } from '../types/booking'

export type BookingCalendarCell = {
  cellKey: string
  date: string
  dayNumber: string
  monthLabel: string
  weekdayLabel: string
  hasAvailability: boolean
  inCurrentMonth: boolean
  inCurrentRange: boolean
}

export type BookingWeekGroup = {
  weekKey: string
  weekLabel: string
  cells: BookingCalendarCell[]
}

export type BookingMonthGrid = {
  monthKey: string
  monthLabel: string
  cells: BookingCalendarCell[]
}

const WEEKDAY_HEADERS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

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

function getFallbackWeekdayLabel(date: Date) {
  return date
    .toLocaleDateString('pt-BR', { weekday: 'short' })
    .replace('.', '')
    .toLowerCase()
}

function getFallbackMonthLabel(date: Date) {
  return date
    .toLocaleDateString('pt-BR', { month: 'long' })
    .toLowerCase()
}

export function getBookingCalendarHeaders() {
  return WEEKDAY_HEADERS
}

export function buildBookingWeekGroups(months: CalendarMonth[]): BookingWeekGroup[] {
  const allDays = months.flatMap((month) => month.days)
  if (allDays.length === 0) {
    return []
  }

  const availabilityMap = new Map<string, CalendarDay>(
    allDays.map((day) => [day.date, day]),
  )

  const sortedDates = [...availabilityMap.keys()].sort()
  const firstAvailable = safeDateFromIso(sortedDates[0])
  const lastAvailable = safeDateFromIso(sortedDates[sortedDates.length - 1])

  const gridStart = startOfWeekMonday(firstAvailable)
  const gridEnd = endOfWeekSunday(lastAvailable)

  const groups: BookingWeekGroup[] = []
  const cursor = new Date(gridStart)

  while (cursor <= gridEnd) {
    const weekStart = new Date(cursor)
    const cells: BookingCalendarCell[] = []

    for (let index = 0; index < 7; index += 1) {
      const cellDate = new Date(cursor)
      const iso = toIsoDate(cellDate)
      const availableDay = availabilityMap.get(iso)

      cells.push({
        cellKey: iso,
        date: iso,
        dayNumber: `${cellDate.getDate()}`,
        monthLabel: availableDay?.month_label ?? getFallbackMonthLabel(cellDate),
        weekdayLabel: availableDay?.weekday_label ?? getFallbackWeekdayLabel(cellDate),
        hasAvailability: Boolean(availableDay),
        inCurrentMonth: true,
        inCurrentRange: cellDate >= firstAvailable && cellDate <= lastAvailable,
      })

      cursor.setDate(cursor.getDate() + 1)
    }

    const weekEnd = new Date(cursor)
    weekEnd.setDate(weekEnd.getDate() - 1)

    groups.push({
      weekKey: toIsoDate(weekStart),
      weekLabel: `Semana de ${weekStart.toLocaleDateString('pt-BR')} a ${weekEnd.toLocaleDateString('pt-BR')}`,
      cells,
    })
  }

  return groups
    .filter((group) => group.cells.some((cell) => cell.hasAvailability))
    .reverse()
}

export function buildBookingMonthGrids(months: CalendarMonth[]): BookingMonthGrid[] {
  const availabilityMap = new Map<string, CalendarDay>()

  for (const month of months) {
    for (const day of month.days) {
      availabilityMap.set(day.date, day)
    }
  }

  return months.map((month) => {
    const monthStart = new Date(month.year, month.month - 1, 1)
    const gridStart = startOfWeekMonday(monthStart)

    const cells: BookingCalendarCell[] = []
    const cursor = new Date(gridStart)

    while (cells.length < 42) {
      const iso = toIsoDate(cursor)
      const availableDay = availabilityMap.get(iso)

      cells.push({
        cellKey: iso,
        date: iso,
        dayNumber: `${cursor.getDate()}`,
        monthLabel: availableDay?.month_label ?? getFallbackMonthLabel(cursor),
        weekdayLabel: availableDay?.weekday_label ?? getFallbackWeekdayLabel(cursor),
        hasAvailability: Boolean(availableDay),
        inCurrentMonth: cursor.getMonth() === month.month - 1,
        inCurrentRange: true,
      })

      cursor.setDate(cursor.getDate() + 1)
    }

    return {
      monthKey: `${month.year}-${month.month}`,
      monthLabel: month.month_label,
      cells,
    }
  })
}