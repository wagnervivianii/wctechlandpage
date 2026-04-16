export type BookingViewMode = 'day' | 'week' | 'month'

export type CalendarDay = {
  date: string
  weekday_label: string
  day_label: string
  month_label: string
}

export type CalendarMonth = {
  year: number
  month: number
  month_label: string
  days: CalendarDay[]
}

export type CalendarResponse = {
  months: CalendarMonth[]
}

export type AvailabilitySlot = {
  id: number
  availability_day_id: number
  date: string
  start_time: string
  end_time: string
  timezone_name: string
  is_active: boolean
  label: string
}

export type AvailabilitySlotsResponse = {
  date: string
  slots: AvailabilitySlot[]
}

export type BookingRequestPayload = {
  slot_id: string
  name: string
  email: string
  phone: string
  subject_summary: string
}

export type BookingRequestResponse = {
  status: string
  message: string
  slot_id: string
  booking_date: string
  name: string
  email: string
  phone: string
  subject_summary: string
  slot: {
    id: string
    availability_slot_id: number
    date: string
    start_time: string
    end_time: string
    label: string
  }
}

export type BookingFieldErrors = {
  name: string
  email: string
  phone: string
  subject_summary: string
}