import { useCallback, useMemo, useState } from 'react'
import type { FormEvent } from 'react'

import { bookingApiClient } from '../services/BookingApiClient'
import type {
  BookingFieldErrors,
  BookingRequestPayload,
  BookingRequestResponse,
} from '../types/booking'
import {
  formatPhoneInput,
  normalizeEmailInput,
  normalizeNameInput,
  sanitizeSummaryInput,
} from '../utils/bookingFormatters'
import { getBookingFormValidationErrors } from '../utils/bookingValidators'

export const initialBookingForm: BookingRequestPayload = {
  slot_id: '',
  name: '',
  email: '',
  phone: '',
  subject_summary: '',
}

const initialFieldErrors: BookingFieldErrors = {
  name: '',
  email: '',
  phone: '',
  subject_summary: '',
}

type UseBookingFormParams = {
  selectedSlotId: string
  onSubmitSuccess?: () => Promise<void> | void
}

export function useBookingForm({ selectedSlotId, onSubmitSuccess }: UseBookingFormParams) {
  const [form, setForm] = useState<BookingRequestPayload>(initialBookingForm)
  const [fieldErrors, setFieldErrors] = useState<BookingFieldErrors>(initialFieldErrors)
  const [loadingSubmit, setLoadingSubmit] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [successPayload, setSuccessPayload] = useState<BookingRequestResponse | null>(null)

  const validationErrors = useMemo(() => getBookingFormValidationErrors(form), [form])
  const hasClientErrors = Object.values(validationErrors).some(Boolean)
  const summaryLength = form.subject_summary.length

  const updateField = useCallback(
    <K extends keyof BookingRequestPayload>(field: K, value: BookingRequestPayload[K]) => {
      setForm((current) => ({ ...current, [field]: value }))
    },
    [],
  )

  const handleNameChange = useCallback((value: string) => {
    updateField('name', normalizeNameInput(value))
    setFieldErrors((current) => ({ ...current, name: '' }))
  }, [updateField])

  const handleEmailChange = useCallback((value: string) => {
    updateField('email', normalizeEmailInput(value))
    setFieldErrors((current) => ({ ...current, email: '' }))
  }, [updateField])

  const handlePhoneChange = useCallback((value: string) => {
    updateField('phone', formatPhoneInput(value))
    setFieldErrors((current) => ({ ...current, phone: '' }))
  }, [updateField])

  const handleSummaryChange = useCallback((value: string) => {
    updateField('subject_summary', sanitizeSummaryInput(value))
    setFieldErrors((current) => ({ ...current, subject_summary: '' }))
  }, [updateField])

  const handleSubmit = useCallback(async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedSlotId) {
      setSubmitError('Selecione um horário antes de enviar.')
      return
    }

    const nextErrors = getBookingFormValidationErrors(form)
    setFieldErrors(nextErrors)

    if (Object.values(nextErrors).some(Boolean)) {
      setSubmitError('Revise os campos destacados antes de enviar.')
      return
    }

    try {
      setLoadingSubmit(true)
      setSubmitError('')
      setSuccessMessage('')
      setSuccessPayload(null)

      const payload: BookingRequestPayload = {
        slot_id: selectedSlotId,
        name: form.name.trim(),
        email: normalizeEmailInput(form.email),
        phone: form.phone,
        subject_summary: form.subject_summary.trim(),
      }

      const data = await bookingApiClient.createBooking(payload)

      await onSubmitSuccess?.()

      setSuccessPayload(data)
      setSuccessMessage(
        'Pré-agendamento enviado com sucesso. Reservamos este horário temporariamente e enviamos um e-mail de confirmação para dar continuidade à sua solicitação.',
      )
      setForm(initialBookingForm)
      setFieldErrors(initialFieldErrors)
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível enviar sua solicitação agora.',
      )
    } finally {
      setLoadingSubmit(false)
    }
  }, [form, onSubmitSuccess, selectedSlotId])

  const clearMessages = useCallback(() => {
    setSubmitError('')
    setSuccessMessage('')
    setSuccessPayload(null)
  }, [])

  return {
    form,
    fieldErrors,
    loadingSubmit,
    submitError,
    successMessage,
    successPayload,
    hasClientErrors,
    summaryLength,
    handleNameChange,
    handleEmailChange,
    handlePhoneChange,
    handleSummaryChange,
    handleSubmit,
    clearMessages,
  }
}