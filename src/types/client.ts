export type ClientInvitePreviewResponse = {
  invite_email: string
  contact_name: string
  workspace_status: string
  invite_status: string
  expires_at: string | null
  accepted_at: string | null
  is_expired: boolean
  can_activate: boolean
}

export type ClientAuthTokenResponse = {
  access_token: string
  token_type: string
  expires_in: number
  workspace_id: number
  email: string
  auth_provider: string
  avatar_url?: string | null
}

export type ClientAuthMessageResponse = {
  message: string
}

export type ClientMeResponse = {
  authenticated: boolean
  account_id: number
  workspace_id: number
  workspace_status: string
  email: string
  full_name: string | null
  auth_provider: string
  has_password: boolean
  google_linked: boolean
  last_login_at: string | null
}

export type ClientPortalMeetingArtifactItem = {
  id: number
  artifact_type: string
  artifact_status: string
  artifact_label: string | null
  source_provider: string | null
  drive_file_name: string | null
  drive_web_view_link: string | null
  mime_type: string | null
  file_size_bytes: number | null
  text_content: string | null
  summary_text: string | null
  captured_at: string | null
}

export type ClientPortalMeetingItem = {
  id: number
  booking_request_id: number
  meeting_label: string
  meet_url: string | null
  recording_url: string | null
  recording_provider: string | null
  transcript_summary: string | null
  transcript_text: string | null
  meeting_notes: string | null
  meeting_started_at: string | null
  meeting_ended_at: string | null
  synced_from_booking_at: string | null
  artifacts: ClientPortalMeetingArtifactItem[]
}

export type ClientPortalWorkspaceResponse = {
  workspace_id: number
  workspace_status: string
  primary_contact_name: string
  primary_contact_email: string
  primary_contact_phone: string
  portal_notes: string | null
  activated_at: string | null
  created_at: string
  meetings: ClientPortalMeetingItem[]
}
