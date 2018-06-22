export const fhirUrl = process.env.FHIR_URL || 'http://localhost:5001/fhir'

export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
