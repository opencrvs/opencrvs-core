export const HOST = process.env.AUTH_HOST || '0.0.0.0'
export const PORT = process.env.AUTH_PORT || 5050
export const HEARTH_URL = process.env.HEARTH_URL || 'http://localhost:3447/fhir'
export const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:2020/'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const BRN_GENERATOR_CODE = process.env.BRN_GENERATOR_CODE || 'bd'
export const USER_MGNT_SERVICE_URL =
  process.env.USER_MGNT_SERVICE_URL || 'http://localhost:3030/'
export const COUNTRY = process.env.COUNTRY || 'bgd'
