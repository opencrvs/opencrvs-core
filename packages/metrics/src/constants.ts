export const HOST = process.env.AUTH_HOST || 'localhost'
export const PORT = process.env.AUTH_PORT || 1050
export const fhirUrl = process.env.FHIR_URL || 'http://localhost:5001/fhir'
export const NOTIFICATION_SERVICE_URL =
  process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:2020/'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'
