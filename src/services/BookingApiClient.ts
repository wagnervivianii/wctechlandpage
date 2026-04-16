import type {
  AvailabilitySlotsResponse,
  BookingRequestPayload,
  BookingRequestResponse,
  CalendarResponse,
} from '../types/booking'

function extractErrorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== 'object') {
    return fallback
  }

  const record = payload as Record<string, unknown>

  if (typeof record.message === 'string' && record.message.trim()) {
    return record.message
  }

  if (typeof record.detail === 'string' && record.detail.trim()) {
    return record.detail
  }

  return fallback
}

export class BookingApiClient {
  async fetchCalendar() {
    const response = await fetch('/api/availability/calendar')
    if (!response.ok) {
      throw new Error('Não foi possível carregar a agenda agora.')
    }

    return (await response.json()) as CalendarResponse
  }

  async fetchSlotsByDate(date: string) {
    const response = await fetch(`/api/availability/slots?date=${date}`)
    if (!response.ok) {
      throw new Error('Não foi possível carregar os horários deste dia.')
    }

    return (await response.json()) as AvailabilitySlotsResponse
  }

  async createBooking(payload: BookingRequestPayload) {
    const response = await fetch('/api/bookings/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const rawText = await response.text()
    let data: BookingRequestResponse | Record<string, unknown> | null = null

    if (rawText) {
      try {
        data = JSON.parse(rawText) as BookingRequestResponse | Record<string, unknown>
      } catch {
        data = null
      }
    }

    if (!response.ok) {
      throw new Error(extractErrorMessage(data, 'Não foi possível enviar sua solicitação agora.'))
    }

    if (!data || typeof data !== 'object') {
      throw new Error('A API retornou uma resposta inválida.')
    }

    return data as BookingRequestResponse
  }
}

export const bookingApiClient = new BookingApiClient()
