import {
  formatPhoneText,
  getPhoneDigits,
  normalizeEmailText,
  normalizeNameText,
  sanitizeSummaryText,
} from './textRules'

export function normalizeNameInput(value: string) {
  return normalizeNameText(value)
}

export function normalizeEmailInput(value: string) {
  return normalizeEmailText(value)
}

export function formatPhoneInput(value: string) {
  return formatPhoneText(value)
}

export function getPhoneDigitsInput(value: string) {
  return getPhoneDigits(value)
}

export function sanitizeSummaryInput(value: string) {
  return sanitizeSummaryText(value)
}
