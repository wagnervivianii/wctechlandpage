import { useCallback, useEffect, useState } from 'react'

import { AdminApiError, adminApiClient } from '../services/AdminApiClient'
import type { AdminMeResponse } from '../types/admin'

const ADMIN_TOKEN_STORAGE_KEY = 'wvtechsolutions_admin_token'

export function useAdminAuth() {
  const [token, setToken] = useState(() => localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY) ?? '')
  const [currentUser, setCurrentUser] = useState<AdminMeResponse | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginLoading, setLoginLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function validateSession() {
      if (!token) {
        if (!cancelled) {
          setCurrentUser(null)
          setAuthLoading(false)
        }
        return
      }

      try {
        setAuthLoading(true)
        setAuthError('')

        const me = await adminApiClient.fetchMe(token)
        if (cancelled) return

        setCurrentUser(me)
      } catch (error) {
        if (cancelled) return

        localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
        setToken('')
        setCurrentUser(null)

        if (error instanceof AdminApiError && error.status === 401) {
          setAuthError('Sua sessão administrativa expirou. Entre novamente.')
        } else {
          setAuthError(
            error instanceof Error
              ? error.message
              : 'Não foi possível validar a sessão administrativa.',
          )
        }
      } finally {
        if (!cancelled) {
          setAuthLoading(false)
        }
      }
    }

    void validateSession()

    return () => {
      cancelled = true
    }
  }, [token])

  const login = useCallback(async (username: string, password: string) => {
    try {
      setLoginLoading(true)
      setAuthError('')

      const session = await adminApiClient.login({ username, password })
      localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, session.access_token)
      setToken(session.access_token)

      const me = await adminApiClient.fetchMe(session.access_token)
      setCurrentUser(me)
    } catch (error) {
      setCurrentUser(null)
      setAuthError(
        error instanceof Error ? error.message : 'Não foi possível entrar na área administrativa.',
      )
      throw error
    } finally {
      setLoginLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY)
    setToken('')
    setCurrentUser(null)
    setAuthError('')
  }, [])

  const clearAuthError = useCallback(() => {
    setAuthError('')
  }, [])

  return {
    token,
    currentUser,
    authLoading,
    loginLoading,
    authError,
    isAuthenticated: Boolean(token && currentUser?.authenticated),
    login,
    logout,
    clearAuthError,
  }
}