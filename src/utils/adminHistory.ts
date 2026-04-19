import type { AdminBookingHistoryItem } from '../types/admin'

export type HistoryViewMode = 'day' | 'week' | 'month'

export type HistoryDayGroup = {
  dayKey: string
  dayLabel: string
  items: AdminBookingHistoryItem[]
}

export type HistoryWeekGroup = {
  weekKey: string
  weekLabel: string
  days: HistoryDayGroup[]
}

export type HistoryMonthCell = {
  cellKey: string
  isoDate: string | null
  dayNumber: string
  inCurrentMonth: boolean
  items: AdminBookingHistoryItem[]
}

export type HistoryMonthGroup = {
  monthKey: string
  monthLabel: string
  weeks: HistoryMonthCell[][]
}

const weekDayHeader = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

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

export function getHistoryWeekDayHeaders() {
  return weekDayHeader
}

export function getMeetingStatusLabel(meetingStatus: string) {
  switch (meetingStatus) {
    case 'completed':
      return 'Reunião concluída'
    case 'cancelled':
      return 'Reunião cancelada'
    case 'no_show':
      return 'Não compareceu'
    case 'scheduled':
      return 'Reunião agendada'
    default:
      return meetingStatus
  }
}


export function getRequestStatusLabel(status: string) {
  switch (status) {
    case 'approved':
      return 'Aprovada'
    case 'cancelled_by_admin':
      return 'Cancelada pela equipe'
    case 'rejected':
      return 'Rejeitada'
    case 'email_confirmed_pending_admin_review':
      return 'Aguardando análise'
    default:
      return status
  }
}

export function getRequestStatusClasses(status: string) {
  switch (status) {
    case 'approved':
      return 'bg-emerald-500/12 text-emerald-200 ring-1 ring-emerald-400/25'
    case 'cancelled_by_admin':
      return 'bg-rose-500/12 text-rose-200 ring-1 ring-rose-400/25'
    case 'rejected':
      return 'bg-amber-500/12 text-amber-200 ring-1 ring-amber-400/25'
    default:
      return 'bg-white/8 text-slate-300 ring-1 ring-white/10'
  }
}
export function getMeetingStatusClasses(meetingStatus: string) {
  switch (meetingStatus) {
    case 'completed':
      return 'bg-emerald-500/12 text-emerald-200 ring-1 ring-emerald-400/25'
    case 'cancelled':
      return 'bg-rose-500/12 text-rose-200 ring-1 ring-rose-400/25'
    case 'no_show':
      return 'bg-amber-500/12 text-amber-200 ring-1 ring-amber-400/25'
    default:
      return 'bg-white/8 text-slate-300 ring-1 ring-white/10'
  }
}

export function formatHistoryDayLabel(bookingDate: string | null) {
  if (!bookingDate) {
    return 'Sem data definida'
  }

  const safeDate = safeDateFromIso(bookingDate)
  return safeDate.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getHistoryEventTimeLabel(item: AdminBookingHistoryItem) {
  if (item.start_time && item.end_time) {
    return `${item.start_time} às ${item.end_time}`
  }

  if (item.start_time) {
    return item.start_time
  }

  return 'Horário não definido'
}

export function groupHistoryByDay(history: AdminBookingHistoryItem[]): HistoryDayGroup[] {
  const grouped = new Map<string, AdminBookingHistoryItem[]>()

  for (const item of history) {
    const key = item.booking_date ?? 'sem-data'
    const current = grouped.get(key) ?? []
    current.push(item)
    grouped.set(key, current)
  }

  const entries = Array.from(grouped.entries()).sort((a, b) => {
    if (a[0] === 'sem-data') return 1
    if (b[0] === 'sem-data') return -1
    return a[0] < b[0] ? 1 : -1
  })

  return entries.map(([dayKey, items]) => ({
    dayKey,
    dayLabel: formatHistoryDayLabel(dayKey === 'sem-data' ? null : dayKey),
    items: [...items].sort((a, b) => {
      const aValue = `${a.booking_date ?? ''} ${a.start_time ?? ''} ${a.created_at}`
      const bValue = `${b.booking_date ?? ''} ${b.start_time ?? ''} ${b.created_at}`
      return aValue < bValue ? 1 : -1
    }),
  }))
}

export function groupHistoryByWeek(history: AdminBookingHistoryItem[]): HistoryWeekGroup[] {
  const dayGroups = groupHistoryByDay(history).filter((group) => group.dayKey !== 'sem-data')
  const weekMap = new Map<string, HistoryDayGroup[]>()

  for (const group of dayGroups) {
    const weekStart = startOfWeekMonday(safeDateFromIso(group.dayKey))
    const weekKey = toIsoDate(weekStart)
    const current = weekMap.get(weekKey) ?? []
    current.push(group)
    weekMap.set(weekKey, current)
  }

  const weekEntries = Array.from(weekMap.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1))

  return weekEntries.map(([weekKey, days]) => {
    const start = safeDateFromIso(weekKey)
    const end = endOfWeekSunday(start)

    return {
      weekKey,
      weekLabel: `Semana de ${start.toLocaleDateString('pt-BR')} a ${end.toLocaleDateString('pt-BR')}`,
      days: [...days].sort((a, b) => (a.dayKey < b.dayKey ? -1 : 1)),
    }
  })
}

export function groupHistoryByMonth(history: AdminBookingHistoryItem[]): HistoryMonthGroup[] {
  const byDate = new Map<string, AdminBookingHistoryItem[]>()

  for (const item of history) {
    if (!item.booking_date) {
      continue
    }

    const current = byDate.get(item.booking_date) ?? []
    current.push(item)
    byDate.set(item.booking_date, current)
  }

  const monthKeys = Array.from(
    new Set(
      history
        .filter((item) => item.booking_date)
        .map((item) => String(item.booking_date).slice(0, 7)),
    ),
  ).sort((a, b) => (a < b ? 1 : -1))

  return monthKeys.map((monthKey) => {
    const [yearText, monthText] = monthKey.split('-')
    const year = Number(yearText)
    const monthIndex = Number(monthText) - 1

    const monthStart = new Date(year, monthIndex, 1)
    const monthEnd = new Date(year, monthIndex + 1, 0)

    const gridStart = startOfWeekMonday(monthStart)
    const gridEnd = endOfWeekSunday(monthEnd)

    const cells: HistoryMonthCell[] = []
    const cursor = new Date(gridStart)

    while (cursor <= gridEnd) {
      const isoDate = toIsoDate(cursor)
      const items = byDate.get(isoDate) ?? []

      cells.push({
        cellKey: isoDate,
        isoDate,
        dayNumber: `${cursor.getDate()}`,
        inCurrentMonth: cursor.getMonth() === monthIndex,
        items,
      })

      cursor.setDate(cursor.getDate() + 1)
    }

    const weeks: HistoryMonthCell[][] = []
    for (let index = 0; index < cells.length; index += 7) {
      weeks.push(cells.slice(index, index + 7))
    }

    return {
      monthKey,
      monthLabel: monthStart.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      }),
      weeks,
    }
  })
}