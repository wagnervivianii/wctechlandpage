import type { BookingFieldErrors, BookingRequestPayload } from '../types/booking'
import { getPhoneDigitsInput } from './bookingFormatters'
import { isValidEmailFormat } from './textRules'

export function getBookingFormValidationErrors(form: BookingRequestPayload): BookingFieldErrors {
  const errors: BookingFieldErrors = {
    name: '',
    email: '',
    phone: '',
    subject_summary: '',
  }

  const cleanName = form.name.trim()
  const phoneDigits = getPhoneDigitsInput(form.phone)
  const cleanSummary = form.subject_summary.trim()

  if (cleanName.length < 3) {
    errors.name = 'Informe o nome completo com pelo menos 3 caracteres.'
  }

  if (!isValidEmailFormat(form.email)) {
    errors.email = 'Informe um e-mail válido.'
  }

  if (!(phoneDigits.length === 10 || phoneDigits.length === 11)) {
    errors.phone = 'Informe um telefone válido com DDD.'
  }

  if (cleanSummary.length < 50) {
    errors.subject_summary = 'Descreva o contexto com pelo menos 50 caracteres.'
  } else if (cleanSummary.length > 500) {
    errors.subject_summary = 'O resumo deve ter no máximo 500 caracteres.'
  } else if (/\d/.test(cleanSummary)) {
    errors.subject_summary = 'O resumo deve conter apenas texto, sem números.'
  }

  return errors
}