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

export type AdminClientWorkspaceLifecyclePayload = {
  reason?: string | null
}

export type AdminClientWorkspaceLifecycleResponse = {
  workspace_id: number
  previous_status: string
  workspace_status: string
  client_access_revoked: boolean
  pending_invites_revoked: number
  visible_meetings_hidden: number
  admin_history_preserved: boolean
  message: string
}

export type AdminClientWorkspaceDriveFolderItem = {
  folder_id: string
  folder_name: string
  web_view_link: string
}

export type AdminClientWorkspaceDriveInfo = {
  sync_status: string
  sync_error: string | null
  synced_at: string | null
  root: AdminClientWorkspaceDriveFolderItem | null
  meet_artifacts: AdminClientWorkspaceDriveFolderItem | null
  client_uploads: AdminClientWorkspaceDriveFolderItem | null
  generated_documents: AdminClientWorkspaceDriveFolderItem | null
  archive: AdminClientWorkspaceDriveFolderItem | null
}

export type AdminClientWorkspaceMeetingArtifactItem = {
  id: number
  artifact_type: string
  artifact_status: string
  artifact_label: string
  source_provider: string | null
  google_conference_record_name: string | null
  google_artifact_resource_name: string | null
  source_download_url: string | null
  drive_file_id: string | null
  drive_file_name: string | null
  drive_web_view_link: string | null
  mime_type: string | null
  file_size_bytes: number | null
  text_content: string | null
  summary_text: string | null
  metadata_json: Record<string, unknown> | null
  captured_at: string | null
  last_synced_at: string | null
  is_visible_to_client: boolean
  created_at: string
  updated_at: string
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
  transcript_text: string | null
  meeting_notes: string | null
  meeting_started_at: string | null
  meeting_ended_at: string | null
  is_visible_to_client: boolean
  synced_from_booking_at: string | null
  artifacts: AdminClientWorkspaceMeetingArtifactItem[]
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

export type AdminClientWorkspaceAccountItem = {
  id: number
  email: string
  full_name: string | null
  has_password: boolean
  google_linked: boolean
  auth_provider: string
  google_picture_url: string | null
  last_login_at: string | null
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
  account: AdminClientWorkspaceAccountItem | null
  invites: AdminClientWorkspaceInviteItem[]
  meetings: AdminClientWorkspaceMeetingItem[]
  drive: AdminClientWorkspaceDriveInfo
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
  account: AdminClientWorkspaceAccountItem | null
  meetings: AdminClientWorkspaceMeetingItem[]
  invites: AdminClientWorkspaceInviteItem[]
  drive: AdminClientWorkspaceDriveInfo
  setup_token: string | null
  setup_path: string | null
  setup_url: string | null
}

export type AdminClientWorkspaceInviteRefreshPayload = {
  invite_ttl_hours: number
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

export type AdminClientWorkspaceDriveSyncResponse = AdminClientWorkspaceDetailResponse

export type AdminClientWorkspaceMeetingArtifactBatchSyncPayload = {
  max_meetings: number
  force_resync: boolean
}

export type AdminClientWorkspaceMeetingArtifactBatchSyncItem = {
  meeting_id: number
  meeting_label: string
  sync_status: string
  message: string | null
  conference_record_name: string | null
  synchronized_at: string
  artifacts_upserted: number
  recordings_synced: number
  transcripts_synced: number
  notes_synced: number
}

export type AdminClientWorkspaceMeetingArtifactBatchSyncResponse = {
  workspace_id: number
  processed_meetings_count: number
  eligible_meetings_count: number
  synchronized_meetings_count: number
  no_artifacts_available_count: number
  conference_not_found_count: number
  failed_meetings_count: number
  items: AdminClientWorkspaceMeetingArtifactBatchSyncItem[]
}

export type AdminClientWorkspaceFileItem = {
  id: number
  workspace_id: number
  meeting_id: number | null
  uploaded_by_role: string
  file_category: string
  review_status: string
  visibility_scope: string
  display_name: string | null
  description: string | null
  drive_file_id: string
  drive_file_name: string | null
  drive_web_view_link: string | null
  mime_type: string | null
  file_extension: string | null
  file_size_bytes: number | null
  review_notes: string | null
  approved_at: string | null
  reviewed_at: string | null
  archived_at: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
}

export type AdminClientWorkspaceFileListResponse = {
  workspace_id: number
  pending_review_count: number
  approved_count: number
  archived_count: number
  rejected_count: number
  items: AdminClientWorkspaceFileItem[]
}

export type AdminClientWorkspaceFileActionPayload = {
  review_notes: string | null
  visible_to_client: boolean
}
