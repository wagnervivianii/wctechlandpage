export type AdminLoginPayload = {
  username: string
  password: string
}

export type AdminLoginResponse = {
  access_token: string
  token_type: string
  expires_in: number
  username: string
}

export type AdminMeResponse = {
  authenticated: boolean
  username: string
  role: string
}

export type AdminAvailabilitySlotItem = {
  id: number
  start_time: string
  end_time: string
  timezone_name: string
  is_active: boolean
  label: string
}

export type AdminAvailabilityDayItem = {
  id: number
  date: string
  weekday_label: string
  day_label: string
  month_label: string
  display_label: string
  is_active: boolean
  has_active_slots: boolean
  notes: string | null
  slots: AdminAvailabilitySlotItem[]
}

export type AdminAvailabilityListResponse = {
  days: AdminAvailabilityDayItem[]
}

export type AdminDayUpsertPayload = {
  date: string
  is_active: boolean
}

export type AdminDayTogglePayload = {
  is_active: boolean
}

export type AdminSlotUpsertPayload = {
  start_time: string
  end_time: string
  timezone_name: string
  is_active: boolean
}