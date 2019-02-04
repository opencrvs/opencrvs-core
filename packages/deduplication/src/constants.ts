export const HOST = process.env.AUTH_HOST || '0.0.0.0'
export const PORT = process.env.AUTH_PORT || 9090
export const ES_HOST = process.env.ES_HOST || 'localhost:9200'
export const HEARTH_URL = process.env.HEARTH_URL || 'http://localhost:3447/fhir'
export const CERT_PUBLIC_KEY_PATH =
  (process.env.CERT_PUBLIC_KEY_PATH as string) ||
  '../../.secrets/public-key.pem'
export const USER_MANAGEMENT_URL =
  process.env.USER_MANAGEMENT_URL || 'http://localhost:3030/'
export const MATCH_SCORE_THRESHOLD = 1.0
