export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:5001/fhir'
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const SEARCH_URL = process.env.SEARCH_URL || 'http://localhost:9090/'
export const METRICS_URL =
  process.env.METRICS_URL || 'http://localhost:5001/metrics'
export const COUNTRY = process.env.COUNTRY || 'bgd'
export const AUTH_URL = process.env.AUTH_URL || 'http://localhost:4040'
// Check if the token has been invalided in the auth service before it has expired
// This needs to be a string to make it easy to pass as an ENV var.
export const CHECK_INVALID_TOKEN = process.env.CHECK_INVALID_TOKEN || 'false'
