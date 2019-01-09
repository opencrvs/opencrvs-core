export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:5050/fhir'
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const COUNTRY = process.env.COUNTRY || 'bgd'
