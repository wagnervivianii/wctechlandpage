import { useCallback, useEffect, useState } from 'react'

import { AdminApiError, adminApiClient } from '../services/AdminApiClient'
import type { AdminClientWorkspaceSummaryItem } from '../types/admin'

type UseAdminClientWorkspacesParams = {
  token: string
  enabled: boolean
  onUnauthorized?: () => void
}

export function useAdminClientWorkspaces({
  token,
  enabled,
  onUnauthorized,
}: UseAdminClientWorkspacesParams) {
  const [workspaces, setWorkspaces] = useState<AdminClientWorkspaceSummaryItem[]>([])
  const [loadingWorkspaces, setLoadingWorkspaces] = useState(false)
  const [workspaceError, setWorkspaceError] = useState('')
  const [generatingWorkspaceId, setGeneratingWorkspaceId] = useState<number | null>(null)
  const [generatedInviteLinks, setGeneratedInviteLinks] = useState<Record<number, string>>({})

  const handleApiError = useCallback((error: unknown, fallbackMessage: string) => {
    if (error instanceof AdminApiError && error.status === 401) {
      onUnauthorized?.()
      setWorkspaceError('Sua sessão administrativa expirou. Entre novamente.')
      return
    }

    setWorkspaceError(error instanceof Error ? error.message : fallbackMessage)
  }, [onUnauthorized])

  const loadWorkspaces = useCallback(async () => {
    if (!enabled || !token) {
      setWorkspaces([])
      return
    }

    try {
      setLoadingWorkspaces(true)
      setWorkspaceError('')
      const response = await adminApiClient.fetchClientWorkspaces(token)
      setWorkspaces(response.items)
    } catch (error) {
      handleApiError(error, 'Não foi possível carregar os workspaces do cliente.')
    } finally {
      setLoadingWorkspaces(false)
    }
  }, [enabled, handleApiError, token])

  const generateWorkspaceInvite = useCallback(async (workspaceId: number, inviteTtlHours = 168) => {
    if (!enabled || !token) {
      return
    }

    try {
      setGeneratingWorkspaceId(workspaceId)
      setWorkspaceError('')
      const response = await adminApiClient.generateClientWorkspaceInvite(token, workspaceId, {
        invite_ttl_hours: inviteTtlHours,
      })
      setGeneratedInviteLinks((current) => ({
        ...current,
        [workspaceId]: response.setup_url || '',
      }))
      await loadWorkspaces()
    } catch (error) {
      handleApiError(error, 'Não foi possível gerar um novo acesso para o portal do cliente.')
      throw error
    } finally {
      setGeneratingWorkspaceId(null)
    }
  }, [enabled, handleApiError, loadWorkspaces, token])

  useEffect(() => {
    void loadWorkspaces()
  }, [loadWorkspaces])

  return {
    workspaces,
    loadingWorkspaces,
    workspaceError,
    generatingWorkspaceId,
    generatedInviteLinks,
    loadWorkspaces,
    generateWorkspaceInvite,
  }
}