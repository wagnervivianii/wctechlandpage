import type {
  AdminAvailabilityDayItem,
  AdminAvailabilityListResponse,
  AdminBookingApprovalPayload,
  AdminBookingCancellationPayload,
  AdminBookingDecisionResponse,
  AdminBookingPendingReviewListResponse,
  AdminBookingRejectionPayload,
  AdminClientWorkspaceDetailResponse,
  AdminClientWorkspaceDriveSyncResponse,
  AdminClientWorkspaceInviteRefreshPayload,
  AdminClientWorkspaceListResponse,
  AdminClientWorkspaceMeetingArtifactBatchSyncPayload,
  AdminClientWorkspaceMeetingArtifactBatchSyncResponse,
  AdminDayTogglePayload,
  AdminDayUpsertPayload,
  AdminLoginPayload,
  AdminLoginResponse,
  AdminMeResponse,
  AdminSlotUpsertPayload,
} from '../types/admin'

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

export class AdminApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'AdminApiError'
    this.status = status
  }
}

async function parseResponse<T>(response: Response, fallbackMessage: string): Promise<T> {
  const rawText = await response.text()

  let payload: T | Record<string, unknown> | null = null
  if (rawText) {
    try {
      payload = JSON.parse(rawText) as T | Record<string, unknown>
    } catch {
      payload = null
    }
  }

  if (!response.ok) {
    throw new AdminApiError(extractErrorMessage(payload, fallbackMessage), response.status)
  }

  if (!payload || typeof payload !== 'object') {
    throw new AdminApiError('A API retornou uma resposta inválida.', response.status)
  }

  return payload as T
}

