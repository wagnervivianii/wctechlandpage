import { useCallback, useEffect, useState } from 'react'

import { AdminApiError, adminApiClient } from '../services/AdminApiClient'
import type {
  AdminBookingApprovalPayload,
  AdminBookingPendingReviewItem,
  AdminBookingRejectionPayload,
} from '../types/admin'

type UseAdminBookingReviewParams = {
  token: string
  enabled: boolean
  onUnauthorized?: () => void
  onDecisionApplied?: () => Promise<void> | void
}

export function useAdminBookingReview({
  token,
  enabled,
  onUnauthorized,
  onDecisionApplied,
}: UseAdminBookingReviewParams) {
  const [pendingReviewItems, setPendingReviewItems] = useState<AdminBookingPendingReviewItem[]>([])
  const [loadingPendingReview, setLoadingPendingReview] = useState(false)
  const [submittingReviewId, setSubmittingReviewId] = useState<number | null>(null)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState('')

  const handleApiError = useCallback(
    (error: unknown, fallbackMessage: string) => {
      if (error instanceof AdminApiError && error.status === 401) {
        onUnauthorized?.()
        setReviewError('Sua sessão administrativa expirou. Entre novamente.')
        return
      }

      setReviewError(error instanceof Error ? error.message : fallbackMessage)
    },
    [onUnauthorized],
  )

  const loadPendingReview = useCallback(async () => {
    if (!enabled || !token) {
      setPendingReviewItems([])
      return
    }

    try {
      setLoadingPendingReview(true)
      setReviewError('')

      const response = await adminApiClient.fetchPendingReviewBookings(token)
      setPendingReviewItems(response.items)
    } catch (error) {
      handleApiError(error, 'Não foi possível carregar as solicitações pendentes de revisão.')
    } finally {
      setLoadingPendingReview(false)
    }
  }, [enabled, handleApiError, token])

  useEffect(() => {
    void loadPendingReview()
  }, [loadPendingReview])

  async function approveBooking(bookingId: number, payload: AdminBookingApprovalPayload) {
    try {
      setSubmittingReviewId(bookingId)
      setReviewError('')
      setReviewSuccessMessage('')

      const response = await adminApiClient.approveBooking(token, bookingId, payload)
      await loadPendingReview()
      await onDecisionApplied?.()

      const workspaceMessage = response.client_workspace
        ? ' Workspace do cliente provisionado com sucesso.'
        : ''
      setReviewSuccessMessage(`Solicitação de ${response.name} aprovada com sucesso.${workspaceMessage}`)
      return response
    } catch (error) {
      handleApiError(error, 'Não foi possível aprovar a solicitação.')
      throw error
    } finally {
      setSubmittingReviewId(null)
    }
  }

  async function rejectBooking(bookingId: number, payload: AdminBookingRejectionPayload) {
    try {
      setSubmittingReviewId(bookingId)
      setReviewError('')
      setReviewSuccessMessage('')

      const response = await adminApiClient.rejectBooking(token, bookingId, payload)
      await loadPendingReview()
      await onDecisionApplied?.()

      setReviewSuccessMessage(`Solicitação de ${response.name} rejeitada com sucesso.`)
      return response
    } catch (error) {
      handleApiError(error, 'Não foi possível rejeitar a solicitação.')
      throw error
    } finally {
      setSubmittingReviewId(null)
    }
  }

  return {
    pendingReviewItems,
    loadingPendingReview,
    submittingReviewId,
    reviewError,
    reviewSuccessMessage,
    loadPendingReview,
    approveBooking,
    rejectBooking,
    clearReviewMessages: () => {
      setReviewError('')
      setReviewSuccessMessage('')
    },
  }
}