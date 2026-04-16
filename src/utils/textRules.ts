import {
  EMAIL_FORMAT_REGEX,
  NAME_ALLOWED_CHARS_REGEX,
  PHONE_NON_DIGITS_REGEX,
  SUMMARY_DIGITS_REGEX,
  SUMMARY_NON_TEXT_REGEX,
} from './patterns'

export function normalizeNameText(value: string) {
  return value
    .normalize('NFC')
    .replace(NAME_ALLOWED_CHARS_REGEX, '')
    .replace(/\s+/g, ' ')
    .replace(/^\s+/, '')
    .toUpperCase()
}

export function normalizeEmailText(value: string) {
  return value.trim().toLowerCase()
}

export function getPhoneDigits(value: string) {
  return value.replace(PHONE_NON_DIGITS_REGEX, '')
}

export function formatPhoneText(value: string) {
  const digits = getPhoneDigits(value).slice(0, 11)

  if (digits.length <= 2) {
    return digits
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function sanitizeSummaryText(value: string) {
  return value
    .normalize('NFC')
    .replace(SUMMARY_DIGITS_REGEX, '')
    .replace(SUMMARY_NON_TEXT_REGEX, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .slice(0, 500)
}

export function isValidEmailFormat(value: string) {
  return EMAIL_FORMAT_REGEX.test(value)
}
