export const fhirUrl = process.env.FHIR_URL || 'http://localhost:5001/fhir'
export const WORKFLOW_SERVICE_URL =
  process.env.WORKFLOW_SERVICE_URL || 'http://localhost:5050/'
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const COUNTRY = process.env.COUNTRY || 'bgd'
