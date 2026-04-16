import { useMemo, useState } from 'react'
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
  onSubmitSuccess?: () => void
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

  function updateField<K extends keyof BookingRequestPayload>(field: K, value: BookingRequestPayload[K]) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function handleNameChange(value: string) {
    updateField('name', normalizeNameInput(value))
    setFieldErrors((current) => ({ ...current, name: '' }))
  }

  function handleEmailChange(value: string) {
    updateField('email', normalizeEmailInput(value))
    setFieldErrors((current) => ({ ...current, email: '' }))
  }

  function handlePhoneChange(value: string) {
    updateField('phone', formatPhoneInput(value))
    setFieldErrors((current) => ({ ...current, phone: '' }))
  }

  function handleSummaryChange(value: string) {
    updateField('subject_summary', sanitizeSummaryInput(value))
    setFieldErrors((current) => ({ ...current, subject_summary: '' }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
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

      const payload: BookingRequestPayload = {
        slot_id: selectedSlotId,
        name: form.name.trim(),
        email: normalizeEmailInput(form.email),
        phone: form.phone,
        subject_summary: form.subject_summary.trim(),
      }

      const data = await bookingApiClient.createBooking(payload)

      setSuccessPayload(data)
      setSuccessMessage(
        'Pré-agendamento enviado. Agora vamos encaminhar a confirmação para o seu e-mail antes da análise final.',
      )
      setForm(initialBookingForm)
      setFieldErrors(initialFieldErrors)
      onSubmitSuccess?.()
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Não foi possível enviar sua solicitação agora.',
      )
    } finally {
      setLoadingSubmit(false)
    }
  }

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
    clearMessages: () => {
      setSubmitError('')
      setSuccessMessage('')
    },
  }
}
