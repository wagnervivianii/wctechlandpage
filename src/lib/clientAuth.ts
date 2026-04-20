import type { ClientMeResponse } from '../types/client'

const CLIENT_TOKEN_KEY = 'wv_client_access_token'
const CLIENT_LAST_EMAIL_KEY = 'wv_client_last_email'
const CLIENT_LAST_AVATAR_KEY = 'wv_client_avatar_url'

export function getClientToken() {
  return localStorage.getItem(CLIENT_TOKEN_KEY)
}

export function setClientToken(token: string) {
  localStorage.setItem(CLIENT_TOKEN_KEY, token)
}

export function clearClientToken() {
  localStorage.removeItem(CLIENT_TOKEN_KEY)
}

export function setClientLastEmail(email: string) {
  localStorage.setItem(CLIENT_LAST_EMAIL_KEY, email)
}

export function getClientLastEmail() {
  return localStorage.getItem(CLIENT_LAST_EMAIL_KEY) ?? ''
}

export function setClientAvatarUrl(value: string | null | undefined) {
  if (!value) {
    localStorage.removeItem(CLIENT_LAST_AVATAR_KEY)
    return
  }
  localStorage.setItem(CLIENT_LAST_AVATAR_KEY, value)
}

export function getClientAvatarUrl() {
  return localStorage.getItem(CLIENT_LAST_AVATAR_KEY)
}

export function clearClientSession() {
  clearClientToken()
  localStorage.removeItem(CLIENT_LAST_AVATAR_KEY)
}

export function getClientPortalRoute() {
  return '/cliente'
}

export function getClientLoginRoute() {
  return '/cliente/login'
}

export function getClientForgotPasswordRoute(email?: string) {
  if (!email) {
    return '/cliente/esqueci-senha'
  }

  return `/cliente/esqueci-senha?email=${encodeURIComponent(email)}`
}

export function getClientResetPasswordRoute(token?: string) {
  if (!token) {
    return '/cliente/redefinir-senha'
  }

  return `/cliente/redefinir-senha?token=${encodeURIComponent(token)}`
}

export function getClientGoogleCallbackRoute() {
  return '/cliente/google/callback'
}

export function readClientInviteTokenFromPath(pathname: string) {
  const match = pathname.match(/^\/cliente\/ativacao\/([^/]+)\/?$/)
  return match?.[1] ?? ''
}

export function buildClientActivationRoute(inviteToken: string) {
  return `/cliente/ativacao/${encodeURIComponent(inviteToken)}`
}

export function resolveClientDisplayName(me: ClientMeResponse | null, fallbackEmail?: string) {
  if (me?.full_name?.trim()) {
    return me.full_name.trim()
  }

  if (fallbackEmail?.trim()) {
    return fallbackEmail.trim()
  }

  return 'Cliente WV'
}