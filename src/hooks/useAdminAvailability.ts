import { useCallback, useEffect, useState } from 'react'

import { AdminApiError, adminApiClient } from '../services/AdminApiClient'
import type {
  AdminAvailabilityDayItem,
  AdminSlotUpsertPayload,
} from '../types/admin'

type UseAdminAvailabilityParams = {
  token: string
  enabled: boolean
  onUnauthorized?: () => void
}

export function useAdminAvailability({
  token,
  enabled,
  onUnauthorized,
}: UseAdminAvailabilityParams) {
  const [days, setDays] = useState<AdminAvailabilityDayItem[]>([])
  const [loadingDays, setLoadingDays] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [availabilityError, setAvailabilityError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleApiError = useCallback(
    (error: unknown, fallbackMessage: string) => {
      if (error instanceof AdminApiError && error.status === 401) {
        onUnauthorized?.()
        setAvailabilityError('Sua sessão administrativa expirou. Entre novamente.')
        return
      }

      setAvailabilityError(error instanceof Error ? error.message : fallbackMessage)
    },
    [onUnauthorized],
  )

  const loadDays = useCallback(async () => {
    if (!enabled || !token) {
      setDays([])
      return
    }

    try {
      setLoadingDays(true)
      setAvailabilityError('')

      const response = await adminApiClient.fetchAvailabilityDays(token)
      setDays(response.days)
    } catch (error) {
      handleApiError(error, 'Não foi possível carregar a disponibilidade administrativa.')
    } finally {
      setLoadingDays(false)
    }
  }, [enabled, handleApiError, token])

  useEffect(() => {
    void loadDays()
  }, [loadDays])

  function replaceDay(updatedDay: AdminAvailabilityDayItem) {
    setDays((current) => {
      const existingIndex = current.findIndex((day) => day.id === updatedDay.id)

      if (existingIndex === -1) {
        return [...current, updatedDay].sort((a, b) => a.date.localeCompare(b.date))
      }

      const next = [...current]
      next[existingIndex] = updatedDay
      return next.sort((a, b) => a.date.localeCompare(b.date))
    })
  }

  async function upsertDay(date: string, isActive: boolean) {
    try {
      setSubmitting(true)
      setAvailabilityError('')
      setSuccessMessage('')

      const updatedDay = await adminApiClient.upsertAvailabilityDay(token, {
        date,
        is_active: isActive,
      })

      replaceDay(updatedDay)
      setSuccessMessage('Dia salvo com sucesso.')
    } catch (error) {
      handleApiError(error, 'Não foi possível salvar o dia informado.')
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleDay(dayId: number, isActive: boolean) {
    try {
      setSubmitting(true)
      setAvailabilityError('')
      setSuccessMessage('')

      const updatedDay = await adminApiClient.toggleAvailabilityDay(token, dayId, {
        is_active: isActive,
      })

      replaceDay(updatedDay)
      setSuccessMessage(isActive ? 'Dia ativado com sucesso.' : 'Dia desativado com sucesso.')
    } catch (error) {
      handleApiError(error, 'Não foi possível atualizar o status do dia.')
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  async function createSlot(dayId: number, payload: AdminSlotUpsertPayload) {
    try {
      setSubmitting(true)
      setAvailabilityError('')
      setSuccessMessage('')

      const updatedDay = await adminApiClient.createAvailabilitySlot(token, dayId, payload)
      replaceDay(updatedDay)
      setSuccessMessage('Horário cadastrado com sucesso.')
    } catch (error) {
      handleApiError(error, 'Não foi possível cadastrar o horário.')
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  async function updateSlot(slotId: number, payload: AdminSlotUpsertPayload) {
    try {
      setSubmitting(true)
      setAvailabilityError('')
      setSuccessMessage('')

      const updatedDay = await adminApiClient.updateAvailabilitySlot(token, slotId, payload)
      replaceDay(updatedDay)
      setSuccessMessage('Horário atualizado com sucesso.')
    } catch (error) {
      handleApiError(error, 'Não foi possível atualizar o horário.')
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteSlot(slotId: number) {
    try {
      setSubmitting(true)
      setAvailabilityError('')
      setSuccessMessage('')

      const updatedDay = await adminApiClient.deleteAvailabilitySlot(token, slotId)
      replaceDay(updatedDay)
      setSuccessMessage('Horário removido com sucesso.')
    } catch (error) {
      handleApiError(error, 'Não foi possível remover o horário.')
      throw error
    } finally {
      setSubmitting(false)
    }
  }

  return {
    days,
    loadingDays,
    submitting,
    availabilityError,
    successMessage,
    loadDays,
    upsertDay,
    toggleDay,
    createSlot,
    updateSlot,
    deleteSlot,
    clearMessages: () => {
      setAvailabilityError('')
      setSuccessMessage('')
    },
  }
}