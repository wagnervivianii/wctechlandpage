import type {
  ClientAuthMessageResponse,
  ClientAuthTokenResponse,
  ClientInvitePreviewResponse,
  ClientMeResponse,
  ClientPortalWorkspaceResponse,
} from '../types/client'

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

export class ClientApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ClientApiError'
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
    throw new ClientApiError(extractErrorMessage(payload, fallbackMessage), response.status)
  }

  if (!payload || typeof payload !== 'object') {
    throw new ClientApiError('A API retornou uma resposta inválida.', response.status)
  }

  return payload as T
}

function buildAuthHeaders(token: string, hasJsonBody = false) {
  return {
    ...(hasJsonBody ? { 'Content-Type': 'application/json' } : {}),
    Authorization: `Bearer ${token}`,
  }
}

export class ClientApiClient {
  async fetchInvitePreview(inviteToken: string) {
    const response = await fetch(`/api/client/auth/invites/${inviteToken}`)
    return parseResponse<ClientInvitePreviewResponse>(response, 'Não foi possível validar este convite agora.')
  }

  async completeFirstAccess(inviteToken: string, password: string) {
    const response = await fetch('/api/client/auth/first-access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invite_token: inviteToken,
        password,
      }),
    })

    return parseResponse<ClientAuthTokenResponse>(response, 'Não foi possível concluir o primeiro acesso.')
  }

  async login(email: string, password: string) {
    const response = await fetch('/api/client/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    })

    return parseResponse<ClientAuthTokenResponse>(response, 'Não foi possível entrar na área do cliente agora.')
  }

  async forgotPassword(email: string) {
    const response = await fetch('/api/client/auth/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })

    return parseResponse<ClientAuthMessageResponse>(response, 'Não foi possível solicitar o link de redefinição.')
  }

  async resetPassword(token: string, password: string) {
    const response = await fetch('/api/client/auth/reset-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
    })

    return parseResponse<ClientAuthMessageResponse>(response, 'Não foi possível redefinir a senha agora.')
  }

  async startGoogle(redirectUri: string, inviteToken?: string) {
    const params = new URLSearchParams({ redirect_uri: redirectUri })
    if (inviteToken) {
      params.set('invite_token', inviteToken)
    }

    const response = await fetch(`/api/client/auth/google/start?${params.toString()}`)
    return parseResponse<{ authorization_url: string; state: string }>(response, 'Não foi possível iniciar o acesso com Google.')
  }

  async exchangeGoogle(code: string, state: string, redirectUri: string) {
    const response = await fetch('/api/client/auth/google/exchange', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        state,
        redirect_uri: redirectUri,
      }),
    })

    return parseResponse<ClientAuthTokenResponse>(response, 'Não foi possível concluir o acesso com Google.')
  }

  async fetchMe(token: string) {
    const response = await fetch('/api/client/auth/me', {
      headers: buildAuthHeaders(token),
    })

    return parseResponse<ClientMeResponse>(response, 'Não foi possível validar sua sessão no portal do cliente.')
  }

  async fetchWorkspace(token: string) {
    const response = await fetch('/api/client/workspace', {
      headers: buildAuthHeaders(token),
    })

    return parseResponse<ClientPortalWorkspaceResponse>(response, 'Não foi possível carregar sua área do cliente.')
  }
}

export const clientApiClient = new ClientApiClient()