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

export type AdminBookingHistoryItem = {
  id: number
  booking_date: string | null
  start_time: string | null
  end_time: string | null
  display_label: string
  status: string
  meeting_status: string
  name: string
  email: string
  phone: string
  subject_summary: string
  meet_url: string | null
  meet_event_id: string | null
  meeting_notes: string | null
  transcript_summary: string | null
  has_transcript: boolean
  created_at: string
  contact_confirmed_at: string | null
  admin_reviewed_at: string | null
  rejection_reason: string | null
  cancellation_reason: string | null
  cancelled_at: string | null
  google_calendar_cancelled: boolean
  can_schedule_again: boolean
  has_client_workspace: boolean
  client_workspace_status: string | null
}

export type AdminAvailabilityListResponse = {
  days: AdminAvailabilityDayItem[]
  history: AdminBookingHistoryItem[]
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

export type AdminClientWorkspaceMeetingItem = {
  id: number
  booking_request_id: number
  meeting_label: string
  meet_url: string | null
  recording_url: string | null
  recording_provider: string | null
  has_transcript: boolean
  transcript_summary: string | null
  meeting_notes: string | null
  is_visible_to_client: boolean
  synced_from_booking_at: string | null
}

export type AdminClientWorkspaceInviteItem = {
  id: number
  invite_email: string
  invite_status: string
  expires_at: string | null
  sent_at: string | null
  accepted_at: string | null
  created_at: string
}


export type AdminClientWorkspaceSummaryItem = {
  workspace_id: number
  workspace_status: string
  source_booking_request_id: number | null
  source_booking_status: string
  source_meeting_status: string
  primary_contact_name: string
  primary_contact_email: string
  primary_contact_phone: string
  portal_notes: string | null
  activated_at: string | null
  created_at: string
  has_client_access: boolean
  latest_invite_status: string | null
  latest_invite_sent_at: string | null
  latest_invite_accepted_at: string | null
  meetings_count: number
  visible_meetings_count: number
  latest_meeting: AdminClientWorkspaceMeetingItem | null
  invites: AdminClientWorkspaceInviteItem[]
  meetings: AdminClientWorkspaceMeetingItem[]
}

export type AdminClientWorkspaceListResponse = {
  items: AdminClientWorkspaceSummaryItem[]
}

export type AdminClientWorkspaceDetailResponse = {
  workspace_id: number
  workspace_status: string
  source_booking_request_id: number | null
  source_booking_status: string
  source_meeting_status: string
  primary_contact_name: string
  primary_contact_email: string
  primary_contact_phone: string
  portal_notes: string | null
  activated_at: string | null
  created_at: string
  meetings: AdminClientWorkspaceMeetingItem[]
  invites: AdminClientWorkspaceInviteItem[]
  setup_token: string | null
  setup_path: string | null
}

export type AdminBookingPendingReviewItem = {
  id: number
  booking_date: string | null
  start_time: string | null
  end_time: string | null
  display_label: string
  status: string
  meeting_status: string
  name: string
  email: string
  phone: string
  subject_summary: string
  created_at: string
  contact_confirmed_at: string
}

export type AdminBookingPendingReviewListResponse = {
  items: AdminBookingPendingReviewItem[]
}

export type AdminBookingApprovalPayload = {
  meeting_notes: string | null
  create_client_workspace: boolean
  create_workspace_invite: boolean
  invite_ttl_hours: number
  portal_notes: string | null
}


export type AdminBookingCancellationPayload = {
  cancellation_reason: string | null
  meeting_notes: string | null
}

export type AdminBookingRejectionPayload = {
  rejection_reason: string
  meeting_notes: string | null
}

export type AdminBookingDecisionResponse = {
  id: number
  status: string
  meeting_status: string
  name: string
  email: string
  phone: string
  subject_summary: string
  booking_date: string | null
  start_time: string | null
  end_time: string | null
  meet_url: string | null
  meet_event_id: string | null
  meeting_notes: string | null
  contact_confirmed_at: string | null
  admin_reviewed_at: string | null
  rejection_reason: string | null
  can_schedule_again: boolean
  client_workspace: AdminClientWorkspaceDetailResponse | null
}