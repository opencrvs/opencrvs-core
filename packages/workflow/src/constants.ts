export const HOST = process.env.HOST || '0.0.0.0'
export const PORT = process.env.PORT || 5050
export const HEARTH_URL = process.env.HEARTH_URL || 'http://localhost:3447/fhir'
export const OPENHIM_URL = process.env.OPENHIM_URL || 'http://localhost:5001'
export const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:2020/'
export const COUNTRY = process.env.COUNTRY || 'bgd'
export const RESOURCE_SERVICE_URL =
  process.env.RESOURCE_SERVICE_URL || `http://localhost:3040/${COUNTRY}/`
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const BRN_GENERATOR_CODE = process.env.BRN_GENERATOR_CODE || 'bd'
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'
export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
// Check if the token has been invalided in the auth service before it has expired
// This needs to be a string to make it easy to pass as an ENV var.
export const CHECK_INVALID_TOKEN = process.env.CHECK_INVALID_TOKEN || 'false'