function buildAuthHeaders(token: string, hasJsonBody = false) {
  return {
    ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`,
  }
}

export class AdminApiClient {
  async login(payload: AdminLoginPayload) {
    const response = await fetch('/api/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    return parseResponse<AdminLoginResponse>(response, 'Não foi possível entrar na área administrativa agora.')
  }

  async fetchMe(token: string) {
    const response = await fetch('/api/admin/auth/me', {
      headers: buildAuthHeaders(token),
    })

    return parseResponse<AdminMeResponse>(response, 'Não foi possível validar a sessão administrativa.')
  }

  async fetchAvailabilityDays(token: string) {
    const response = await fetch('/api/admin/availability/days', {
      headers: buildAuthHeaders(token),
    })

    return parseResponse<AdminAvailabilityListResponse>(
      response,
      'Não foi possível carregar a disponibilidade administrativa.',
    )
  }

  async upsertAvailabilityDay(token: string, payload: AdminDayUpsertPayload) {
    const response = await fetch('/api/admin/availability/days', {
      method: 'POST',
      headers: buildAuthHeaders(token, true),
      body: JSON.stringify(payload),
    })

    return parseResponse<AdminAvailabilityDayItem>(
      response,
      'Não foi possível salvar o dia informado.',
    )
  }

  async toggleAvailabilityDay(token: string, dayId: number, payload: AdminDayTogglePayload) {
    const response = await fetch(`/api/admin/availability/days/${dayId}`, {
      method: 'PATCH',
      headers: buildAuthHeaders(token, true),
      body: JSON.stringify(payload),
    })

    return parseResponse<AdminAvailabilityDayItem>(
      response,
      'Não foi possível atualizar o status do dia.',
    )
  }

  async createAvailabilitySlot(token: string, dayId: number, payload: AdminSlotUpsertPayload) {
    const response = await fetch(`/api/admin/availability/days/${dayId}/slots`, {
      method: 'POST',
      headers: buildAuthHeaders(token, true),
      body: JSON.stringify(payload),
    })

    return parseResponse<AdminAvailabilityDayItem>(
      response,
      'Não foi possível cadastrar o horário.',
    )
  }

  async updateAvailabilitySlot(token: string, slotId: number, payload: AdminSlotUpsertPayload) {
    const response = await fetch(`/api/admin/availability/slots/${slotId}`, {
      method: 'PUT',
      headers: buildAuthHeaders(token, true),
      body: JSON.stringify(payload),
    })

    return parseResponse<AdminAvailabilityDayItem>(
      response,
      'Não foi possível atualizar o horário.',
    )
  }

  async deleteAvailabilitySlot(token: string, slotId: number) {
    const response = await fetch(`/api/admin/availability/slots/${slotId}`, {
      method: 'DELETE',
      headers: buildAuthHeaders(token),
    })

    return parseResponse<AdminAvailabilityDayItem>(
      response,
      'Não foi possível remover o horário.',
    )
  }

  async fetchClientWorkspaces(token: string) {
    const response = await fetch('/api/admin/client-workspaces', {
      headers: buildAuthHeaders(token),
    })

    return parseResponse<AdminClientWorkspaceListResponse>(
      response,
      'Não foi possível carregar os workspaces do cliente.',
    )
  }

  async generateClientWorkspaceInvite(
    token: string,
    workspaceId: number,
    payload: AdminClientWorkspaceInviteRefreshPayload,
  ) {
    const response = await fetch(`/api/admin/client-workspaces/${workspaceId}/invite`, {
      method: 'POST',
      headers: buildAuthHeaders(token, true),
      body: JSON.stringify(payload),
    })

    return parseResponse<AdminClientWorkspaceDetailResponse>(
      response,
      'Não foi possível gerar um novo acesso para o portal do cliente.',
    )
  }


  async syncClientWorkspaceDrive(token: string, workspaceId: number) {
    const response = await fetch(`/api/admin/client-workspaces/${workspaceId}/drive-sync`, {
      method: 'POST',
      headers: buildAuthHeaders(token),
    })

    return parseResponse<AdminClientWorkspaceDriveSyncResponse>(
      response,
      'Não foi possível sincronizar a estrutura do Google Drive do cliente.',
    )
  }

  async syncPendingGoogleArtifacts(
    token: string,
    workspaceId: number,
    payload: AdminClientWorkspaceMeetingArtifactBatchSyncPayload,
  ) {
    const response = await fetch(`/api/admin/client-workspaces/${workspaceId}/artifacts/sync-google-pending`, {
      method: 'POST',
      headers: buildAuthHeaders(token, true),
      body: JSON.stringify(payload),
    })

    return parseResponse<AdminClientWorkspaceMeetingArtifactBatchSyncResponse>(
      response,
      'Não foi possível verificar artefatos pendentes do Google Meet.',
    )
  }

  async fetchPendingReviewBookings(token: string) {
    const response = await fetch('/api/admin/bookings/pending-review', {
      headers: buildAuthHeaders(token),
    })

    return parseResponse<AdminBookingPendingReviewListResponse>(
      response,
      'Não foi possível carregar as solicitações pendentes de revisão.',
    )
  }

  async approveBooking(token: string, bookingId: number, payload: AdminBookingApprovalPayload) {
    const response = await fetch(`/api/admin/bookings/${bookingId}/approve`, {
      method: 'POST',
      headers: buildAuthHeaders(token, true),
      body: JSON.stringify(payload),
    })

    return parseResponse<AdminBookingDecisionResponse>(
      response,
      'Não foi possível aprovar a solicitação.',
    )
  }

  async cancelBooking(token: string, bookingId: number, payload: AdminBookingCancellationPayload) {
    const response = await fetch(`/api/admin/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: buildAuthHeaders(token, true),
      body: JSON.stringify(payload),
    })

    return parseResponse<AdminBookingDecisionResponse>(
      response,
      'Não foi possível cancelar a reunião.',
    )
  }

  async rejectBooking(token: string, bookingId: number, payload: AdminBookingRejectionPayload) {
    const response = await fetch(`/api/admin/bookings/${bookingId}/reject`, {
      method: 'POST',
      headers: buildAuthHeaders(token, true),
      body: JSON.stringify(payload),
    })

    return parseResponse<AdminBookingDecisionResponse>(
      response,
      'Não foi possível rejeitar a solicitação.',
    )
  }
}

export const adminApiClient = new AdminApiClient()