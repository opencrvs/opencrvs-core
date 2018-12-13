export const FHIR_URL = process.env.FHIR_URL || 'http://localhost:5001/fhir'
export const USER_MGNT_SERVICE_URL =
  process.env.USER_MGNT_SERVICE_URL || 'http://localhost:3030/'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const COUNTRY = process.env.COUNTRY || 'bgd'
